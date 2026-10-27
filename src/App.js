import './App.css';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Home from './routes/home/Home';
import SignupPage from './routes/billing/SignupPage';
import SignupReturnPage from './routes/billing/SignupReturnPage';
import AcceptInvitePage from './routes/billing/AcceptInvitePage';
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
import { CookieConsent } from './commons/components/CookieConsent';
import { trackPageView } from './services/metaPixel';
import './services/apiConfig';

const Dashboard = lazy(() => import('./routes/dashboard/Dashboard'));
const MasterDashboard = lazy(() => import('./routes/master/MasterDashboard'));
const SubscriptionBlocked = lazy(() => import('./routes/subscription/SubscriptionBlocked'));
const PublicMenu = lazy(() => import('./routes/public-menu/PublicMenu'));
const PublicDelivery = lazy(() => import('./routes/public-delivery/PublicDelivery'));
const DeliveryTracking = lazy(() => import('./routes/public-delivery/DeliveryTracking'));
const DeliveryOrdersPage = lazy(() => import('./routes/public-delivery/DeliveryOrdersPage'));
const DeliveryAccountPage = lazy(() => import('./routes/public-delivery/DeliveryAccountPage'));
const PartnersPage = lazy(() => import('./routes/partners/PartnersPage'));
const PartnerLoginPage = lazy(() => import('./routes/partners/PartnerLoginPage'));
const PartnerRecoveryPage = lazy(() => import('./routes/partners/PartnerRecoveryPage'));
const PartnerResetPasswordPage = lazy(() => import('./routes/partners/PartnerResetPasswordPage'));
const PartnerDashboardPage = lazy(() => import('./routes/partners/PartnerDashboardPage'));
const PartnerProfilePage = lazy(() => import('./routes/partners/PartnerProfilePage'));
const PartnerPayoutsPage = lazy(() => import('./routes/partners/PartnerPayoutsPage'));
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

/** Área autenticada do parceiro: layout próprio, sem providers da loja. */
function PartnerLayout() {
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

/** Meta Pixel nas páginas institucionais: uma visita por troca de rota, só após o aceite. */
function MarketingTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return <CookieConsent pathname={pathname} onAccept={() => trackPageView(pathname)} />;
}

function App() {
  return (
    <AppThemeProvider>
      <Router>
        <MarketingTracking />
        <Routes>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path="/contratar" element={<SignupPage />} />
          <Route path="/contratar/retorno" element={<SignupReturnPage />} />
          <Route path="/convite" element={<AcceptInvitePage />} />
          <Route path={PATHS.LOGIN} element={<Login />} />
          <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={PATHS.PRIVACY} element={<PrivacyPolicy />} />
          <Route path={PATHS.TERMS} element={<TermsOfUse />} />
          <Route
            path={PATHS.PARTNERS}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <PartnersPage />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PARTNERS_LOGIN}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <PartnerLoginPage />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PARTNERS_RECOVERY}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <PartnerRecoveryPage />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PARTNERS_RESET}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <PartnerResetPasswordPage />
              </Suspense>
            )}
          />
          <Route element={<PartnerLayout />}>
            <Route path={PATHS.PARTNERS_DASHBOARD} element={<PartnerDashboardPage />} />
            <Route path={PATHS.PARTNERS_PROFILE} element={<PartnerProfilePage />} />
            <Route path={PATHS.PARTNERS_PAYOUTS} element={<PartnerPayoutsPage />} />
          </Route>
          <Route path="/parceiros/*" element={<Navigate to={PATHS.PARTNERS} replace />} />
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
            path={PATHS.PUBLIC_DELIVERY_ORDERS}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <DeliveryOrdersPage />
              </Suspense>
            )}
          />
          <Route
            path={PATHS.PUBLIC_DELIVERY_ACCOUNT}
            element={(
              <Suspense fallback={<RouteFallback />}>
                <DeliveryAccountPage />
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
