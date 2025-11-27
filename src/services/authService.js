import { apiUsers, apiAuth } from "../lib/api";

// Claves para sessionStorage
const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_ROLE: 'userRole',
  USER_STATUS: 'userStatus',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  USER_FIRST_NAME: 'userFirstName',
  USER_LAST_NAME: 'userLastName',
  USER_PHONE: 'userPhone',
  USER_SHIPPING_ADDRESS: 'userShippingAddress',
};

/**
 * Validaciones para formularios de autenticación
 */
export const validators = {
  email: (email) => {
    if (!email || email.trim() === '') {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El formato del email no es válido';
    }
    return null;
  },

  password: (password) => {
    if (!password || password.trim() === '') {
      return 'La contraseña es requerida';
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword || confirmPassword.trim() === '') {
      return 'Debes confirmar la contraseña';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  },

  required: (value, fieldName = 'Este campo') => {
    if (!value || value.trim() === '') {
      return `${fieldName} es requerido`;
    }
    return null;
  },
};

/**
 * Sanitizar inputs para prevenir XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Guardar datos del usuario en sessionStorage
 */
const saveUserToSession = (userData) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, userData.id.toString());
    sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, userData.role);
    sessionStorage.setItem(STORAGE_KEYS.USER_STATUS, userData.status);
    sessionStorage.setItem(STORAGE_KEYS.USER_EMAIL, userData.email);
    
    if (userData.name) {
      sessionStorage.setItem(STORAGE_KEYS.USER_NAME, userData.name);
    }
    if (userData.first_name) {
      sessionStorage.setItem(STORAGE_KEYS.USER_FIRST_NAME, userData.first_name);
    }
    if (userData.last_name) {
      sessionStorage.setItem(STORAGE_KEYS.USER_LAST_NAME, userData.last_name);
    }
    if (userData.phone) {
      sessionStorage.setItem(STORAGE_KEYS.USER_PHONE, userData.phone);
    }
    if (userData.shipping_address) {
      sessionStorage.setItem(STORAGE_KEYS.USER_SHIPPING_ADDRESS, userData.shipping_address);
    }
  } catch (error) {
    console.error('Error al guardar datos en sessionStorage:', error);
    throw new Error('No se pudieron guardar los datos de sesión');
  }
};

/**
 * Obtener datos del usuario desde sessionStorage
 */
const getUserFromSession = () => {
  try {
    const userId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
    
    if (!userId) {
      return null;
    }

    return {
      id: parseInt(userId, 10),
      role: sessionStorage.getItem(STORAGE_KEYS.USER_ROLE),
      status: sessionStorage.getItem(STORAGE_KEYS.USER_STATUS),
      email: sessionStorage.getItem(STORAGE_KEYS.USER_EMAIL),
      name: sessionStorage.getItem(STORAGE_KEYS.USER_NAME),
      first_name: sessionStorage.getItem(STORAGE_KEYS.USER_FIRST_NAME),
      last_name: sessionStorage.getItem(STORAGE_KEYS.USER_LAST_NAME),
      phone: sessionStorage.getItem(STORAGE_KEYS.USER_PHONE),
      shipping_address: sessionStorage.getItem(STORAGE_KEYS.USER_SHIPPING_ADDRESS),
    };
  } catch (error) {
    console.error('Error al leer datos de sessionStorage:', error);
    return null;
  }
};

/**
 * Limpiar todos los datos de sesión
 */
