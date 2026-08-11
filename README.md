# Freelancer Collaboration Platform

Welcome to the Freelancer Collaboration Platform! This repository contains a full-stack real-time collaboration application designed for clients and freelancers. It supports real-time project chatting, task boards, milestones management, and invitations.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling:** CSS3 & Tailwind CSS v4 (using glassmorphic properties)
- **Icons:** React Icons (`react-icons/fi`)
- **Real-Time:** Socket.IO Client
- **API Client:** Axios

### Backend
- **Framework:** Express (Node.js)
- **Database:** MongoDB (via Mongoose)
- **File Storage:** Cloudinary
- **Real-Time:** Socket.IO Server
- **File Upload Middleware:** Multer

---

## 🚀 Newly Implemented Features

### 1. Fixed & Integrated Chat Attachments (End-to-End)
- **Inline Preview:** Selecting a file displays a preview card (thumbnail for images, folder/file card for documents) directly inside the composer.
- **Multipart Form Uploads:** Fixed an Axios interceptor bug that hardcoded `Content-Type: application/json` for all requests, which previously broke `FormData` serialization. Clear boundaries are now sent automatically.
- **Multer Error Catching:** Route middleware wraps `upload.single("file")` to catch upload limits or disallowed mime type errors gracefully, returning clean JSON 400 responses instead of standard raw HTML crashes.
- **Cloudinary Integration:** Fully wired. Endpoints save the file's correct secure URL, original name, mimetype, size, and its returned Cloudinary `resource_type` (saved to `attachment.resourceType` inside MongoDB).
- **Socket.IO Emits:** Complete messages (with attachment metadata) are broadcasted in real time. Both sender and receiver see updates immediately.

### 2. Fully Responsive Chat Layout
- **Desktop (>= 1280px):** Sideloaded three-column layout (Sidebar navigation | Conversation list | Active conversation).
- **Tablet (768px - 1280px):** Sideloaded two-column view (Sidebar closed inside layout toggle | Active conversation visible). The conversation list is collapsed by default and can be toggled via a new header button (`FiMessageSquare`), sliding out as a premium drawer overlay from the left with a backdrop.
- **Mobile (< 768px):** Single column primary view. Displays the Chat List if no chat is active. When a chat is active, the chat room occupies the full screen, and a "Back" button allows users to navigate back to the list. The toggle button is also available to slide open the drawer.
- **Chat Bubbles & Cards:** Set fluid maximum widths (`max-w-full xs:max-w-xs sm:max-w-sm`) for images and document boxes inside messages to prevent layout overflow on very small devices.

---

## 📂 Project Structure

```text
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api/            # API configurations & services (axios instance)
│   │   ├── components/     # Reusable components (chat bubble, list, composer)
│   │   ├── context/        # React Auth and Notification Contexts
│   │   ├── layouts/        # Dashboard layout wrapping sidebar & navbar
│   │   ├── pages/          # Dashboard pages (ProjectChatPage, Profile, etc.)
│   │   └── services/       # Socket.IO client setup
│   └── package.json
└── server/                 # Express backend application
    ├── configs/            # Database and Socket.IO configurations
    ├── controllers/        # Controllers (message.controller, etc.)
    ├── middlewares/        # Middlewares (upload, auth, role)
    ├── models/             # Mongoose schemas (Message, User, etc.)
    ├── routes/             # Express endpoints
    └── server.js           # Server bootstrap
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js installed (v18+ recommended)
- MongoDB account/URI
- Cloudinary account

### 2. Setup Backend Environment
Create a `.env` file in the `/server` directory with the following configuration:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Run the Applications
Navigate to individual project folders to install dependencies and run:

#### Start Backend Server
```bash
cd server
npm install
npm run dev
```

#### Start Frontend Client
```bash
cd client
npm install
npm run dev
```

---

## 🌐 Website & Developer Details

- **Website URL (Local Development):** [http://localhost:5173](http://localhost:5173)
- **Developer Name:** Animesh Samantaray
- **Repository Path:** `Animesh-Samantaray/FreeLancer-Colaborate-`
