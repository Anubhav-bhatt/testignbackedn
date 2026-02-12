
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
    web: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
});

const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
});

export const getFileUrl = (filename: string) => {
    return `${BASE_URL}/uploads/${filename}`;
};

export const uploadDocument = async (file: any, caseId: string, onUploadProgress?: (progress: number, loaded: number, total: number) => void) => {
    const formData = new FormData();
    formData.append('caseId', caseId);

    if (Platform.OS === 'web' && file.file) {
        formData.append('file', file.file);
    } else {
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream',
        } as any);
    }

    try {
        const response = await api.post('/documents/upload', formData, {
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onUploadProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
                }
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading document:", error);
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
        const response = await api.post('/cases/chat', { query, caseId });
        return response.data;
    } catch (error) {
        console.error("Error querying AI:", error);
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
