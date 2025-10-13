import { api } from "../lib/api";
import { cartService } from "./cartService";
import { vinylService } from "./vinylService";

export const orderService = {
  create(payload) {
    return api.post("/order", payload);
  },
  addItem(orderId, { vinyl_id, quantity, price_unit }) {
    return api.post("/order_item", { order_id: orderId, vinyl_id, quantity, price_unit });
  },
  get(orderId) {
    return api.get(`/order/${orderId}`);
  },
  async listItems(orderId) {
    const items = await api.get(`/order_item?order_id=${orderId}`);
    return Array.isArray(items) ? items : [];
  },

  async createFromCartPaid(cart, opts = { clearAfter: true }) {
    if (!cart?.id) throw new Error("Carrito inválido");

    const items = await cartService.listItems(cart.id);
    if (!items.length) throw new Error("El carrito está vacío");

    const detailed = await Promise.all(items.map(async (it) => {
      try {
        const vin = await vinylService.get(it.vinyl_id);
        return { ...it, price_unit: Number(vin?.price ?? 0) };
      } catch {
        return { ...it, price_unit: 0 };
      }
    }));

    const total = detailed.reduce((acc, it) => acc + (it.price_unit * (it.quantity || 0)), 0);

    const order = await this.create({
      user_id: 2,
      status: "pagada",
      total,
    });

    for (const it of detailed) {
      await this.addItem(order.id, {
        vinyl_id: it.vinyl_id,
        quantity: it.quantity,
        price_unit: it.price_unit,
      });
    }

    if (opts.clearAfter) {
      await cartService.clear(cart.id);
    }

    return order;
  },
};
