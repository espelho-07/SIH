# HEALTHCONNECT (SANJEEVANI-CONNECT) - Full Stack Healthcare Platform

> **SIH Problem Statement SIH26133**: Integrated Public Healthcare Access, Care Continuity, Closed-Loop Referral & Resource Intelligence Platform.

This repository branch (`FullStackProject`) contains the unified full-stack codebase combining the React / Vite frontend and the Node.js / Express / MongoDB backend.

---

## 📁 Repository Structure

```
.
├── Frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/             # Typed API clients for all backend modules
│   │   ├── components/      # UI components and design system
│   │   ├── contexts/        # Auth, socket, and language contexts
│   │   ├── pages/           # Portals (Patient, Doctor, ASHA, Pharmacy, Labs, Ops, Admin)
│   │   └── routes/          # Role-based protected routes
│   └── package.json
│
├── backend/                  # Node.js + Express + TypeScript + MongoDB + Socket.IO
│   ├── src/
│   │   ├── config/          # Database, redis, env configs
│   │   ├── models/          # Mongoose schema models (Users, Prescriptions, Queues, etc.)
│   │   ├── modules/         # API domain routers, controllers, services
│   │   ├── socket/          # Real-time WebSocket gateway
│   │   ├── seed.ts          # Unified database seeder
│   │   └── server.ts        # Server entrypoint
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017`

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env

# Seed the local MongoDB database with realistic demo datasets
npm run seed

# Start development API server
npm run dev
```

- API Base URL: `http://localhost:5000/api/v1`
- Swagger API Docs: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`

---

### 2. Frontend Setup

```bash
cd Frontend
npm install

# Start Vite development server
npm run dev
```

- Web Application: `http://localhost:5173/`
- Login Page: `http://localhost:5173/login`

---

## 🔑 Demo Access & Roles

The login page features a **1-Click Role Direct Login** grid for testing all 9 system personas:

| Role | Demo Person | Credentials | Default Landing Route |
| :--- | :--- | :--- | :--- |
| **Citizen / Patient** | Rameshwar Sharma | `ramesh.sharma@example.in` / `password123` | `/patient` |
| **Doctor (Cardiology)** | Dr. Arvind Patel | `dr.arvind.patel@gujarat.gov.in` / `password123` | `/doctor` |
| **ASHA Worker** | Sunita Devi | `sunita.asha@gujarat.health.gov.in` / `password123` | `/asha` |
| **Registration Clerk** | Rajesh Verma | `rajesh.reg@civilhospital.in` / `password123` | `/registration-clerk` |
| **Pharmacist** | Priya Nair | `priya.pharma@civilhospital.in` / `password123` | `/pharmacist` |
| **Lab Technician** | Amit Shah | `amit.lab@civilhospital.in` / `password123` | `/lab-technician` |
| **Facility Operations** | Vikram Joshi | `vikram.ops@civilhospital.in` / `password123` | `/facility-operations` |
| **District Admin** | Dr. Meenakshi Sundaram, IAS | `cdho.gandhinagar@gujarat.gov.in` / `password123` | `/district` |
| **Super Admin** | Alok Mukherjee | `alok.systems@nic.in` / `password123` | `/super-admin` |
