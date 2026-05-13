import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";

import ServicesPage from "./pages/ServicesPage";

import CustomerRoute from "./components/CustomerRoute";
import WorkerRoute from "./components/WorkerRoute";
import AdminRoute from "./components/AdminRoute";
import AIChatPage from "./pages/AIChatPage";
import WorkerDashboard from "./pages/WorkerDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import AdminDashboard from "./pages/AdminDashboard";
import ContactPage from "./pages/ContactPage";

import WorkerProfile from "./pages/WorkerProfile";
import { bindSessionActivity } from "./utils/sessionSecurity";
import SeoManager from "./components/SeoManager";
import InstallPwaPrompt from "./components/InstallPwaPrompt";


export default function App() {
  useEffect(() => bindSessionActivity(), []);

  return (
    <>
      <SeoManager />
      <Routes>
        <Route path="/worker/:id" element={<WorkerProfile />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <AdminMessagesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

      <Route
        path="/customer-profile"
        element={
          <CustomerRoute>
            <CustomerProfile />
          </CustomerRoute>
        }
      />

      <Route
        path="/ai-chat"
        element={
          <CustomerRoute>
            <AIChatPage />
          </CustomerRoute>
        }
      />

      <Route
        path="/worker-dashboard"
        element={
          <WorkerRoute>
            <WorkerDashboard />
          </WorkerRoute>
        }
      />


        <Route path="*" element={<LandingPage />} />

      </Routes>
      <InstallPwaPrompt />
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop />
    </>
  );
}
