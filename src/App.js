import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Home from './routes/home/Home';
import Login from './routes/login/Login';
import ForgotPassword from './routes/login/ForgotPassword';
import PrivacyPolicy from './routes/privacy/PrivacyPolicy';
import TermsOfUse from './routes/privacy/TermsOfUse';
import { CategoryProvider } from './routes/dashboard/menu/category/providers/CategoryContext.js';
import { ProductProvider } from './routes/dashboard/menu/product/providers/ProductContext.js';
import { TablesProvider } from './routes/dashboard/tables/provider/TablesContext.js';
import { ComandasProvider } from './routes/dashboard/comandas/provider/ComandasContext.js';
import { EmployeesProvider } from './routes/dashboard/employees/provider/EmployeesContext.js';
import { PATHS } from './services/accessControl';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppThemeProvider } from './theme/ThemeContext';
import './services/apiConfig';

const Dashboard = lazy(() => import('./routes/dashboard/Dashboard'));
const MasterDashboard = lazy(() => import('./routes/master/MasterDashboard'));
const SubscriptionBlocked = lazy(() => import('./routes/subscription/SubscriptionBlocked'));
const PublicMenu = lazy(() => import('./routes/public-menu/PublicMenu'));
const PublicDelivery = lazy(() => import('./routes/public-delivery/PublicDelivery'));
const DeliveryTracking = lazy(() => import('./routes/public-delivery/DeliveryTracking'));
const DemoIndex = lazy(() => import('./routes/demo/DemoIndex'));
const DemoStorePage = lazy(() => import('./routes/demo/DemoStorePage'));

function RouteFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress sx={{ color: 'var(--color-primary)' }} />
    </Box>
  );
}

function StoreLayout() {
  return (
    <ProtectedRoute>
      <ProductProvider>
        <CategoryProvider>
          <TablesProvider>
            <ComandasProvider>
              <EmployeesProvider>
                <Suspense fallback={<RouteFallback />}>
                  <Outlet />
                </Suspense>
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
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </ProtectedRoute>
  );
}

function BlockedLayout() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
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
          <Route
            path={PATHS.DEMO}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <DemoIndex />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.DEMO_SLUG}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <DemoStorePage />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PUBLIC_MENU_SLUG}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <PublicMenu />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PUBLIC_DELIVERY_ORDER}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <DeliveryTracking />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PUBLIC_DELIVERY_SLUG}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <PublicDelivery />
              </Suspense>
            )}
          />

          <Route path={PATHS.LEGACY_DASHBOARD} element={<Navigate to={PATHS.APP} replace />} />
          <Route path={PATHS.LEGACY_MASTER} element={<Navigate to={PATHS.ADMIN} replace />} />

          <Route path={PATHS.SUBSCRIPTION_BLOCKED} element={<BlockedLayout />}>
            <Route index element={<SubscriptionBlocked />} />
          </Route>

          <Route path={PATHS.APP} element={<StoreLayout />}>
            <Route index element={<Dashboard />} />
            <Route path=":section/*" element={<Dashboard />} />
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
