import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from './ui/PasswordInput';
import { userService } from '../services/userService';
import { apiAuth } from '../lib/api';

/**
 * Componente para editar información personal del usuario
 */
export default function EditProfileForm({ onSuccess, onCancel }) {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    shipping_address: user.shipping_address || '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Validar un campo individual
  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        return '';
      
      case 'last_name':
        if (!value.trim()) return 'El apellido es requerido';
        if (value.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres';
        return '';
      
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          return 'El formato del teléfono no es válido';
        }
        return '';
      
      case 'new_password':
        if (showPasswordSection) {
          if (!value) return 'La nueva contraseña es requerida';
          if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        }
        return '';
      
      case 'confirm_password':
        if (showPasswordSection) {
          if (!value) return 'Debes confirmar la nueva contraseña';
          if (value !== formData.new_password) return 'Las contraseñas no coinciden';
        }
        return '';
      
      default:
        return '';
    }
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    if (submitError) setSubmitError('');
  };

  // Manejar blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Campos obligatorios
    ['first_name', 'last_name'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Teléfono opcional
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Validar contraseñas si se está cambiando
    if (showPasswordSection) {
      ['current_password', 'new_password', 'confirm_password'].forEach(key => {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      });
    }
    
    return newErrors;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    // Marcar todos los campos como tocados
    setTouched({
      first_name: true,
      last_name: true,
      phone: true,
      shipping_address: true,
      new_password: showPasswordSection,
      confirm_password: showPasswordSection,
    });

    // Validar
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para actualizar
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        phone: formData.phone.trim(),
        shipping_address: formData.shipping_address.trim(),
      };

      // Si se está cambiando la contraseña, agregarla a los datos
      if (showPasswordSection && formData.new_password) {
        updateData.password = formData.new_password;
      }

      // Actualizar usuario
      const updatedUser = await userService.update(user.id, updateData);
      
      // Actualizar el contexto de autenticación con los nuevos datos
      updateUser(updatedUser);
      
      // Actualizar sessionStorage con los nuevos datos
      sessionStorage.setItem('userName', updatedUser.name);
      sessionStorage.setItem('userFirstName', updatedUser.first_name);
      sessionStorage.setItem('userLastName', updatedUser.last_name);
      if (updatedUser.phone) {
        sessionStorage.setItem('userPhone', updatedUser.phone);
      }
      if (updatedUser.shipping_address) {
        sessionStorage.setItem('userShippingAddress', updatedUser.shipping_address);
      }
      
      if (onSuccess) {
        onSuccess(updatedUser);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setSubmitError(error.message || 'Error al actualizar la información. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      {/* Error general */}
      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4" role="alert" style={{
          background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
          borderLeft: '4px solid #dc3545'
        }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-circle-fill me-2 fs-5" style={{ color: '#dc3545' }}></i>
            <div className="flex-grow-1">{submitError}</div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSubmitError('')}
            aria-label="Close"  
          ></button>
        </div>
      )}

      {/* Información Personal */}
      <div className="mb-4">
        <h6 className="text-white mb-3">
          <i className="bi bi-person me-2"></i>
          Información Personal
        </h6>

        <div className="row g-3">
          {/* Nombre */}
          <div className="col-md-6">
            <label htmlFor="editFirstName" className="form-label fw-semibold mb-2">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="editFirstName"
              name="first_name"
              type="text"
              className={`form-control form-control-lg bg-dark text-white border-secondary ${
                touched.first_name && errors.first_name ? 'is-invalid' : ''
              } ${touched.first_name && !errors.first_name && formData.first_name ? 'is-valid' : ''}`}
              style={{ transition: 'all 0.3s ease' }}
              placeholder="Juan"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
            />
            {touched.first_name && errors.first_name && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.first_name}
              </div>
            )}
          </div>

          {/* Apellido */}
          <div className="col-md-6">
            <label htmlFor="editLastName" className="form-label fw-semibold mb-2">
              Apellido <span className="text-danger">*</span>
            </label>
            <input
              id="editLastName"
              name="last_name"
              type="text"
              className={`form-control form-control-lg bg-dark text-white border-secondary ${
                touched.last_name && errors.last_name ? 'is-invalid' : ''
              } ${touched.last_name && !errors.last_name && formData.last_name ? 'is-valid' : ''}`}
              style={{ transition: 'all 0.3s ease' }}
              placeholder="Pérez"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
            />
            {touched.last_name && errors.last_name && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.last_name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="mb-4">
        <h6 className="text-white mb-3">
          <i className="bi bi-telephone me-2"></i>
          Información de Contacto
        </h6>

        {/* Teléfono */}
        <div className="mb-3">
          <label htmlFor="editPhone" className="form-label fw-semibold mb-2">
            Teléfono
          </label>
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-white-50">
              <i className="bi bi-phone"></i>
            </span>
            <input
              id="editPhone"
              name="phone"
              type="tel"
              className={`form-control form-control-lg bg-dark text-white border-secondary ${
                touched.phone && errors.phone ? 'is-invalid' : ''
              } ${touched.phone && !errors.phone && formData.phone ? 'is-valid' : ''}`}
              style={{ borderLeft: 'none', transition: 'all 0.3s ease' }}
              placeholder="+56 9 1234 5678"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.phone && errors.phone && (
              <div className="invalid-feedback">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.phone}
              </div>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="mb-3">
          <label htmlFor="editAddress" className="form-label fw-semibold mb-2">
            <i className="bi bi-geo-alt me-2"></i>
            Dirección de Envío <span className="text-danger">*</span>
          </label>
          <textarea
            id="editAddress"
            name="shipping_address"
            className="form-control form-control-lg bg-dark text-white border-secondary"
            style={{ transition: 'all 0.3s ease', resize: 'none' }}
            placeholder="Calle Los Aromos 123, Depto 45, Ciudad, Región"
            rows="3"
            value={formData.shipping_address}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div className="mb-4 border-top border-secondary pt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-white mb-0">
            <i className="bi bi-key me-2"></i>
            Cambiar Contraseña
          </h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              if (showPasswordSection) {
                // Limpiar campos de contraseña
                setFormData(prev => ({
                  ...prev,
                  new_password: '',
                  confirm_password: '',
                }));
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.new_password;
                  delete newErrors.confirm_password;
                  return newErrors;
                });
              }
            }}
          >
            <i className={`bi bi-${showPasswordSection ? 'x' : 'pencil'} me-1`}></i>
            {showPasswordSection ? 'Cancelar' : 'Cambiar'}
          </button>
        </div>

        {showPasswordSection && (
          <div className="password-section" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {/* Nueva Contraseña */}
            <div className="mb-3">
              <label htmlFor="editNewPassword" className="form-label fw-semibold mb-2">
                Nueva Contraseña <span className="text-danger">*</span>
              </label>
              <PasswordInput
                id="editNewPassword"
                name="new_password"
                className={`form-control form-control-lg bg-dark text-white border-secondary ${
                  touched.new_password && errors.new_password ? 'is-invalid' : ''
                } ${touched.new_password && !errors.new_password && formData.new_password ? 'is-valid' : ''}`}
                style={{ transition: 'all 0.3s ease' }}
                value={formData.new_password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isSubmitting}
              />
              {touched.new_password && errors.new_password && (
                <div className="invalid-feedback d-block">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.new_password}
                </div>
              )}
              {!errors.new_password && (
                <small className="text-muted d-flex align-items-center mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Mínimo 6 caracteres
                </small>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="mb-3">
              <label htmlFor="editConfirmPassword" className="form-label fw-semibold mb-2">
                Confirmar Nueva Contraseña <span className="text-danger">*</span>
              </label>
              <PasswordInput
                id="editConfirmPassword"
                name="confirm_password"
                className={`form-control form-control-lg bg-dark text-white border-secondary ${
                  touched.confirm_password && errors.confirm_password ? 'is-invalid' : ''
                } ${touched.confirm_password && !errors.confirm_password && formData.confirm_password ? 'is-valid' : ''}`}
                style={{ transition: 'all 0.3s ease' }}
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={isSubmitting}
              />
              {touched.confirm_password && errors.confirm_password && (
                <div className="invalid-feedback d-block">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.confirm_password}
                </div>
              )}
              {touched.confirm_password && !errors.confirm_password && formData.confirm_password && (
                <div className="valid-feedback d-block">
                  <i className="bi bi-check-circle me-1"></i>
                  Las contraseñas coinciden
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          type="button"
          className="btn btn-lg btn-outline-light"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            fontWeight: '600',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="bi bi-x-circle me-2"></i>
          Cancelar
        </button>
        
        <button 
          className="btn btn-lg btn-primary position-relative overflow-hidden"
          type="submit"
          disabled={isSubmitting}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontWeight: '600',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Guardando cambios...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}
