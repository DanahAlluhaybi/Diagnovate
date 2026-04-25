export const BASE = 'https://diagnovate-backend-production-f341.up.railway.app';

async function request(path, options = {}) {
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
                : data?.message ?? data?.error ?? `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}

/* ── AUTH ── */
export const auth = {

    login: async (email, password) => {
        const raw = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ identifier: email, password }),
        });

        const token = raw?.token ?? raw?.access_token ?? raw?.jwt;
        if (!token) throw new Error('No token received from server.');

        localStorage.setItem('token', token);
        if (raw?.doctor) localStorage.setItem('user', JSON.stringify(raw.doctor));

        return { token, user: raw?.doctor ?? null };
    },

    signup: async (payload) => {
        const raw = await request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (raw?.identifier) {
            localStorage.setItem('otp_identifier', raw.identifier);
        }

        return raw;
    },

    verifyOtp: async (identifier, code) => {
        const raw = await request('/api/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier, code }),
        });

        const token = raw?.token ?? raw?.access_token ?? raw?.jwt;
        if (!token) throw new Error('OTP verification failed.');

        localStorage.setItem('token', token);
        if (raw?.doctor) localStorage.setItem('user', JSON.stringify(raw.doctor));

        return { token, user: raw?.doctor ?? null };
    },

    adminLogin: async (email, password) => {
        const raw = await request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const token = raw?.token ?? raw?.access_token;
        if (!token) throw new Error('No token received from server.');
        return { token, user: raw?.admin ?? raw?.user ?? null };
    },

    resendOtp: async (identifier) => {
        return await request('/api/auth/send-phone-otp', {
            method: 'POST',
            body: JSON.stringify({ identifier }),
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('otp_identifier');
    },
};

/* ── DASHBOARD ── */
export const dashboard = {
    getStats:       () => request('/api/dashboard/stats'),
    getRecentCases: () => request('/api/dashboard/recent-cases'),
};

/* ── PATIENTS ── */
export const patients = {
    list:   ()     => request('/api/patients'),
    create: (body) => request('/api/patients', { method: 'POST', body: JSON.stringify(body) }),
};

/* ── PROFILE ── */
export const profile = {
    get:    ()     => request('/api/profile'),
    update: (body) => request('/api/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

/* ── IMAGE ENHANCEMENT ── */
export const enhance = {
    upload: (formData) =>
        fetch(`${BASE}/api/enhance`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
            },
            body: formData,
        }).then((r) => r.json()),
};

/* ── RECENT ACTIVITY ── */
export async function getRecentActivity(patientsList) {
    try {
        const DB_NAME = 'diagnovate_images';
        const STORE   = 'patient_images';

        const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onsuccess       = () => resolve(req.result);
            req.onerror         = () => reject(req.error);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains(STORE))
                    req.result.createObjectStore(STORE);
            };
        });

        const activity = [];

        for (const patient of patientsList) {
            for (const key of [patient.mrn, patient.id]) {
                const imgs = await new Promise((resolve) => {
                    const tx = db.transaction(STORE, 'readonly');
                    const r  = tx.objectStore(STORE).get(key);
                    r.onsuccess = () => resolve(r.result || []);
                    r.onerror   = () => resolve([]);
                });

                for (const img of imgs) {
                    activity.push({
                        patientName: `${patient.firstName} ${patient.lastName}`,
                        patientMrn:  patient.mrn,
                        patientId:   patient.mrn,
                        action:      'Image Enhancement',
                        detail:      img.label || `${img.type} scan`,
                        type:        img.type,
                        date:        img.date,
                        imgSrc:      img.enhancedSrc || img.originalSrc,
                    });
                }
            }
        }

        return activity
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .filter((item, idx, arr) =>
                arr.findIndex(x => x.date === item.date && x.patientMrn === item.patientMrn) === idx
            )
            .slice(0, 10);

    } catch {
        return [];
    }
}