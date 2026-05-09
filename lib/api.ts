export const BASE = 'https://diagnovate-backend-production-f341.up.railway.app';

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

interface RawResponse {
    token?: string;
    access_token?: string;
    jwt?: string;
    message?: string;
    error?: string;
    identifier?: string;
    next_step?: string;
    email?: string;
    doctor?: Doctor;
    admin?: Record<string, unknown>;
    user?: Record<string, unknown>;
    data?: unknown;
    success?: boolean;
    channel?: string;
}

interface Doctor {
    id?: number;
    name?: string;
    email?: string;
    specialty?: string;
    phone?: string;
    license_number?: string;
    [key: string]: unknown;
}

export interface LoginResult {
    token: string;
    user: Doctor | null;
    otpRequired?: boolean;
    identifier?: string;
    channel?: string;
}

export interface VerifyOtpResult {
    next_step?: string;
    email?: string;
    token: string | null;
    user?: Doctor | null;
}

// ── Case (Ultrasound) ────────────────────────────────────────────────────────
export interface Case {
    id?: number;
    case_id?: string;
    patient_id?: number;
    patient_name?: string;
    doctor_id?: number;
    nodule_size?: string;
    location?: string;
    tirads_score?: number;
    bethesda_category?: string;
    symptoms?: string;
    diagnosis?: string;
    notes?: string;
    status?: string;
    image_path?: string;
    enhanced_image_path?: string;
    created_at?: string;
    updated_at?: string;
}

// ── Patient ──────────────────────────────────────────────────────────────────
export interface Patient {
    id?: string;
    mrn?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    age?: number;
    gender?: string;
    phone?: string;
    email?: string;
    lastVisit?: string;
    status?: string;
    condition?: string;
    address?: string;
    doctor_id?: number;
    created_at?: string;
}

