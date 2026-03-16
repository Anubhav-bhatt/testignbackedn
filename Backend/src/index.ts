import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import aiRoutes from "./routes/ai";
import caseRoutes from "./routes/cases";
import documentRoutes from "./routes/documents";
import noteRoutes from "./routes/notes";
import paymentRoutes from "./routes/payments";
import reminderRoutes from "./routes/reminders";
import userRoutes from "./routes/user";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Routes
import authRoutes from "./routes/auth";
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Legal IQ Backend is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
