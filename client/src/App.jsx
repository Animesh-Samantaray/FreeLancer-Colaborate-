import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
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

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientProfile from "./pages/client/ClientProfile";
import ClientDirectory from "./pages/client/ClientDirectory";
import CreateProject from "./pages/client/CreateProject";
import MyProject from "./pages/client/MyProject";

// Freelancer Pages
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import ResumeAnalytics from "./pages/freelancer/ResumeAnalytics";
import FreelancerDirectory from "./pages/freelancer/FreelancerDirectory";
import BrowseProjects from "./pages/freelancer/BrowseProjects";
import ProjectDetails from "./pages/freelancer/ProjectDetails";
import MyProposals from "./pages/freelancer/MyProposals";
import MyInvitations from "./pages/freelancer/MyInvitations";
import MyProjects from "./pages/freelancer/MyProjects";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";

// Project Chat Page
import ProjectChatPage from "./pages/ProjectChatPage";

// Invoice Pages
import InvoicesPage from "./pages/invoices/InvoicesPage";
import InvoiceDetailsPage from "./pages/invoices/InvoiceDetailsPage";

// Shared Placeholder Pages
import {
  ProjectsPage,
  TasksPage,
  MessagesPage,
  PaymentsPage,
  ReviewsPage,
  ProfilePage,
  SettingsPage,
} from "./pages/PlaceholderPages";

import { useProfile } from "./context/ProfileContext";

const RoleDashboardRedirect = () => {
  const { role } = useAuth();
  const { profileCompleted } = useProfile();
  if (role === "client") return <Navigate to="/client" replace />;
  if (role === "freelancer") {
    if (profileCompleted === false) return <Navigate to="/freelancer/profile" replace />;
    return <Navigate to="/freelancer" replace />;
  }
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

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
          {/* Dynamic Role Redirect */}
          <Route path="/dashboard" element={<RoleDashboardRedirect />} />

          {/* Client Specific Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/freelancers"
            element={
              <ProtectedRoute allowedRoles={["client", "admin"]}>
                <FreelancerDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/create-project"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/my-projects"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MyProject />
              </ProtectedRoute>
            }
          />

          {/* Freelancer Specific Routes */}
          <Route
            path="/freelancer"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/profile"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <FreelancerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/resume-analytics"
            element={
              <ProtectedRoute allowedRoles={["freelancer", "admin"]}>
                <ResumeAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/clients"
            element={
              <ProtectedRoute allowedRoles={["freelancer", "admin"]}>
                <ClientDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/browse-projects"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <BrowseProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/project/:id"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/my-proposals"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <MyProposals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/my-invitations"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <MyInvitations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/my-projects"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <MyProjects />
              </ProtectedRoute>
            }
          />

          {/* Admin Specific Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Shared Sub-pages */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/messages" element={<ProjectChatPage />} />
          <Route path="/messages/:projectId" element={<ProjectChatPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:invoiceId" element={<InvoiceDetailsPage />} />
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