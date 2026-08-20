# Freelancer Collaboration Platform 🚀

Welcome to the **Freelancer Collaboration Platform**—a production-grade, real-time workspace that connects clients and freelancers. This repository provides a complete full-stack environment enabling users to manage projects, submit proposals, track milestones, assign tasks, complete secure payments, download PDF invoices, and collaborate through real-time chat. 

The platform is supercharged with a floating **Multilingual Voice AI Assistant** that supports Speech-to-Text (STT) and Text-to-Speech (TTS) inside the browser across five regional languages.

---

## 💻 Tech Stack & Integrations

### Frontend
- **Framework:** React 19 (Vite-powered, Hot Module Replacement)
- **Styling:** CSS3 & Tailwind CSS v4 (Glassmorphic properties, custom dark-theme tokens)
- **Icons:** React Icons (`react-icons/fi`, `react-icons/bs`, `react-icons/hi2`)
- **Real-Time Integration:** Socket.IO Client
- **API Client:** Axios (configured with request/response interceptors)
- **Utilities:** `jspdf` & `jspdf-autotable` (Invoice Generation), `xlsx` (Excel Exporting)

### Backend
- **Framework:** Express (Node.js REST API server)
- **Database:** MongoDB Atlas (handled via Mongoose schemas)
- **Real-Time Communication:** Socket.IO Server
- **File Upload Middleware:** Multer (with mime-type and limit filtering)
- **Cloud Storage:** Cloudinary integration for attachments and profiles
- **Authentication:** JWT, Cookie-Parser, Google OAuth 2.0 (Passport.js)
- **AI Engine:** Google Gemini SDK & Groq API Integrations

---

## 🌟 Platform Features & How They Work

### 1. Authentication & Role-Based Access Control (RBAC)
- **Local Credentials:** Dynamic secure login, registration, password hashing (bcrypt), forgot-password, and reset-password utility flows.
- **Social Login:** Configured OAuth2.0 authentication flow with Google Passport strategies.
- **Access Control:** Route protection guards secure access permissions for:
  - `client`: Project creators, milestone assigners, and invoice payers.
  - `freelancer`: Bidders, task executors, resume builders, and achievement collectors.
  - `admin`: Global dashboard controllers, system reports managers, and user auditors.

### 2. Client Module (Project & Bid Management)
- **Project Composer:** Clients publish public or private projects, configuring budgets, deadliness, skills checklists, and description details.
- **Proposal Review:** Interactive boards to inspect freelancer proposals (bid amount, cover letters, custom milestones).
- **Hiring Pipeline:** Accept or reject proposals. Accepting triggers automated project assignment.
- **Milestone Engine:** Clients structure project milestones with customized release amounts. Payments are routed dynamically through Razorpay checkout overlays.

### 3. Freelancer Module (Bidding, Resume & Gamification)
- **Project Board:** Search and filter public listings matching required skill sets.
- **Proposal Submissions:** Detail bids, delivery durations, and list expected milestones.
- **Resume Analytics:** Interactive parser that summarizes uploaded CVs and highlights core skills.
- **Gamified Achievements:** Unlocks achievements dynamically (e.g. Profile Setup, First Bid, Milestone Completion) tracked on the user profile.
- **Freelancer/Client Directories:** Easily search profiles, view client ratings, and browse freelancer hourly rates.

### 4. Real-Time Chat & Secure File Sharing
- **Real-time Rooms:** Socket.IO handles communication rooms mapped to projects.
- **Inline Composer Previews:** Users preview files (thumbnail cards for images, file cards for docs) in the composer before uploading.
- **Cloud Upload Handlers:** Multer interceptors forward uploads securely to Cloudinary, generating CDN links, original filenames, mime types, and size logs stored in Mongoose database logs.
- **Socket Broadcasts:** Complete message structures are broadcasted in real-time, instantly rendering previews for active users.

### 5. Multilingual Voice-Enabled AI Assistant (FAB)
- **Central Language Configuration:** Controls speech patterns through the `SPEECH_LANGUAGES` mapper:
  - **English** (`en-IN`)
  - **Hindi** (`hi-IN`)
- **Speech-to-Text (STT):** Translates spoken sentences dynamically using browser-native SpeechRecognition based on the active language dropdown.
- **Text-to-Speech (TTS):** WebSpeech synthesis searches native browser voices (`window.speechSynthesis.getVoices()`) matching the language code to ensure proper pronunciation, with fallback locales.
- **Audio Context Syncing:** Saves language choices to `localStorage`. Clears active speech loops when switching languages.
- **Unread Counter:** Floating widget indicates active responses with a badge that clears upon panel expansion.

