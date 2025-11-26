// src/services/userService.js
import { apiUsers } from "../lib/api";
import { CacheService } from "./cacheService";

const userCache = new CacheService();

export const userService = {
  /**
   * Autenticar usuario (login)
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Usuario autenticado
   */
  login: async (email, password) => {
    try {
      // Si tu API tiene un endpoint específico de login, úsalo aquí
      // Por ejemplo: return apiUsers.post("/user/login", { email, password });
      
      // Si no, buscar el usuario en la lista
      const users = await apiUsers.get("/user");
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (!user) {
        throw new Error("Credenciales inválidas");
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  register: async (userData) => {
    const result = await apiUsers.post("/user", userData);
    userCache.invalidate("users:list");
    return result;
  },

  list: async () => {
    return userCache.getOrLoad("users:list", () => apiUsers.get("/user"));
  },

  get: async (id) => {
    return userCache.getOrLoad(`user:${id}`, () => apiUsers.get(`/user/${id}`));
  },

  create: async (p) => {
    const result = await apiUsers.post("/user", p);
    userCache.invalidate("users:list");
    return result;
  },

  update: async (id, p) => {
    const result = await apiUsers.patch(`/user/${id}`, p);
    userCache.invalidate(`user:${id}`);
    userCache.invalidate("users:list");
    return result;
  },

  remove: async (id) => {
    const result = await apiUsers.del(`/user/${id}`);
    userCache.invalidate(`user:${id}`);
    userCache.invalidate("users:list");
    return result;
  },
};