// ── Diagnosis ────────────────────────────────────────────────────────────────
export interface DiagnosisResult {
    success: boolean;
    diagnosis: string;
    raw_label: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    model_used: string;
    probabilities: Record<string, number>;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });

    const data = await res.json();

    if (!res.ok) {
        const msg =
            typeof data === 'string'
                ? data
                : (data as RawResponse)?.message ?? (data as RawResponse)?.error ?? `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data as T;
}

/* ── AUTH ── */
export const auth = {

    login: async (email: string, password: string): Promise<LoginResult> => {
        const raw = await request<RawResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ identifier: email, password }),
        });

        const token = raw?.token ?? raw?.access_token ?? raw?.jwt;

        // OTP flow (production mode)
        if (!token && raw?.success && raw?.identifier) {
            return { token: '', user: null, otpRequired: true, identifier: raw.identifier, channel: raw.channel };
        }

        if (!token) throw new Error('No token received from server.');

        localStorage.setItem('token', token);
        if (raw?.user) localStorage.setItem('user', JSON.stringify(raw.user));

        return { token, user: raw?.doctor ?? null };
    },

    signup: async (payload: Record<string, unknown>): Promise<RawResponse> => {
        const raw = await request<RawResponse>('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (raw?.identifier) {
            localStorage.setItem('otp_identifier', raw.identifier);
        }

        return raw;
    },

    verifyOtp: async (identifier: string, code: string): Promise<VerifyOtpResult> => {
        const raw = await request<RawResponse>('/api/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier, code }),
        });

        if (raw?.next_step === 'verify_email') {
            const pendingToken = raw?.token ?? raw?.access_token ?? raw?.jwt ?? null;
            if (pendingToken && raw?.doctor) localStorage.setItem('user', JSON.stringify(raw.doctor));
            return { next_step: 'verify_email', email: raw.email ?? '', token: pendingToken ?? null };
        }

        const token = raw?.token ?? raw?.access_token ?? raw?.jwt;
        if (!token) throw new Error('OTP verification failed.');

        localStorage.setItem('token', token);
        if (raw?.doctor) localStorage.setItem('user', JSON.stringify(raw.doctor));

        return { token, user: raw?.doctor ?? null };
    },

    adminLogin: async (email: string, password: string): Promise<LoginResult> => {
        const raw = await request<RawResponse>('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const token = raw?.token ?? raw?.access_token;
        if (!token) throw new Error('No token received from server.');
        return { token, user: (raw?.admin ?? raw?.user ?? null) as Doctor | null };
    },

    verifyEmailOtp: async (email: string, code: string, skip = false): Promise<{ token: string | null; user: Doctor | null }> => {
        const raw = await request<RawResponse>('/api/auth/verify-email-otp', {
            method: 'POST',
            body: JSON.stringify(skip ? { email, skip: true } : { email, code }),
        });
        const token = raw?.token ?? raw?.access_token ?? raw?.jwt;
        if (token) localStorage.setItem('token', token);
        if (raw?.doctor) localStorage.setItem('user', JSON.stringify(raw.doctor));
        return { token: token ?? null, user: raw?.doctor ?? null };
    },

    sendOtp: async (identifier: string, method: string): Promise<RawResponse> => {
        return await request<RawResponse>('/api/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier, method }),
        });
    },

    resendOtp: async (identifier: string): Promise<RawResponse> => {
        return await request<RawResponse>('/api/auth/send-phone-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier }),
        });
    },

    resendEmailOtp: async (email: string): Promise<RawResponse> => {
        return await request<RawResponse>('/api/auth/send-email-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    checkStatus: async (): Promise<RawResponse> => {
        return await request<RawResponse>('/api/auth/status');
    },

    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('otp_identifier');
    },
};

/* ── DASHBOARD ── */
export const dashboard = {
    getStats:              () => request('/api/dashboard/stats'),
    getRecentCases:        () => request('/api/dashboard/recent-cases'),
    getCasesByStatus:      () => request('/api/dashboard/cases-by-status'),
    getTiradsDistribution: () => request('/api/dashboard/tirads-distribution'),
};

/* ── PATIENTS ── */
export const patients = {
    list:   ()                                        => request<{ success: boolean; data: Patient[] }>('/api/patients'),
    get:    (patientId: string)                       => request<{ success: boolean; data: Patient }>(`/api/patients/${patientId}`),
    create: (body: Record<string, unknown>)           => request<{ success: boolean; data: Patient }>('/api/patients', { method: 'POST', body: JSON.stringify(body) }),
    update: (patientId: string, body: Record<string, unknown>) => request<{ success: boolean; data: Patient }>(`/api/patients/${patientId}`, { method: 'PUT',   body: JSON.stringify(body) }),
    patch:  (patientId: string, body: Record<string, unknown>) => request<{ success: boolean; data: Patient }>(`/api/patients/${patientId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (patientId: string)                       => request<{ success: boolean }>(`/api/patients/${patientId}`, { method: 'DELETE' }),
};

/* ── CASES (Ultrasound only) ── */
export const cases = {
    list: (params: Record<string, string> = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request<{ success: boolean; data: Case[] }>(`/api/cases${qs ? '?' + qs : ''}`);
    },
    get:          (caseId: string)                       => request<{ success: boolean; data: Case }>(`/api/cases/${caseId}`),
    create:       (body: Record<string, unknown>)        => request<{ success: boolean; data: Case }>('/api/cases', { method: 'POST',   body: JSON.stringify(body) }),
    update:       (caseId: string, body: Record<string, unknown>) => request<{ success: boolean; data: Case }>(`/api/cases/${caseId}`, { method: 'PUT', body: JSON.stringify(body) }),
    updateStatus: (caseId: string, status: string)       => request<{ success: boolean; status: string }>(`/api/cases/${caseId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete:       (caseId: string)                       => request<{ success: boolean }>(`/api/cases/${caseId}`, { method: 'DELETE' }),
};

/* ── PROFILE ── */
export const profile = {
    get:    ()                              => request('/api/profile'),
    update: (body: Record<string, unknown>) => request('/api/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

/* ── IMAGE ENHANCEMENT (Ultrasound only) ── */
export const enhance = {
    upload: (formData: FormData): Promise<{
        success: boolean;
        original_image: string;
        enhanced_image: string;
        sr_method: string;
        scan_type: string;
        original_size: { width: number; height: number };
        enhanced_size: { width: number; height: number };
    }> =>
        fetch(`${BASE}/api/enhance`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
            },
            body: formData,
        }).then((r) => r.json()),
};

/* ── AI DIAGNOSIS ── */
export const diagnosis = {
    predict:   (body: Record<string, unknown>) => request<DiagnosisResult>('/api/diagnosis/predict', { method: 'POST', body: JSON.stringify(body) }),
    getFields: ()                              => request<{ success: boolean; required_fields: string[]; model_name: string }>('/api/diagnosis/fields'),
};

/* ── RECENT ACTIVITY (IndexedDB — Ultrasound only) ── */
interface PatientLike {
    mrn: string;
    id: string;
    firstName: string;
    lastName: string;
}

export interface ActivityItem {
    patientName: string;
    patientMrn: string;
    patientId: string;
    action: string;
    detail: string;
    type: string;
    date: string;
    imgSrc: string;
}

export async function getRecentActivity(patientsList: PatientLike[]): Promise<ActivityItem[]> {
    try {
        const DB_NAME = 'diagnovate_images';
        const STORE   = 'patient_images';

        const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onsuccess       = () => resolve(req.result);
            req.onerror         = () => reject(req.error);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains(STORE))
                    req.result.createObjectStore(STORE);
            };
        });

        const activity: ActivityItem[] = [];

        for (const patient of patientsList) {
            for (const key of [patient.mrn, patient.id]) {
                const imgs = await new Promise<Record<string, string>[]>((resolve) => {
                    const tx = db.transaction(STORE, 'readonly');
                    const r  = tx.objectStore(STORE).get(key);
                    r.onsuccess = () => resolve(r.result || []);
                    r.onerror   = () => resolve([]);
                });

                for (const img of imgs) {
                    // Ultrasound only — skip MRI / X-Ray
                    if (img.type && !img.type.toLowerCase().includes('ultrasound')) continue;

                    activity.push({
                        patientName: `${patient.firstName} ${patient.lastName}`,
                        patientMrn:  patient.mrn,
                        patientId:   patient.mrn,
                        action:      'Image Enhancement',
                        detail:      img.label || 'Ultrasound scan',
                        type:        img.type,
                        date:        img.date,
                        imgSrc:      img.enhancedSrc || img.originalSrc,
                    });
                }
            }
        }

        return activity
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter((item, idx, arr) =>
                arr.findIndex(x => x.date === item.date && x.patientMrn === item.patientMrn) === idx
            )
            .slice(0, 10);

    } catch {
        return [];
    }
}