const clearSession = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    // Limpiar también cualquier dato de carrito u otros datos sensibles
    const allKeys = Object.keys(sessionStorage);
    allKeys.forEach(key => {
      if (key.startsWith('user') || key.startsWith('auth')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error al limpiar sessionStorage:', error);
  }
};

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (email, password) => {
    // Validar inputs
    const emailError = validators.email(email);
    if (emailError) {
      throw new Error(emailError);
    }

    const passwordError = validators.password(password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    try {
      // Sanitizar inputs  
      const sanitizedEmail = email.trim().toLowerCase();

      // Autenticar mediante el endpoint de login
      // El backend verifica las credenciales y retorna el usuario si son correctas
      const user = await apiAuth.post('/auth/login', {
        email: sanitizedEmail,
        password: password
      });

      // Si llegamos aquí, las credenciales son correctas y tenemos el usuario
      if (!user || !user.id) {
        throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
      }

      if (user.status !== 'active') {
        throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
      }

      // Guardar en sessionStorage
      saveUserToSession(user);

      // Retornar datos del usuario
      return user;
    } catch (error) {
      // Manejar errores específicos de la API
      if (error.message && (error.message.includes('Invalid Credentials') || error.message.includes('accessdenied'))) {
        throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
      }
      if (error.message && (error.message.includes('Credenciales') || error.message.includes('cuenta'))) {
        throw error;
      }
      console.error('Error en login:', error);
      throw new Error('Error al iniciar sesión. Por favor, intenta nuevamente.');
    }
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (formData) => {
    // Validar todos los campos
    const errors = {};

    const emailError = validators.email(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validators.password(formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validators.confirmPassword(
      formData.password, 
      formData.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const firstNameError = validators.required(formData.first_name, 'El nombre');
    if (firstNameError) errors.first_name = firstNameError;

    const lastNameError = validators.required(formData.last_name, 'El apellido');
    if (lastNameError) errors.last_name = lastNameError;

    // Si hay errores, lanzar excepción con todos los errores
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors).join('. ');
      throw new Error(errorMessage);
    }

    try {
      // Sanitizar inputs
      const sanitizedData = {
        email: sanitizeInput(formData.email.trim().toLowerCase()),
        password: formData.password, // En producción, hashear
        first_name: sanitizeInput(formData.first_name.trim()),
        last_name: sanitizeInput(formData.last_name.trim()),
        name: sanitizeInput(`${formData.first_name.trim()} ${formData.last_name.trim()}`),
        role: 'user', // Siempre 'user' para registros desde el modal
        status: 'active', // Siempre 'active' para nuevos usuarios
        phone: formData.phone ? sanitizeInput(formData.phone.trim()) : '',
        shipping_address: formData.shipping_address ? sanitizeInput(formData.shipping_address.trim()) : '',
      };

      // Verificar que el email no exista
      const existingUsers = await apiUsers.get('/user');
      const emailExists = existingUsers.some(
        u => u.email.toLowerCase() === sanitizedData.email
      );

      if (emailExists) {
        throw new Error('Este email ya está registrado. Por favor, inicia sesión.');
      }

      // Crear el usuario en la API
      const newUser = await apiUsers.post('/user', sanitizedData);

      // Auto-login: guardar en sessionStorage
      saveUserToSession(newUser);

      // Retornar datos del usuario (sin contraseña)
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error.message.includes('email ya está registrado')) {
        throw error;
      }
      console.error('Error en registro:', error);
      throw new Error('Error al crear la cuenta. Por favor, intenta nuevamente.');
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    try {
      // Limpiar sessionStorage
      clearSession();

      // Si existe un endpoint de logout en el backend, llamarlo
      // apiUsers.post('/user/logout').catch(err => console.error('Error en logout:', err));
      
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      // Aunque falle, limpiar la sesión local
      clearSession();
      return true;
    }
  },

  /**
   * Obtener usuario actual desde sessionStorage
   */
  getCurrentUser: () => {
    return getUserFromSession();
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: () => {
    const user = getUserFromSession();
    return user !== null && user.status === 'active';
  },

  /**
   * Verificar si el usuario es admin
   */
  isAdmin: () => {
    const user = getUserFromSession();
    return user?.role === 'admin';
  },

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole: (role) => {
    const user = getUserFromSession();
    return user?.role === role;
  },
};

export default authService;
