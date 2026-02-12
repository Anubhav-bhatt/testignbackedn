# Legal IQ - Professional Practice Management

Legal IQ is a comprehensive legal practice management platform built with React Native (Expo) and Node.js. It features a high-performance case management system, professional calendar scheduling, and an AI-driven "Intel Engine" for case analysis.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (for Backend)
- Expo Go app on your phone (for real-device testing)

### 2. Setup Backend
```bash
cd Backend
npm install
# Create a .env file (see .env.example)
npm run dev
```

### 3. Setup Frontend
```bash
cd Frontend
npm install
npx expo start
```
Scan the QR code in your terminal with the **Expo Go** app to view the project on your device.

## ✨ Key Features

- **💼 Case Vault**: A centralized, secure hub for managing all legal matters with status tracking and document archiving.
- **📅 Smart Schedule**: Unified calendar for hearings, tasks, and client reminders with a fixed, easy-access action bar.
- **🤖 AI Intel Engine**: Uses Google Gemini to analyze case documents, identify strategic risks, and suggest legal precedents.
- **🖼️ Comprehensive Intake**: Streamlined new case intake with client profile photo uploads and mandatory document validation (FIR, Aadhar, PAN).
- **🌓 Adaptive Theme**: Fully persistent Dark/Light mode support tailored for professional environments.

## 🛠️ Technology Stack

- **Frontend**: React Native, Expo, Axios, React Navigation.
- **Backend**: Node.js, Express, PostgreSQL, Multer (File Uploads).
- **AI**: Google Generative AI (Gemini Pro).
- **UI/UX**: Custom premium aesthetic with glassmorphism and modern typography.

## 📁 Repository Structure

- `/Frontend`: Expo-based mobile application.
- `/Backend`: Express.js server and database management.
- `/uploads`: Case documents and client profile storage.

---
Developed with ❤️ for legal professionals.
