import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './routes/home/Home';
import Login from './routes/login/Login';
import PrivacyPolicy from './routes/privacy/PrivacyPolicy';
import { initializeFirebase } from './services/firebase.js';
import Dashboard from './routes/dashboard/Dashboard';
import MasterDashboard from './routes/master/MasterDashboard';
import SubscriptionBlocked from './routes/subscription/SubscriptionBlocked';
import { CategoryProvider } from './routes/dashboard/menu/category/providers/CategoryContext.js';
import { ProductProvider } from './routes/dashboard/menu/product/providers/ProductContext.js';
import { TablesProvider } from './routes/dashboard/tables/provider/TablesContext.js';
import { EmployeesProvider } from './routes/dashboard/employees/provider/EmployeesContext.js';
import { getCurrentUser, isAuthenticated } from './services/session';
import {
  getPostLoginPath,
  isPlatformAdmin,
  isSubscriptionActive,
} from './services/accessControl';
import './services/apiConfig';

function RequireMaster({ children }) {
  const user = getCurrentUser();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  if (!isPlatformAdmin(user)) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }
  return children;
}

function RequireStoreAccess({ children }) {
  const user = getCurrentUser();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  if (isPlatformAdmin(user)) {
    return <Navigate to="/master/dashboard" replace />;
  }
  if (!isSubscriptionActive(user)) {
    return <Navigate to="/subscription-blocked" replace />;
  }
  return children;
}

function RequireBlockedSubscription({ children }) {
  const user = getCurrentUser();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  if (isPlatformAdmin(user)) {
    return <Navigate to="/master/dashboard" replace />;
  }
  if (isSubscriptionActive(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  initializeFirebase();

  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
          path="/master/dashboard"
          element={
            <RequireMaster>
              <MasterDashboard />
            </RequireMaster>
          }
        />
        <Route
          path="/subscription-blocked"
          element={
            <RequireBlockedSubscription>
              <SubscriptionBlocked />
            </RequireBlockedSubscription>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireStoreAccess>
              <ProductProvider>
                <CategoryProvider>
                  <TablesProvider>
                    <EmployeesProvider>
                      <Dashboard />
                    </EmployeesProvider>
                  </TablesProvider>
                </CategoryProvider>
              </ProductProvider>
            </RequireStoreAccess>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
