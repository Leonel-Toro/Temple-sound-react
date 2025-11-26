import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from './ui/PasswordInput';

/**
 * Componente de formulario de Registro
 * Incluye validación completa, auto-login post-registro
 */
export const RegisterForm = ({ onSuccess, onSwitchToLogin, onClose }) => {
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    shipping_address: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'El formato del email no es válido';
        }
        return '';
      
      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Debes confirmar la contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return '';
      
      case 'phone':
        // Campo opcional
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          return 'El formato del teléfono no es válido';
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
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Si estamos cambiando la contraseña y confirmPassword ya fue tocado, revalidar
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
    
    // Limpiar error de submit
    if (submitError) setSubmitError('');
  };

  // Manejar blur (campo tocado)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'password', 'confirmPassword'];
    
    requiredFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Validar campos opcionales solo si tienen valor
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    return newErrors;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    // Marcar todos los campos requeridos como tocados
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
      shipping_address: true,
    });

    // Validar
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Registro exitoso (auto-login ya realizado en authService)
        if (onSuccess) {
          onSuccess(result.user);
        }
        if (onClose) {
          onClose();
        }
      } else {
        // Error en registro
        setSubmitError(result.error || 'Error al crear la cuenta');
      }
    } catch (error) {
      setSubmitError(error.message || 'Error inesperado. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form">
      {/* Ícono decorativo superior */}
      <div className="text-center mb-4">
        <div className="auth-icon-wrapper">
          <i className="bi bi-person-plus-fill auth-icon"></i>
        </div>
        <p className="text-white mt-3 mb-0">Crea tu cuenta nueva</p>
      </div>

      {/* Error general del formulario */}
      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show border-0 shadow-sm" role="alert" style={{
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

      {/* Nombre y Apellido en fila */}
      <div className="row g-3 mb-3">
        {/* Nombre */}
        <div className="col-md-6">
          <label htmlFor="regFirstName" className="form-label fw-semibold mb-2">
            <i className="bi bi-person me-2"></i>
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            id="regFirstName"
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
          <label htmlFor="regLastName" className="form-label fw-semibold mb-2">
            <i className="bi bi-person me-2"></i>
            Apellido <span className="text-danger">*</span>
          </label>
          <input
            id="regLastName"
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

      {/* Email */}
      <div className="mb-3">
        <label htmlFor="regEmail" className="form-label fw-semibold mb-2">
          <i className="bi bi-envelope me-2"></i>
          Email <span className="text-danger">*</span>
        </label>
        <div className="input-group">
          <span className="input-group-text bg-dark border-secondary text-white-50">
            <i className="bi bi-at"></i>
          </span>
          <input
            id="regEmail"
            name="email"
            type="email"
            className={`form-control form-control-lg bg-dark text-white border-secondary ${
              touched.email && errors.email ? 'is-invalid' : ''
            } ${touched.email && !errors.email && formData.email ? 'is-valid' : ''}`}
            style={{ borderLeft: 'none', transition: 'all 0.3s ease' }}
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />
          {touched.email && errors.email && (
            <div className="invalid-feedback">
              <i className="bi bi-exclamation-circle me-1"></i>
              {errors.email}
            </div>
          )}
        </div>
      </div>

      {/* Contraseña */}
      <div className="mb-3">
        <label htmlFor="regPassword" className="form-label fw-semibold mb-2">
          <i className="bi bi-key me-2"></i>
          Contraseña <span className="text-danger">*</span>
        </label>
        <PasswordInput
          id="regPassword"
          name="password"
          className={`form-control form-control-lg bg-dark text-white border-secondary ${
            touched.password && errors.password ? 'is-invalid' : ''
          } ${touched.password && !errors.password && formData.password ? 'is-valid' : ''}`}
          style={{ transition: 'all 0.3s ease' }}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        {touched.password && errors.password && (
          <div className="invalid-feedback d-block">
            <i className="bi bi-exclamation-circle me-1"></i>
            {errors.password}
          </div>
        )}
        {!errors.password && (
          <small className="text-white d-flex align-items-center mt-1">
            <i className="bi bi-info-circle me-1"></i>
            Mínimo 6 caracteres
          </small>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div className="mb-3">
        <label htmlFor="regConfirmPassword" className="form-label fw-semibold mb-2">
          <i className="bi bi-check2-circle me-2"></i>
          Confirmar Contraseña <span className="text-danger">*</span>
        </label>
        <PasswordInput
          id="regConfirmPassword"
          name="confirmPassword"
          className={`form-control form-control-lg bg-dark text-white border-secondary ${
            touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''
          } ${touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword ? 'is-valid' : ''}`}
          style={{ transition: 'all 0.3s ease' }}
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <div className="invalid-feedback d-block">
            <i className="bi bi-exclamation-circle me-1"></i>
            {errors.confirmPassword}
          </div>
        )}
        {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
          <div className="valid-feedback d-block">
            <i className="bi bi-check-circle me-1"></i>
            Las contraseñas coinciden
          </div>
        )}
      </div>

      {/* Campos opcionales - sección colapsable */}
      <div className="mb-3">
        <div className="border-top border-secondary pt-3 mt-3">
          {/* Teléfono */}
          <div className="mb-3">
            <label htmlFor="regPhone" className="form-label fw-semibold mb-2">
              <i className="bi bi-telephone me-2"></i>
              Teléfono
            </label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-white-50">
                <i className="bi bi-phone"></i>
              </span>
              <input
                id="regPhone"
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

          {/* Dirección de envío */}
          <div className="mb-3">
            <label htmlFor="regAddress" className="form-label fw-semibold mb-2">
              <i className="bi bi-geo-alt me-2"></i>
              Dirección de envío
            </label>
            <textarea
              id="regAddress"
              name="shipping_address"
              className="form-control form-control-lg bg-dark text-white border-secondary"
              style={{ transition: 'all 0.3s ease', resize: 'none' }}
              placeholder="Calle, número, ciudad..."
              rows="2"
              value={formData.shipping_address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="alert border-0 shadow-sm mb-4" style={{
        background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%)',
        borderLeft: '4px solid #0d6efd'
      }}>
      </div>

      {/* Botones */}
      <div className="d-grid gap-2">
        <button 
          className="btn btn-lg btn-primary position-relative overflow-hidden"
          type="submit"
          disabled={isSubmitting || loading}
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
          {isSubmitting || loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creando cuenta...
            </>
          ) : (
            <>
              <i className="bi bi-person-check me-2"></i>
              Crear Mi Cuenta
            </>
          )}
        </button>
        
        <div className="text-center my-3">
          <span className="text-white small">───────  o  ───────</span>
        </div>
        
        <button
          type="button"
          className="btn btn-lg btn-outline-light"
          onClick={onSwitchToLogin}
          disabled={isSubmitting || loading}
          style={{
            fontWeight: '600',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Ya tengo cuenta
        </button>
      </div>

      {/* Términos y condiciones */}
      <div className="mt-4 pt-3 border-top border-secondary">
        <p className="text-center text-white small mb-0">
          Al crear una cuenta, aceptas nuestros <a href="#" className="text-primary">Términos de Servicio</a> y <a href="#" className="text-primary">Política de Privacidad</a>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
