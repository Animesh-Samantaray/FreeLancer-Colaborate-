import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Layout & Protect Route Wrapper
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import {
  ProjectsPage,
  TasksPage,
  MessagesPage,
  PaymentsPage,
  ReviewsPage,
  ProfilePage,
  SettingsPage
} from "./pages/PlaceholderPages";

function App() {
  return (
    <>
      {/* Toast configurations */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(17, 24, 30, 0.9)",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            backdropFilter: "blur(8px)",
            fontSize: "13px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#22C55E",
              secondary: "#FFF",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#FFF",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all route redirecting to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;