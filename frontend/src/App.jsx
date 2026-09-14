import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DeliveriesList from './pages/DeliveriesList';
import NewDelivery from './pages/NewDelivery';
import DeliveryDetail from './pages/DeliveryDetail';
import PoolingHub from './pages/PoolingHub';
import AnalyticsPage from './pages/AnalyticsPage';
import VehiclesPage from './pages/VehiclesPage';
import OutcomesPage from './pages/OutcomesPage';
import SettingsPage from './pages/SettingsPage';
import DriverDashboard from './pages/DriverDashboard';

import DestinationsPage from './pages/DestinationsPage';

import ExpoDemoPage from './pages/ExpoDemoPage';

function AppRoutes() {
  const { user, role } = useAuth();
  const uRole = (role || '').toUpperCase();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Control Center App Routes */}
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            uRole === 'DRIVER' ? (
              <Navigate to="/driver" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/demo" element={<ExpoDemoPage />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/deliveries" element={<DeliveriesList />} />
        <Route path="/deliveries/new" element={<NewDelivery />} />
        <Route path="/deliveries/:id" element={<DeliveryDetail />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/pooling" element={<PoolingHub />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/outcomes" element={<OutcomesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>


      {/* Fallback Redirect */}
      <Route
        path="*"
        element={
          uRole === 'DRIVER' ? (
            <Navigate to="/driver" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
    </Routes>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
