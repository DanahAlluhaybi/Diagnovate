const BASE = 'http://localhost:5002';

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
    /**
     * Login — normalizes Flask response whether it returns
     * a plain string token or an object { token, user }
     */
    login: async (email, password) => {
        const raw = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (typeof raw === 'string') {
            return { token: raw, user: null };
        }

        const token = raw?.token ?? raw?.access_token ?? raw?.jwt;
        if (!token) throw new Error('No token received from server.');
        return { token, user: raw?.user ?? null };
    },

    signup: (payload) =>
        request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

/* ── DASHBOARD ── */
export const dashboard = {
    getStats:       () => request('/api/dashboard/stats'),
    getRecentCases: () => request('/api/dashboard/recent-cases'),
};

/* ── PATIENTS ── */
export const patients = {
    list:   ()       => request('/api/patients'),
    create: (body)   => request('/api/patients', { method: 'POST', body: JSON.stringify(body) }),
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