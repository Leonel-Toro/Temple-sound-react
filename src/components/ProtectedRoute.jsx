import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas según autenticación y roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene permisos
 * @param {string} props.requiredRole - Rol requerido ('admin', 'user', etc.)
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene permisos
 * @param {Function} props.onUnauthorized - Callback cuando el usuario no está autorizado
 */
export const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  fallback = null,
  onUnauthorized = null 
}) => {
  const { user, isAuthenticated, hasRole, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <div className="text-center text-white">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!isAuthenticated()) {
    if (onUnauthorized) {
      onUnauthorized('not-authenticated');
    }
    
    return fallback || (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <div className="card bg-dark border-secondary text-white" style={{ maxWidth: '400px' }}>
          <div className="card-body text-center">
            <i className="bi bi-shield-lock fs-1 text-warning mb-3 d-block"></i>
            <h5 className="card-title">Acceso Restringido</h5>
            <p className="card-text">
              Debes iniciar sesión para acceder a esta página.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si el usuario tiene el rol requerido
  if (requiredRole && !hasRole(requiredRole)) {
    if (onUnauthorized) {
      onUnauthorized('insufficient-permissions');
    }

    return fallback || (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <div className="card bg-dark border-secondary text-white" style={{ maxWidth: '400px' }}>
          <div className="card-body text-center">
            <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3 d-block"></i>
            <h5 className="card-title">Permisos Insuficientes</h5>
            <p className="card-text">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-muted small">
              Rol requerido: <strong>{requiredRole}</strong><br />
              Tu rol: <strong>{user?.role}</strong>
            </p>
            <button 
              className="btn btn-secondary"
              onClick={() => window.history.back()}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si la cuenta está activa
  if (user?.status !== 'active') {
    if (onUnauthorized) {
      onUnauthorized('inactive-account');
    }

    return fallback || (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <div className="card bg-dark border-secondary text-white" style={{ maxWidth: '400px' }}>
          <div className="card-body text-center">
            <i className="bi bi-x-circle fs-1 text-warning mb-3 d-block"></i>
            <h5 className="card-title">Cuenta Inactiva</h5>
            <p className="card-text">
              Tu cuenta está inactiva. Por favor, contacta al administrador.
            </p>
            <button 
              className="btn btn-secondary"
              onClick={() => window.history.back()}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado y autorizado
  return children;
};

/**
 * Hook personalizado para verificar permisos en componentes
 */
export const useProtectedRoute = (requiredRole = null) => {
  const { user, isAuthenticated, hasRole } = useAuth();

  const canAccess = () => {
    if (!isAuthenticated()) return false;
    if (user?.status !== 'active') return false;
    if (requiredRole && !hasRole(requiredRole)) return false;
    return true;
  };

  return {
    canAccess: canAccess(),
    user,
    isAuthenticated: isAuthenticated(),
    hasRequiredRole: requiredRole ? hasRole(requiredRole) : true,
  };
};

export default ProtectedRoute;
