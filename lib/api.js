// lib/api.js
const API_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
    console.log(`Making request to: ${API_URL}${endpoint}`);
    console.log('Options:', options);

    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
    }

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'include'
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const auth = {
    signup: async (userData) => {
        console.log('Signup attempt with:', userData);
        return request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    login: async (credentials) => {
        console.log('Login attempt with:', credentials.email);
        return request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
};

export default { auth };