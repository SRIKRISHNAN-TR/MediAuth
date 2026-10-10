# MediAuth AI 🏥

> AI-powered medical pre-authorization platform connecting doctors, patients, insurers, and administrators in a unified workflow.

![MediAuth AI](https://img.shields.io/badge/MediAuth-AI%20Platform-2563eb?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-Full%20Stack-3178C6?style=flat-square&logo=typescript)

---

## 🌟 Features

### Multi-Role System
| Role | Access |
|------|--------|
| 🛡 **Admin** | Approve/reject registrations, add users directly, manage all accounts |
| 🩺 **Doctor** | Submit pre-authorization requests, track status, upload documents |
| 🏢 **Insurer** | Review pending claims, approve/reject, run AI analysis |
| 👤 **Patient** | Track own claims, view documents, check approval status |

### AI-Powered Analysis
- Gemini AI analyzes pre-auth requests for policy compliance
- Confidence scores, recommendation flags, and missing document detection
- Automated pipeline status tracking

### Registration & Approval Flow
- **Patients** → Automatically approved on registration
- **Doctors/Insurers** → Registration goes to admin for review before login is granted
- **Admin-created accounts** → Immediately active, no approval needed

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gemini API Key

### Installation

```bash
# Clone the repository
git clone <https://github.com/SRIKRISHNAN-TR/MediAuth.git>
cd MedAuth

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup

**Backend** — create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mediauth
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=AIzaSyA8vOU1b0Y-AZXDm9lPDLl1I7pYlmMzEEs
USE_MOCK_AI=false
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
PROTECTED_EMAILS=doctor@mediauth.com,insurer@mediauth.com
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### Database Seeding

Run the seed to populate the database with demo accounts and sample data:

```bash
cd backend
npm run seed
```

This creates:
- 🛡 `admin@mediauth.com` / `Admin@123` — Admin account
- 🩺 `doctor@mediauth.com` / `password123` — Doctor (Dr. Sarah Mitchell)
- 🏢 `insurer@mediauth.com` / `password123` — Insurer (Emily Chen)
- 👤 `patient@mediauth.com` / `password123` — Patient (James Patterson)
- Plus realistic pre-authorization requests and AI analyses

### Development

```bash
# Run backend (port 5000)
cd backend && npm run dev

# Run frontend (port 5173)
cd frontend && npm run dev
```

---

## 🏗 Architecture

```
MedAuth/
├── backend/                  # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── preauth.controller.ts
│   │   │   └── ...
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.ts       # Roles: doctor | patient | insurer | admin
│   │   │   ├── Doctor.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Insurer.ts
│   │   │   ├── PreAuthRequest.ts
│   │   │   └── AIAnalysis.ts
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/        # Auth, error handling
│   │   ├── services/         # Gemini AI service
│   │   └── utils/            # Seed scripts, helpers
│   └── package.json
│
└── frontend/                 # React + TypeScript SPA
    ├── src/
    │   ├── pages/
    │   │   ├── admin/        # AdminDashboard, PendingPage, UsersPage, AddUserPage
    │   │   ├── doctor/       # DoctorDashboard, NewRequest, MyRequests
    │   │   ├── insurer/      # InsurerDashboard, Reviews, Analytics
    │   │   ├── patient/      # PatientDashboard, Claims
    │   │   └── auth/         # Login, Register (with pending approval state)
    │   ├── layouts/          # DoctorLayout, InsurerLayout, PatientLayout, AdminLayout
    │   ├── context/          # AuthContext (JWT + role state)
    │   ├── services/         # API service layer (axios)
    │   └── types/            # Shared TypeScript interfaces
    └── package.json
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (doctor/insurer → pending) |
| POST | `/api/auth/login` | Login (blocked if not approved) |
| GET | `/api/auth/me` | Get current user + profile |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | System-wide stats |
| GET | `/api/admin/pending` | List pending approvals |
| GET | `/api/admin/users` | All users (filterable by role) |
| POST | `/api/admin/approve/:id` | Approve doctor/insurer |
| POST | `/api/admin/reject/:id` | Reject & delete account |
| POST | `/api/admin/deactivate/:id` | Deactivate user |
| POST | `/api/admin/add-doctor` | Create pre-approved doctor |
| POST | `/api/admin/add-insurer` | Create pre-approved insurer |

### Pre-Authorization
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/preauth` | Create new request |
| GET | `/api/preauth` | List requests (role-filtered) |
| GET | `/api/preauth/:id` | Get request detail |
| POST | `/api/preauth/:id/submit` | Submit for review |
| PATCH | `/api/preauth/:id/status` | Update status (insurer) |

### AI Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze/:requestId` | Run Gemini AI analysis |
| GET | `/api/ai/analysis/:requestId` | Get analysis result |

---

## 🚢 Deployment on Render

### Backend (Web Service)
1. **Environment**: Node
2. **Build Command**: `cd backend && npm install && npm run build`
3. **Start Command**: `cd backend && npm start`
4. **Environment Variables**: Add all from `.env` above

### Frontend (Static Site)
1. **Build Command**: `cd frontend && npm install && npm run build`
2. **Publish Directory**: `frontend/dist`
3. **Add redirect**: `frontend/public/_redirects` → `/* /index.html 200`
4. **Environment Variables**: Set `VITE_API_URL`

### Post-Deploy
After deploying, run the seed against your production MongoDB:
```bash
cd backend
MONGODB_URI=<your_atlas_uri> npm run seed
```

---

## 👥 Default Credentials

> ⚠️ Change these in production!

| Role | Email | Password |
|------|-------|----------|
| 🛡 Admin | `admin@mediauth.com` | `Admin@123` |
| 🩺 Doctor | `doctor@mediauth.com` | `password123` |
| 🏢 Insurer | `insurer@mediauth.com` | `password123` |
| 👤 Patient | `patient@mediauth.com` | `password123` |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT authentication with configurable expiry
- Role-based access control on all routes
- Protected emails cannot be deactivated (set via `PROTECTED_EMAILS` env var)
- Doctor/Insurer self-registration requires admin approval before login

---

## 📄 License

ISC License — see [LICENSE](LICENSE)

---

*Built with ❤️ using React, Express, MongoDB, and Google Gemini AI*
