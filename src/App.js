import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Home from './routes/home/Home';
import Login from './routes/login/Login';
import ForgotPassword from './routes/login/ForgotPassword';
import PrivacyPolicy from './routes/privacy/PrivacyPolicy';
import TermsOfUse from './routes/privacy/TermsOfUse';
import Dashboard from './routes/dashboard/Dashboard';
import MasterDashboard from './routes/master/MasterDashboard';
import SubscriptionBlocked from './routes/subscription/SubscriptionBlocked';
import { CategoryProvider } from './routes/dashboard/menu/category/providers/CategoryContext.js';
import { ProductProvider } from './routes/dashboard/menu/product/providers/ProductContext.js';
import { TablesProvider } from './routes/dashboard/tables/provider/TablesContext.js';
import { ComandasProvider } from './routes/dashboard/comandas/provider/ComandasContext.js';
import { EmployeesProvider } from './routes/dashboard/employees/provider/EmployeesContext.js';
import { PATHS } from './services/accessControl';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppThemeProvider } from './theme/ThemeContext';
import './services/apiConfig';

function StoreLayout() {
  return (
    <ProtectedRoute>
      <ProductProvider>
        <CategoryProvider>
          <TablesProvider>
            <ComandasProvider>
              <EmployeesProvider>
                <Outlet />
              </EmployeesProvider>
            </ComandasProvider>
          </TablesProvider>
        </CategoryProvider>
      </ProductProvider>
    </ProtectedRoute>
  );
}

function AdminLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

function BlockedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AppThemeProvider>
      <Router>
        <Routes>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.LOGIN} element={<Login />} />
          <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={PATHS.PRIVACY} element={<PrivacyPolicy />} />
          <Route path={PATHS.TERMS} element={<TermsOfUse />} />

          <Route path={PATHS.LEGACY_DASHBOARD} element={<Navigate to={PATHS.APP} replace />} />
          <Route path={PATHS.LEGACY_MASTER} element={<Navigate to={PATHS.ADMIN} replace />} />

          <Route path={PATHS.SUBSCRIPTION_BLOCKED} element={<BlockedLayout />}>
            <Route index element={<SubscriptionBlocked />} />
          </Route>

          <Route path={PATHS.APP} element={<StoreLayout />}>
            <Route index element={<Dashboard />} />
            <Route path=":section" element={<Dashboard />} />
          </Route>

          <Route path={PATHS.ADMIN} element={<AdminLayout />}>
            <Route index element={<MasterDashboard />} />
            <Route path=":section" element={<MasterDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
        </Routes>
      </Router>
    </AppThemeProvider>
  );
}

export default App;
