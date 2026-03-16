import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────
// 🚀 PRODUCTION: When your backend is deployed (Railway/Render),
//    replace the string below with your public URL, e.g.:
//    const PRODUCTION_BACKEND_URL = 'https://legal-iq-api.up.railway.app';
//    Then set android / ios / default to PRODUCTION_BACKEND_URL.
// ─────────────────────────────────────────────────────────────

// Local backend URL (this is your Mac's current Wi-Fi IP address)
const LOCAL_BACKEND_URL = 'http://192.168.6.30:3000';

const BASE_URL = Platform.select({
    web: LOCAL_BACKEND_URL,
    android: LOCAL_BACKEND_URL,
    ios: LOCAL_BACKEND_URL,
    default: LOCAL_BACKEND_URL,
});

const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    timeout: 12000,
});

api.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
            config.headers['user-id'] = token;
        }
    } catch (e) {
        // failed to get token
    }
    return config;
});

export const getFileUrl = (filename: string) => {
    return `${BASE_URL}/uploads/${filename}`;
};

export const signup = async (data: { name: string; email: string; phone: string; role?: string; uploadedDocIds?: string[] }) => {
    try {
        const response = await api.post('/auth/signup', data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.error || "Error during signup";
    }
};

export const login = async (data: { phone: string }) => {
    try {
        const response = await api.post('/auth/login', data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.error || "Error during login";
    }
};

export const sendOtp = async (data: { phone: string, checkExists?: boolean }) => {
    try {
        const response = await api.post('/auth/send-otp', data);
        console.log(`OTP for ${data.phone}: ${response.data?.otp}`);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.error || "Error sending OTP";
    }
};

export const uploadDocument = async (file: any, caseId: string, docType?: string, onUploadProgress?: (progress: number, loaded: number, total: number) => void) => {
    const formData = new FormData();
    formData.append('caseId', caseId);
    if (docType) {
        formData.append('docType', docType);
    }

    if (Platform.OS === 'web' && file.file) {
        formData.append('file', file.file);
    } else {
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.type || file.mimeType || 'application/octet-stream',
        } as any);
    }

    console.log("📤 Preparing to upload file via FormData:", {
        uri: file.uri,
        name: file.name,
        type: file.type || file.mimeType || 'application/octet-stream'
    });

    try {
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onUploadProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
                }
            },
        });
        console.log("📥 Upload success response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Error uploading document:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
};

export const getDocuments = async (caseId?: string) => {
    try {
        const response = await api.get('/documents', {
            params: { caseId }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
};

export const deleteDocument = async (id: string) => {
    try {
        await api.delete(`/documents/${id}`);
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
};

export const getNotes = async (caseId: string) => {
    try {
        const response = await api.get('/notes', {
            params: { caseId }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching notes:", error);
        throw error;
    }
};

export const createNote = async (content: string, caseId: string) => {
    try {
        const response = await api.post('/notes', { content, caseId });
        return response.data;
    } catch (error) {
        console.error("Error creating note:", error);
        throw error;
    }
};

export const deleteNote = async (id: string) => {
    try {
        await api.delete(`/notes/${id}`);
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
};

export const getPayments = async (caseId: string) => {
    try {
        const response = await api.get('/payments', {
            params: { caseId }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching payments:", error);
        throw error;
    }
};

export const createPayment = async (paymentData: { amount: number, status: 'Paid' | 'Pending', description: string, caseId: string }) => {
    try {
        const response = await api.post('/payments', paymentData);
        return response.data;
    } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
    }
};

export const deletePayment = async (id: string) => {
    try {
        await api.delete(`/payments/${id}`);
    } catch (error) {
        console.error("Error deleting payment:", error);
        throw error;
    }
};

export const getCases = async () => {
    try {
        const response = await api.get('/cases');
        return response.data;
    } catch (error) {
        console.error("Error fetching cases:", error);
        throw error;
    }
};

export const getCaseById = async (id: string) => {
    try {
        const response = await api.get(`/cases/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching case details:", error);
        throw error;
    }
};

export const createCase = async (caseData: any) => {
    try {
        const response = await api.post('/cases', caseData);
        return response.data;
    } catch (error) {
        console.error("Error creating case:", error);
        throw error;
    }
};

export const updateHearingDate = async (id: string, date: string) => {
    try {
        const response = await api.patch(`/cases/${id}/hearing`, { nextHearing: date });
        return response.data;
    } catch (error) {
        console.error("Error updating hearing date:", error);
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

export const updateProfile = async (data: { name?: string; firmName?: string; barId?: string; selfie_url?: string; biometrics_enabled?: boolean }) => {
    try {
        const response = await api.put('/user/profile', data);
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get('/user/all');
        return response.data;
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
};

export const updateUserStatus = async (id: string, status: string, role: string) => {
    try {
        const response = await api.patch(`/user/${id}/status`, { status, role });
        return response.data;
    } catch (error) {
        console.error("Error updating user status:", error);
        throw error;
    }
};

export const deleteUserAccount = async (id: string) => {
    try {
        const response = await api.delete(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

export const createUserAdmin = async (userData: { name: string, email: string, phone: string, role?: string, status?: string }) => {
    try {
        const response = await api.post('/user/create', userData);
        return response.data;
    } catch (error: any) {
        console.error("Error creating user:", error);
        throw error.response?.data?.message || "Error creating user";
    }
};

export const getCaseAnalysis = async (id: string) => {
    try {
        const response = await api.get(`/cases/${id}/analysis`);
        return response.data;
    } catch (error) {
        console.error("Error fetching case analysis:", error);
        throw error;
    }
};

export const queryAI = async (query: string, caseId?: string) => {
    try {
        const response = await api.post('/ai/query', { query, caseId });
        return response.data;
    } catch (error) {
        console.error("Error querying AI:", error);
        throw error;
    }
};

export const getAIInsights = async (caseId: string) => {
    try {
        const response = await api.get(`/ai/insights/${caseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI insights:", error);
        throw error;
    }
};

export const closeCase = async (id: string) => {
    try {
        const response = await api.post(`/cases/${id}/close`);
        return response.data;
    } catch (error) {
        console.error("Error closing case:", error);
        throw error;
    }
};

export const updateCaseDeal = async (id: string, totalFixedAmount: number) => {
    try {
        const response = await api.patch(`/cases/${id}/deal`, { totalFixedAmount });
        return response.data;
    } catch (error) {
        console.error("Error updating case deal:", error);
        throw error;
    }
};

export const getReminders = async () => {
    try {
        const response = await api.get('/reminders');
        return response.data;
    } catch (error) {
        console.error("Error fetching reminders:", error);
        throw error;
    }
};

export const createReminder = async (reminderData: { title: string, date: string, time?: string }) => {
    try {
        const response = await api.post('/reminders', reminderData);
        return response.data;
    } catch (error) {
        console.error("Error creating reminder:", error);
        throw error;
    }
};

export const deleteReminder = async (id: string) => {
    try {
        await api.delete(`/reminders/${id}`);
    } catch (error) {
        console.error("Error deleting reminder:", error);
        throw error;
    }
};
