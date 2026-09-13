# Public Healthcare Accessibility Platform Backend (MVP)

A unified, production-ready backend built with **Node.js, Express.js, TypeScript, and MongoDB** to solve the core challenge of public healthcare accessibility in rural and underserved areas.

All three core features share a single backend architecture and unified MongoDB database:
1. **Location-wise Doctor & Hospital Availability** (`GET /api/v1/hospitals/nearby`)
2. **Nearest Medical Facility Search** (`GET /api/v1/facilities/nearest`)
3. **Hospital Medicine Stock & Real-time Availability** (`GET /api/v1/medicines/:medicineId/availability`)

---

## 🚀 Key Highlights & Architecture

- **Single Shared Backend & Database**: Unified relational schema powering all healthcare lookup features without mini-project fragmentation.
- **Geospatial Distance Queries**: Powered by Haversine formula calculation and GeoJSON 2dsphere indexes for precision radius filtering and distance-based sorting.
- **Layered Modular Architecture**: Clean separation between Routes, Controllers, Services, Repositories, and Mongoose Models.
- **Zod Validation & JWT Security**: Strict request payload/query validation with Zod, JWT authentication, bcrypt password hashing, and role-based access control (`USER`, `ADMIN`, `HOSPITAL_STAFF`).
- **Interactive Swagger Documentation**: Built-in OpenAPI 3.0 UI exposed at `/api-docs`.
- **Hybrid Caching**: Redis integration with built-in in-memory fallback.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v24+) | JavaScript execution runtime |
| **Framework** | Express.js | High-performance HTTP REST framework |
| **Language** | TypeScript | Strong typing & maintainability |
| **Database** | MongoDB | Document database with 2dsphere spatial index support |
| **ORM / ODM** | Mongoose | Typed object modeling for MongoDB |
| **Validation** | Zod | Runtime input request schema validation |
| **Auth** | JWT + bcryptjs | Secure authentication & password hashing |
| **API Specs** | Swagger UI + swagger-jsdoc | OpenAPI 3.0 interactive documentation |
| **Testing** | Jest + Supertest | Integration & unit API testing |

---

## 📂 Project Directory Structure

```
healthcare-accessibility-backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # Mongoose MongoDB connection setup
│   │   ├── env.ts             # Zod validated environment schema
│   │   └── redis.ts           # Redis client with fallback in-memory cache
│   ├── models/
│   │   ├── User.ts            # User auth model (USER, ADMIN, HOSPITAL_STAFF)
│   │   ├── Hospital.ts        # Hospital master schema with GeoJSON 2dsphere index
│   │   ├── Doctor.ts          # Doctor schema with availability status
│   │   ├── Medicine.ts        # Medicine catalog master schema
│   │   ├── HospitalMedicine.ts# Joint stock availability schema with timestamp
│   │   └── HospitalService.ts # Hospital service capability schema
│   ├── modules/
│   │   ├── auth/              # Auth registration, login, refresh
│   │   ├── hospital/          # Hospital catalog & nearby geospatial search
│   │   ├── facility/          # Nearest medical facility search by service
│   │   ├── doctor/            # Doctor directory & specialization filter
│   │   ├── medicine/          # Medicine catalog & location availability
│   │   └── admin/             # Protected CRUD management endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authentication & role authorization guard
│   │   ├── error.middleware.ts# Global error handler middleware
│   │   ├── validation.middleware.ts # Zod request validation wrapper
│   │   └── rateLimit.middleware.ts  # Express rate limiting middleware
│   ├── utils/
│   │   ├── distance.ts        # Haversine formula calculation logic
│   │   ├── jwt.ts             # JWT token helpers
│   │   ├── errors.ts          # Custom AppError classes
│   │   └── response.ts        # Standardized API response format
│   ├── routes/
│   │   └── index.ts           # Central v1 route aggregator
│   ├── app.ts                 # Express application bootstrap
│   ├── server.ts              # Local HTTP server entry point
│   └── seed.ts                # Database seed script for Rajkot district data
├── tests/
│   ├── setup.ts               # Jest test setup
│   ├── auth.test.ts           # Auth API tests
│   ├── hospital.test.ts       # Geolocation & nearby hospital tests
│   └── medicine.test.ts       # Medicine availability tests
├── .env                       # Local environment variables
├── package.json               # Node dependencies & scripts
└── tsconfig.json              # TypeScript compiler settings
```

---

## 📦 Local Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ (v24 supported)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Configuration
Create a `.env` file in the root directory (or use default `.env` created during setup):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mongodb://127.0.0.1:27017/healthcare_db"
JWT_SECRET=super_secret_jwt_access_key_sih_2026_healthcare
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_sih_2026_healthcare
REDIS_URL=redis://127.0.0.1:6379
FRONTEND_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed MongoDB Database
Populate local MongoDB with realistic hospitals (PHC Gondal, CHC Jetpur, Rajkot Civil), doctors, medicines (Paracetamol, ORS, Amoxicillin), stock availability, and user accounts:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

The server will start locally at:
- **Base API URL**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

---

## 📡 API Reference Overview

### 1. Public Healthcare Accessibility APIs

#### Nearby Hospitals Search
```http
GET /api/v1/hospitals/nearby?latitude=22.3039&longitude=70.8022&radius=10
```
Returns hospitals within `radius` kilometers sorted by distance ascending, featuring available services and active doctor count.

#### Nearest Medical Facility Search
```http
GET /api/v1/facilities/nearest?latitude=22.3039&longitude=70.8022&service=Gynecology
```
Searches for the single closest public medical facility that provides the requested service (e.g. Gynecology, General OPD, Emergency).

#### Medicine Availability Search
```http
GET /api/v1/medicines/:medicineId/availability?latitude=22.3039&longitude=70.8022&radius=20
```
Returns nearby hospitals stocking the specified medicine, complete with stock quantity, stock status (`AVAILABLE`, `LIMITED`, `OUT_OF_STOCK`), and `lastUpdated` timestamp.

#### Complete Hospital Details
```http
GET /api/v1/hospitals/:hospitalId/details
```
Aggregates hospital info, doctor schedule/availability, services provided, and medicine inventory in a single call for frontend rendering.

---

### 2. Authentication APIs

- `POST /api/v1/auth/register` — Register new user account
- `POST /api/v1/auth/login` — Login & receive JWT access + refresh tokens
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Logout

**Seeded Credentials**:
- **Admin**: `admin@healthcare.gov.in` / `Password123!`
- **Staff**: `staff.gondal@healthcare.gov.in` / `Password123!`
- **User**: `user@example.com` / `Password123!`

---

### 3. Admin & Hospital Staff Management APIs (Protected)

Require Header: `Authorization: Bearer <ADMIN_OR_STAFF_JWT_TOKEN>`

- `POST /api/v1/admin/hospitals` — Create hospital
- `PUT /api/v1/admin/hospitals/:id` — Update hospital details
- `DELETE /api/v1/admin/hospitals/:id` — Delete hospital
- `POST /api/v1/admin/doctors` — Add doctor
- `PUT /api/v1/admin/doctors/:id` — Update doctor availability status
- `POST /api/v1/admin/medicines` — Add medicine master
- `PUT /api/v1/admin/hospitals/:hospitalId/medicines/:medicineId` — Update medicine stock & status with auto-timestamp update

---

## 🧪 Running Automated Tests

Run the full integration test suite powered by Jest and Supertest:
```bash
npm test
```

Tests cover authentication, geolocation nearest facility search, medicine stock availability lookup, role-based authorization, and input validation bounds.
