import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from './ui/PasswordInput';

/**
 * Componente de formulario de Login
 * Incluye validación en tiempo real, manejo de errores y loading states
 */
export const LoginForm = ({ onSuccess, onSwitchToRegister, onClose }) => {
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar un campo individual
  const validateField = (name, value) => {
    switch (name) {
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
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    // Marcar todos los campos como tocados
    setTouched({
      email: true,
      password: true,
    });

    // Validar
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Login exitoso
        if (onSuccess) {
          onSuccess(result.user);
        }
        if (onClose) {
          onClose();
        }
      } else {
        // Error en login
        setSubmitError(result.error || 'Error al iniciar sesión');
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
          <i className="bi bi-shield-lock-fill auth-icon"></i>
        </div>
        <p className="text-white mt-3 mb-0">Ingresa a tu cuenta</p>
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

      {/* Campo Email */}
      <div className="mb-4">
        <label htmlFor="loginEmail" className="form-label fw-semibold mb-2">
          <i className="bi bi-envelope me-2"></i>
          Email <span className="text-danger">*</span>
        </label>
        <div className="input-group">
          <span className="input-group-text bg-dark border-secondary text-white-50">
            <i className="bi bi-at"></i>
          </span>
          <input
            id="loginEmail"
            name="email"
            type="email"
            className={`form-control form-control-lg bg-dark text-white border-secondary ${
              touched.email && errors.email ? 'is-invalid' : ''
            } ${touched.email && !errors.email && formData.email ? 'is-valid' : ''}`}
            style={{
              borderLeft: 'none',
              transition: 'all 0.3s ease'
            }}
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="username"
            disabled={isSubmitting}
          />
          {touched.email && errors.email && (
            <div className="invalid-feedback">
              <i className="bi bi-exclamation-circle me-1"></i>
              {errors.email}
            </div>
          )}
          {touched.email && !errors.email && formData.email && (
            <div className="valid-feedback">
              <i className="bi bi-check-circle me-1"></i>
              Email válido
            </div>
          )}
        </div>
      </div>

      {/* Campo Contraseña */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="loginPassword" className="form-label fw-semibold mb-0">
            <i className="bi bi-key me-2"></i>
            Contraseña <span className="text-danger">*</span>
          </label>
          <a href="#" className="text-primary text-decoration-none small" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-question-circle me-1"></i>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <PasswordInput
          id="loginPassword"
          name="password"
          className={`form-control form-control-lg bg-dark text-white border-secondary ${
            touched.password && errors.password ? 'is-invalid' : ''
          } ${touched.password && !errors.password && formData.password ? 'is-valid' : ''}`}
          style={{
            transition: 'all 0.3s ease'
          }}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="current-password"
          disabled={isSubmitting}
        />
        {touched.password && errors.password && (
          <div className="invalid-feedback d-block">
            <i className="bi bi-exclamation-circle me-1"></i>
            {errors.password}
          </div>
        )}
        {touched.password && !errors.password && formData.password && (
          <div className="valid-feedback d-block">
            <i className="bi bi-check-circle me-1"></i>
            Contraseña válida
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="d-grid gap-2 mt-4">
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
              Iniciando sesión...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Iniciar Sesión
            </>
          )}
        </button>
        
        <div className="text-center my-3">
          <span className="text-white small">───────  o  ───────</span>
        </div>

        <button
          type="button"
          className="btn btn-lg btn-outline-light"
          onClick={onSwitchToRegister}
          disabled={isSubmitting || loading}
          style={{
            fontWeight: '600',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="bi bi-person-plus me-2"></i>
          Crear nueva cuenta
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-3 border-top border-secondary">
        <p className="text-center text-white small mb-0">
          <i className="bi bi-shield-check me-1"></i>
          Tus datos están seguros y protegidos
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
