import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, getRoleDefaultPath } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Dedicated Logins
import CustomerLoginPage from './pages/CustomerLoginPage';
import RiderLoginPage from './pages/RiderLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import LoginPage from './pages/LoginPage';

// Dedicated Main App Pages
import CustomerStorefrontPage from './pages/CustomerStorefrontPage';
import RiderPortalPage from './pages/RiderPortalPage';
import DashboardPage from './pages/DashboardPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryDetailPage from './pages/DeliveryDetailPage';
import RoutePlanningPage from './pages/RoutePlanningPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Admin Operations Cockpit Layout Wrapper
function AdminCockpitLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isDarkTheme={true} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Role-based root entry dispatcher
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070d19] text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Initializing LogiRoute AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const destination = getRoleDefaultPath(user.role);
  return <Navigate to={destination} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ======================================================== */}
          {/* APP 1: SHOPPER CONSUMER APP (Blinkit / Zepto Style)       */}
          {/* ======================================================== */}
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerStorefrontPage />
              </ProtectedRoute>
            }
          />

          {/* ======================================================== */}
          {/* APP 2: DELIVERY PARTNER HUD (Zepto Rider Style)          */}
          {/* ======================================================== */}
          <Route path="/rider/login" element={<RiderLoginPage />} />
          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRoles={['RIDER']}>
                <RiderPortalPage />
              </ProtectedRoute>
            }
          />

          {/* ======================================================== */}
          {/* APP 3: DARK STORE OPERATIONS CONSOLE (Control Tower)     */}
          {/* ======================================================== */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCockpitLayout>
                  <DashboardPage />
                </AdminCockpitLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCockpitLayout>
                  <DeliveriesPage />
                </AdminCockpitLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCockpitLayout>
                  <DeliveryDetailPage />
                </AdminCockpitLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/route-planner"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCockpitLayout>
                  <RoutePlanningPage />
                </AdminCockpitLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/routes/planner" element={<Navigate to="/route-planner" replace />} />
          <Route
            path="/route-history"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCockpitLayout>
                  <HistoryPage />
                </AdminCockpitLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/routes/history" element={<Navigate to="/route-history" replace />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCockpitLayout>
                  <AnalyticsPage />
                </AdminCockpitLayout>
              </ProtectedRoute>
            }
          />

          {/* ======================================================== */}
          {/* GLOBAL GATEWAY SELECTOR & ROOT DISPATCHER                */}
          {/* ======================================================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
