import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import EditProfileForm from '../../components/EditProfileForm';

/**
 * Página de perfil del usuario
 * Muestra información del usuario y permite editarla
 */
export default function ProfilePage() {
  const { user, logout, isAdmin, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No estás autenticado. Por favor, inicia sesión.
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleEditSuccess = (updatedUser) => {
    // Actualizar el usuario en el contexto
    if (updateUser) {
      updateUser(updatedUser);
    }
    setIsEditing(false);
    
    // Mostrar mensaje de éxito
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-5';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>
      Perfil actualizado exitosamente
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card bg-dark text-white border-secondary shadow-lg">
            <div className="card-header" style={{
              border: 'none'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Mi Perfil
                </h3>
                {!isEditing && (
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => setIsEditing(true)}
                    style={{
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
            <div className="card-body p-4">
              {isEditing ? (
                <EditProfileForm 
                  onSuccess={handleEditSuccess}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  {/* Información del Usuario */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h5 className="text-white mb-3">
                        <i className="bi bi-person me-2"></i>
                        Información Personal
                      </h5>
                      
                      <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <label className="text-white-50 small mb-1">Nombre Completo</label>
                        <p className="mb-0 fw-semibold">{user.name || `${user.first_name} ${user.last_name}`}</p>
                      </div>

                      <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <label className="text-white-50 small mb-1">Email</label>
                        <p className="mb-0 fw-semibold">
                          <i className="bi bi-envelope me-2"></i>
                          {user.email}
                        </p>
                      </div>

                      {user.phone && (
                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <label className="text-white-50 small mb-1">Teléfono</label>
                          <p className="mb-0 fw-semibold">
                            <i className="bi bi-phone me-2"></i>
                            {user.phone}
                          </p>
                        </div>
                      )}

                      {user.shipping_address && (
                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <label className="text-white-50 small mb-1">Dirección de Envío</label>
                          <p className="mb-0 fw-semibold">
                            <i className="bi bi-geo-alt me-2"></i>
                            {user.shipping_address}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <h5 className="text-white mb-3">
                        <i className="bi bi-info-circle me-2"></i>
                        Detalles de Cuenta
                      </h5>

                      <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <label className="text-white-50 small mb-1">Rol</label>
                        <p className="mb-0">
                          <span className={`badge ${isAdmin() ? 'bg-danger' : 'bg-info'} fs-6`}>
                            <i className={`bi bi-${isAdmin() ? 'shield-check' : 'person'} me-1`}></i>
                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </p>
                      </div>

                      <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <label className="text-white-50 small mb-1">Estado</label>
                        <p className="mb-0">
                          <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-warning'} fs-6`}>
                            <i className={`bi bi-${user.status === 'active' ? 'check-circle' : 'exclamation-circle'} me-1`}></i>
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </p>
                      </div>

                      {user.created_at && (
                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <label className="text-white-50 small mb-1">Miembro desde</label>
                          <p className="mb-0 fw-semibold">
                            <i className="bi bi-calendar-check me-2"></i>
                            {new Date(user.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-between mt-4">
                    <button 
                      className="btn btn-outline-light btn-lg"
                      onClick={() => window.history.back()}
                      style={{
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver
                    </button>

                    <div className="d-flex gap-2">
                      {isAdmin() && (
                        <a 
                          href="/admin" 
                          className="btn btn-danger btn-lg"
                          style={{
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="bi bi-gear me-2"></i>
                          Panel Admin
                        </a>
                      )}

                      <button 
                        className="btn btn-secondary btn-lg"
                        onClick={handleLogout}
                        style={{
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
