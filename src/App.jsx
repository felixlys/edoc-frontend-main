import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Trash from "./pages/Trash";
import ComposeRevise from "./pages/ComposeRevise";
import Sent from "./pages/Sent";
import WaitingMyApproval from "./pages/WaitingMyApproval";
import CreateDocument from "./pages/CreateDocument";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignUp";
import EditProfile from "./components/EditProfile";
import ReviseDocument from "./components/RevisedList";
import ForgotPassword from "./components/ForgotPassword";
import NewPassword from "./components/NewPassword";
import SendOTP from "./components/SendOTP";
import SuperAdmin from "./context/SuperAdmin";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { UnreadProvider } from "./components/UnreadContext";
import { NotificationProvider } from "./components/NotificationContext";
import Notifications from "./components/Notifications";

/* Protected Route */
function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/* Wrapper to use location */
function AppWrapper() {
  const location = useLocation();
  const { token } = useContext(AuthContext);

  return (
    <div className="flex">
      {location.pathname !== "/login" && token && <Sidebar />}

      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sent"
            element={
              <ProtectedRoute>
                <Sent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trash"
            element={
              <ProtectedRoute>
                <Trash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiting"
            element={
              <ProtectedRoute>
                <WaitingMyApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-document"
            element={
              <ProtectedRoute>
                <CreateDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <CreateDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revise/:id"
            element={
              <ProtectedRoute>
                <ComposeRevise />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revisions"
            element={
              <ProtectedRoute>
                <ReviseDocument />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/send-otp" element={<SendOTP />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
        </Routes>
      </div>

      {/* 🔔 Notifications */}
      <Notifications />
    </div>
  );
}

/* ✅ Gabungkan semua provider dalam urutan benar */
export default function App() {
  return (
    <AuthProvider>
      <UnreadProvider>
        <NotificationProvider>
          <Router>
            <AppWrapper />
          </Router>
        </NotificationProvider>
      </UnreadProvider>
    </AuthProvider>
  );
}
