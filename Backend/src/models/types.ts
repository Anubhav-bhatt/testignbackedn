export interface User {
    id: string;
    name: string;
    email: string;
    firmName: string;
    barId: string;
    specialization: string;
    avatar: string;
    summary: {
        totalCases: number;
        activeClients: number;
        pendingTasks: number;
    };
}

export interface Case {
    id: string;
    caseId: string;
    title: string;
    clientName: string;
    clientImage: string;
    category: string;
    court: string;
    nextHearing: string;
    status: string;
    statusColor: string;
    lawyerId: string; // Linking to User
    total_fixed_amount?: number;
}

export interface Document {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    caseId: string;
    createdAt: Date;
}

export interface Payment {
    id: string;
    amount: number;
    status: 'Paid' | 'Pending';
    date: Date;
    description: string;
    caseId: string;
}

export interface Note {
    id: string;
    content: string;
    caseId: string;
    createdAt: Date;
}

export interface Hearing {
    id: string;
    caseId: string;
    date: string; // Using string to match the current date format in mock data
    purpose: string;
    status: 'Past' | 'Upcoming';
    documentIds: string[]; // Associated document IDs
}

export interface Reminder {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string;
    completed: boolean;
    lawyerId: string;
}
