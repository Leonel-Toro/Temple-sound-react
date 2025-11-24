import { api } from "../lib/api";
import { vinylCache } from "./cacheService";

export const vinylService = {
  /**
   * Lista todos los vinilos
   */
  list: async () => {
    return vinylCache.getOrLoad("vinyl:list", () => api.get("/vinyl"));
  },

  /**
   * Obtiene un vinilo por ID (con cache)
   */
  get: async (id) => {
    return vinylCache.getOrLoad(`vinyl:${id}`, () => api.get(`/vinyl/${id}`));
  },

  /**
   * Crea un vinilo e invalida el cache
   */
  create: async (payload) => {
    const result = await api.post("/vinyl", payload);
    vinylCache.invalidate("vinyl:list");
    return result;
  },

  /**
   * Actualiza un vinilo e invalida el cache relacionado
   */
  update: async (id, payload) => {
    const result = await api.patch(`/vinyl/${id}`, payload);
    vinylCache.invalidate(`vinyl:${id}`);
    vinylCache.invalidate("vinyl:list");
    return result;
  },

  /**
   * Elimina un vinilo e invalida el cache relacionado
   */
  remove: async (id) => {
    const result = await api.del(`/vinyl/${id}`);
    vinylCache.invalidate(`vinyl:${id}`);
    vinylCache.invalidate("vinyl:list");
    return result;
  },
};
