import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './routes/home/Home';
import Login from './routes/login/Login';
import PrivacyPolicy from './routes/privacy/PrivacyPolicy';
import { initializeFirebase } from './services/firebase.js';
import Dashboard from './routes/dashboard/Dashboard';
import { CategoryProvider } from './routes/dashboard/menu/category/providers/CategoryContext.js';
import { ProductProvider } from './routes/dashboard/menu/product/providers/ProductContext.js';
import { TablesProvider } from './routes/dashboard/tables/provider/TablesContext.js';
import { EmployeesProvider } from './routes/dashboard/employees/provider/EmployeesContext.js';

function App() {
  initializeFirebase();

  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/dashboard"
          element={
            <ProductProvider>
              <CategoryProvider>
                <TablesProvider>
                  <EmployeesProvider>
                    <Dashboard />
                  </EmployeesProvider>
                </TablesProvider>
              </CategoryProvider>
            </ProductProvider>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
