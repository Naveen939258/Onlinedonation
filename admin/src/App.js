import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminLogin from "./Pages/Admin/AdminLogin";
import DashBoard from "./Pages/Admin/DashBoard";
import Layout from "./Component/Layout/Layout";
import ProtectedRoute from "./Component/ProtectedRoute/ProtectedRoute";
import Donors from "./Pages/Admin/Donors";
import Campaigns from "./Pages/Admin/Campaigns";
import Donations from "./Pages/Admin/Donations";
import Notifications from "./Pages/Admin/Notifications";
import AdminVolunteers from "./Pages/Admin/AdminVolunteers";
import AdminPartnerManagement from "./Pages/Admin/AdminPartnerManagement";
import EventsAdmin from "./Pages/Admin/EventsAdmin";
import AdminProfile from "./Pages/Admin/AdminProfile";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      {/* All protected routes go inside Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashBoard/>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donors"
        element={
          <ProtectedRoute>
            <Layout>
              <Donors />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Layout>
              <Campaigns/>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations"
        element={
          <ProtectedRoute>
            <Layout>
              <Donations/>
            </Layout>
          </ProtectedRoute>
        }
      />
<Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications/>
            </Layout>
          </ProtectedRoute>
        }
      /><Route
        path="/Volunteers"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminVolunteers/>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/partner"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPartnerManagement/>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/event"
        element={
          <ProtectedRoute>
            <Layout>
              <EventsAdmin/>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminProfile/>
            </Layout>
          </ProtectedRoute>
        }
      />
      
    </Routes>
    
  );
}

export default App;
