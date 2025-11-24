import { api } from "../lib/api";
import { cartCache } from "./cacheService";

const GUEST_USER_ID = 2;

export const cartService = {
  async ensureCart() {
    const cacheKey = `cart:user:${GUEST_USER_ID}`;
    const cached = cartCache.get(cacheKey);
    if (cached) return cached;

    const carts = await api.get(`/cart?user_id=${GUEST_USER_ID}`);
    let cart;
    if (Array.isArray(carts) && carts.length > 0) {
      cart = carts[0];
    } else {
      cart = await api.post("/cart", { user_id: GUEST_USER_ID });
    }
    
    cartCache.set(cacheKey, cart);
    return cart;
  },

  async listItems(cartId, forceRefresh = false) {
    const cacheKey = `cart:items:${cartId}`;
    
    if (forceRefresh) {
      cartCache.invalidate(cacheKey);
    }
    
    return cartCache.getOrLoad(cacheKey, async () => {
      const items = await api.get(`/cart_item?cart_id=${cartId}`);
      return Array.isArray(items) ? items : [];
    });
  },

  async addOrUpdate(cartId, vinyl, deltaQty = 1, currentItems = null) {
    // Si se proporciona currentItems, evitamos una llamada a la API
    const items = currentItems ?? await this.listItems(cartId);
    const existing = items.find((it) => it.vinyl_id === vinyl.id);
    const currentQty = existing?.quantity ?? 0;
    const nextQty = currentQty + deltaQty;

    if (nextQty <= 0 && existing) {
      const result = await api.del(`/cart_item/${existing.id}`);
      return { ...existing, quantity: 0, _removed: true };
    }

    if (typeof vinyl.stock === "number" && nextQty > vinyl.stock) {
      throw new Error("STOCK: cantidad supera el stock disponible");
    }

    let result;
    if (existing) {
      result = await api.patch(`/cart_item/${existing.id}`, {
        quantity: nextQty,
        cart_id: cartId,
        vinyl_id: vinyl.id,
      });
    } else {
      result = await api.post("/cart_item", {
        cart_id: cartId,
        vinyl_id: vinyl.id,
        quantity: deltaQty,
      });
    }
    
    return result;
  },

  updateItem(itemId, payload, cartId = null) {
    return api.patch(`/cart_item/${itemId}`, payload);
  },

  removeItem(itemId, cartId = null) {
    return api.del(`/cart_item/${itemId}`);
  },

  async clear(cartId) {
    const items = await this.listItems(cartId);
    await Promise.all(items.map((it) => api.del(`/cart_item/${it.id}`)));
  },
  
  // Método para invalidar manualmente el cache cuando sea necesario
  invalidateCache(cartId) {
    if (cartId) {
      cartCache.invalidate(`cart:items:${cartId}`);
    }
  }
};
