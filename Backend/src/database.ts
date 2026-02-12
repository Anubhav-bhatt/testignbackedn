import { Case, Document, Hearing, Note, Payment, User } from "./models/types";

// A Mock Database that ensures data integrity and relationships
class Database {
    private users: User[] = [
        {
            id: "u1",
            name: "Anubhav Bhatt",
            email: "anubhav@legal-iq.com",
            firmName: "Bhatt & Associates",
            barId: "D-1234/2015",
            specialization: "Corporate & Civil Law",
            avatar: "https://i.pravatar.cc/150?u=lawyer1",
            summary: {
                totalCases: 45,
                activeClients: 12,
                pendingTasks: 8
            }
        }
    ];

    private cases: Case[] = [
        {
            id: "1",
            caseId: "CIV-2024-001",
            title: "Boundary Dispute: Sharma vs. Municipal Corp",
            clientName: "Rakesh Sharma",
            clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            category: "Civil",
            court: "High Court, Delhi",
            nextHearing: "15 Feb, 2026",
            status: "Evidence",
            statusColor: "#3B82F6",
            lawyerId: "u1"
        },
        {
            id: "2",
            caseId: "CRI-2025-089",
            title: "State vs. Malhotra (302 IPC)",
            clientName: "Vivek Malhotra",
            clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            category: "Criminal",
            court: "Trial Court, Rohini",
            nextHearing: "20 Feb, 2026",
            status: "Cross-Examination",
            statusColor: "#EF4444",
            lawyerId: "u1"
        },
        {
            id: "3",
            caseId: "CIV-2025-012",
            title: "Recovery Suite: Zenith vs. Axis Bank",
            clientName: "Sunil Gupta (Zenith Ltd)",
            clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
            category: "Civil",
            court: "District Court, Noida",
            nextHearing: "02 Mar, 2026",
            status: "Arguments",
            statusColor: "#3B82F6",
            lawyerId: "u1"
        },
        {
            id: "4",
            caseId: "CRI-2026-003",
            title: "NCB vs. Sameer Khan (NDPS Act)",
            clientName: "Sameer Khan",
            clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
            category: "Criminal",
            court: "High Court, Mumbai",
            nextHearing: "25 Feb, 2026",
            status: "Bail Hearing",
            statusColor: "#EF4444",
            lawyerId: "u1"
        },
        {
            id: "5",
            caseId: "CIV-2026-112",
            title: "Lease Dispute: DLF Mall vs. Retailers",
            clientName: "Ajay Verma",
            clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704a",
            category: "Civil",
            court: "District Court, Saket",
            nextHearing: "10 Mar, 2026",
            status: "Mediation",
            statusColor: "#3B82F6",
            lawyerId: "u1"
        }
    ];

    public payments: Payment[] = [];
    public documents: Document[] = [
        {
            id: "d1",
            filename: "written_statement.pdf",
            originalName: "Written Statement - Sharma.pdf",
            mimeType: "application/pdf",
            size: 1024 * 350,
            caseId: "1",
            createdAt: new Date("2026-01-24T10:00:00Z")
        },
        {
            id: "d2",
            filename: "site_map.jpg",
            originalName: "Disputed Site Map.jpg",
            mimeType: "image/jpeg",
            size: 1024 * 850,
            caseId: "1",
            createdAt: new Date("2026-01-10T11:30:00Z")
        }
    ];
    public notes: Note[] = [];
    public hearings: Hearing[] = [
        {
            id: "h1",
            caseId: "1",
            date: "10 Jan, 2026",
            purpose: "Initial Appearance",
            status: "Past",
            documentIds: ["d2"]
        },
        {
            id: "h2",
            caseId: "1",
            date: "25 Jan, 2026",
            purpose: "Filing of Written Statement",
            status: "Past",
            documentIds: ["d1"]
        },
        {
            id: "h3",
            caseId: "1",
            date: "15 Feb, 2026",
            purpose: "Evidence Submission",
            status: "Upcoming",
            documentIds: []
        },
        {
            id: "h4",
            caseId: "2",
            date: "05 Feb, 2026",
            purpose: "Bail Argument",
            status: "Past",
            documentIds: []
        }
    ];

    // User Methods
    getUserById(id: string) {
        return this.users.find(u => u.id === id);
    }

    // Case Methods
    getCasesByUser(userId: string) {
        return this.cases.filter(c => c.lawyerId === userId);
    }

    getAllCases() {
        return this.cases;
    }

    getCaseById(id: string) {
        return this.cases.find(c => c.id === id);
    }

    createCase(caseData: Omit<Case, "id" | "lawyerId" | "statusColor"> & { lawyerId?: string; statusColor?: string }) {
        const newCase: Case = {
            ...caseData,
            id: (this.cases.length + 1).toString(),
            lawyerId: caseData.lawyerId || "u1", // Default to main lawyer
            statusColor: caseData.category === 'Criminal' ? "#EF4444" : "#3B82F6"
        };
        this.cases.unshift(newCase);
        return newCase;
    }

    // Global Accessor
    getStore() {
        return {
            users: this.users,
            cases: this.cases,
            payments: this.payments,
            documents: this.documents,
            notes: this.notes,
            hearings: this.hearings
        };
    }
}

export const db = new Database();
