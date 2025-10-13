import { api } from "../lib/api";

const GUEST_USER_ID = 2;

export const cartService = {
  async ensureCart() {
    const carts = await api.get(`/cart?user_id=${GUEST_USER_ID}`);
    if (Array.isArray(carts) && carts.length > 0) return carts[0];
    const created = await api.post("/cart", { user_id: GUEST_USER_ID });
    return created;
  },

  async listItems(cartId) {
    const items = await api.get(`/cart_item?cart_id=${cartId}`);
    return Array.isArray(items) ? items : [];
  },

  async addOrUpdate(cartId, vinyl, deltaQty = 1) {
    const items = await this.listItems(cartId);
    const existing = items.find((it) => it.vinyl_id === vinyl.id);
    const currentQty = existing?.quantity ?? 0;
    const nextQty = currentQty + deltaQty;

    if (nextQty <= 0 && existing) {
      await api.del(`/cart_item/${existing.id}`);
      return { ...existing, quantity: 0, _removed: true };
    }

    if (typeof vinyl.stock === "number" && nextQty > vinyl.stock) {
      throw new Error("STOCK: cantidad supera el stock disponible");
    }

    if (existing) {
      return api.patch(`/cart_item/${existing.id}`, {
        quantity: nextQty,
        cart_id: cartId,
        vinyl_id: vinyl.id,
      });
    } else {
      return api.post("/cart_item", {
        cart_id: cartId,
        vinyl_id: vinyl.id,
        quantity: deltaQty,
      });
    }
  },

  updateItem(itemId, payload) {
    return api.patch(`/cart_item/${itemId}`, payload);
  },

  removeItem(itemId) {
    return api.del(`/cart_item/${itemId}`);
  },

  async clear(cartId) {
    const items = await this.listItems(cartId);
    await Promise.all(items.map((it) => api.del(`/cart_item/${it.id}`)));
  },
};
