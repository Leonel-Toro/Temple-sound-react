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
   * Usa POST en /update_vinilo
   */
  update: async (id, payload) => {
    console.log('🔧 vinylService.update llamado');
    console.log('  - ID:', id);
    console.log('  - Tipo de payload:', payload instanceof FormData ? 'FormData' : 'JSON');
    console.log('  - Endpoint: /update_vinilo');
    
    if (payload instanceof FormData) {
      console.log('📦 FormData a enviar:');
      for (let pair of payload.entries()) {
        console.log('  -', pair[0], ':', pair[1]);
      }
    } else {
      console.log('📦 JSON a enviar:', payload);
    }
    
    const result = await api.post("/update_vinilo", payload);
    console.log('✅ Respuesta recibida:', result);
    
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
