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

    // IMPORTANTE: Forzar recarga sin cache para obtener los items actuales del servidor
    const items = await cartService.listItems(cart.id, true);
    if (!items.length) throw new Error("El carrito está vacío");

    // OPTIMIZACIÓN: Obtener vinilos en paralelo usando cache
    const vinylIds = [...new Set(items.map(it => it.vinyl_id))];
    const vinyls = await Promise.all(
      vinylIds.map(id => vinylService.get(id).catch(() => null))
    );
    
    // Crear un mapa de vinilos por ID para acceso rápido
    const vinylMap = new Map(vinyls.filter(Boolean).map(v => [v.id, v]));
    
    // Combinar items con sus precios correspondientes
    const detailed = items.map(it => ({
      ...it,
      price_unit: Number(vinylMap.get(it.vinyl_id)?.price ?? 0)
    }));

    const total = detailed.reduce((acc, it) => acc + (it.price_unit * (it.quantity || 0)), 0);

    const order = await this.create({
      user_id: 2,
      status: "pagada",
      total,
    });

    // Usar Promise.all para crear todos los items en paralelo
    await Promise.all(
      detailed.map(it => 
        this.addItem(order.id, {
          vinyl_id: it.vinyl_id,
          quantity: it.quantity,
          price_unit: it.price_unit,
        })
      )
    );

    if (opts.clearAfter) {
      await cartService.clear(cart.id);
      // Invalidar cache después de limpiar
      cartService.invalidateCache(cart.id);
    }

    return order;
  },
};
