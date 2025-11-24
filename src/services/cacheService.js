/**
 * Servicio de cache en memoria para evitar llamadas redundantes a la API
 */

class CacheService {
  constructor(ttl = 3 * 60 * 1000) { // TTL por defecto: 3 minutos
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Obtiene un valor del cache
   * @param {string} key - Clave del cache
   * @returns {any|null} - Valor del cache o null si no existe o expiró
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Almacena un valor en el cache
   * @param {string} key - Clave del cache
   * @param {any} value - Valor a almacenar
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Invalida una entrada del cache
   * @param {string} key - Clave a invalidar
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Invalida todas las entradas que coincidan con un patrón
   * @param {string|RegExp} pattern - Patrón de búsqueda
   */
  invalidatePattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpia todo el cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Obtiene o carga un valor del cache
   * @param {string} key - Clave del cache
   * @param {Function} loader - Función para cargar el valor si no está en cache
   * @returns {Promise<any>} - Valor del cache o cargado
   */
  async getOrLoad(key, loader) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await loader();
    this.set(key, value);
    return value;
  }
}

// Exportar la clase para poder crear instancias personalizadas
export { CacheService };

// Instancia singleton para vinilos
export const vinylCache = new CacheService();

// Instancia singleton para carritos
export const cartCache = new CacheService(2 * 60 * 1000); // 2 minutos para carrito
