import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/session';
import {
  canAccessRoute,
  getPostLoginPath,
  PATHS,
} from '../services/accessControl';

/**
 * Guard central de rotas autenticadas.
 * 1. sessão/token  2. role  3. storeId (rotas de restaurante)
 * 4. assinatura    Sem permissão → rota padrão da role, não tela quebrada.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />;
  }

  if (!canAccessRoute(user, location.pathname)) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  return children;
}

export default ProtectedRoute;