### 6. Billing, Payments & Document Engines
- **Razorpay Checkout:** Milestone payouts trigger the Razorpay SDK checkout overlay, executing verification Webhooks on the server.
- **Automated PDF Invoices:** Auto-generates clean, professional invoice receipts with grid layouts using `jspdf` and `jspdf-autotable`.
- **Logs Exporter:** Freelancers and clients export invoice tables directly to `.xlsx` files using `xlsx` spreadsheet sheets.

---

## 📂 Project Structure

```text
├── client/                      # React Frontend Application
│   ├── src/
│   │   ├── api/                 # API client configurations (Axios base configuration)
│   │   ├── components/          # Reusable shared components
│   │   │   ├── ai/              # AI chatbot UI & Speech recognition scripts
│   │   │   ├── chat/            # Chat room drawers, composer, and message cards
│   │   │   └── landing/         # Marketing landing elements (Hero, FAQ, Testimonials)
│   │   ├── context/             # Authentication, Notification, and Profile states
│   │   ├── layouts/             # Shared Dashboard layouts (Navbar & Sidebar)
│   │   ├── pages/               # Functional pages (Dashboards, Directory lists)
│   │   ├── routes/              # Protected routes & role-guards
│   │   └── services/            # Socket.IO connection configurations
│   ├── index.html               # Main entry HTML
│   ├── vite.config.js           # Vite development configs
│   └── package.json
└── server/                      # Express Backend Server Application
    ├── configs/                 # DB connectors, Passport OAuth, and Socket.IO configs
    ├── controllers/             # Request handlers (auth, payments, chat, AI controller)
    ├── middlewares/             # JWT auth validations, multer configurations
    ├── models/                  # Mongoose MongoDB schemas
    ├── routes/                  # Express Router endpoint definitions
    ├── utils/                   # Shared validation utilities
    ├── server.js                # Server main entrypoint
    └── package.json
```

---

## 🛠️ Installation & Setup Guide

### 1. Prerequisites
- **Node.js:** v18+ recommended
- **Database:** MongoDB connection URI (Local or Atlas)
- **Accounts:** Cloudinary (File Uploads), Razorpay Dashboard (Payments), Google Developer Console (OAuth)

### 2. Environment Variables Configuration

#### Backend Env (`server/.env`)
Create a `.env` file in the `/server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/freelancer_platform
CLIENT_URL=http://localhost:5173

# Security Credentials
JWT_SECRET=your_jwt_secret_token
SESSION_SECRET=your_session_secret_token

# Passport OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Mailer Configurations
EMAIL_USER=your_email_account@gmail.com
EMAIL_PASS=your_email_app_passcode

# Cloudinary CDN Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payment Integration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# AI Models Integration
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=gsk_your_groq_api_key
```

#### Frontend Env (`client/.env`)
Create a `.env` file in the `/client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Execution Commands

#### Step A: Run the Backend Server
```bash
cd server
npm install
npm run dev
```
*Server launches by default on [http://localhost:5000](http://localhost:5000)*

#### Step B: Run the Client Application
```bash
cd client
npm install
npm run dev
```
*Client starts by default on [http://localhost:5173](http://localhost:5173)*

---

## 🌐 API Endpoint Specifications

The backend exposes these REST routes:

| Module | Route Prefix | Primary Endpoints |
|---|---|---|
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `GET /logout`, `POST /forgot-password`, `POST /reset-password` |
| **Projects** | `/api/project` | `POST /`, `GET /`, `GET /my`, `PUT /:id`, `DELETE /:id` |
| **Proposals** | `/api/proposal` | `POST /`, `GET /my`, `GET /project/:projectId`, `PUT /:id` (Accept/Reject) |
| **Invitations** | `/api/invitation` | `POST /`, `GET /my`, `PUT /:id` |
| **Milestones** | `/api/milestone` | `POST /`, `GET /project/:projectId`, `PATCH /:id/status` |
| **Tasks** | `/api/task` | `POST /`, `GET /milestone/:milestoneId`, `PATCH /:id/status` |
| **Payments** | `/api/payments` | `POST /create-order`, `POST /verify`, `GET /my-payments` |
| **Invoices** | `/api/invoices` | `POST /create`, `GET /my-invoices`, `GET /:id` |
| **Chat & Info**| `/api/message` | `POST /:conversationId`, `GET /:conversationId`, `PATCH /read/:messageId` |
| **AI Assistant**| `/api/ai` | `POST /chat` |

---

## ⚡ Socket.IO Event Mappings

Real-time interactions utilize the following events:
- **`join_project` (client-to-server):** Freelancers or clients subscribe to chat rooms matching their assigned project.
- **`send_message` (client-to-server):** Forwards message payload (text and Cloudinary attachments) to the server.
- **`receive_message` (server-to-client):** Broadcasts incoming messages instantly to all room participants.
- **`typing` (client-to-server):** Emits status alerts showing "X is typing..." indicators inside the active window.
