import { api } from "../lib/api";
import { cartService } from "./cartService";
import { vinylService } from "./vinylService";
import { userService } from "./userService";

export const orderService = {
  list() {
    return api.get("/order");
  },
  async listWithUsers() {
    const orders = await api.get("/order");
    const users = await userService.list();
    const userMap = new Map(users.map(u => [u.id, u]));
    
    return orders.map(order => ({
      ...order,
      user: userMap.get(order.user_id) || null
    }));
  },
  create(payload) {
    return api.post("/order", payload);
  },
  addItem(orderId, { vinyl_id, quantity, price_unit }) {
    return api.post("/order_item", { 
      order_id: orderId, 
      vinyl_id, 
      quantity, 
      price_at_purchase: price_unit 
    });
  },
  
  addItems(orderId, items) {
    return api.post("/order_items", {
      order_id: orderId,
      items: items.map(it => ({
        vinyl_id: it.vinyl_id,
        quantity: it.quantity,
        price_at_purchase: it.price_unit
      }))
    });
  },
  async getWithItems(orderId) {
    // Usar el nuevo endpoint que trae la orden con sus items filtrados
    const items = await api.get(`/order/${orderId}`);
    return Array.isArray(items) ? items : [];
  },
  
  async getOrderWithUser(orderId) {
    const [items, orders] = await Promise.all([
      api.get(`/order/${orderId}`),
      api.get("/order")
    ]);
    
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Orden no encontrada");
    
    const user = await userService.get(order.user_id).catch(() => null);
    
    return {
      order,
      user,
      items: Array.isArray(items) ? items : []
    };
  },
  
  async cancelOrder(orderId, reason = "Cancelada por administrador") {
    return api.patch(`/order/${orderId}`, { 
      status: "cancelada",
      cancellation_reason: reason
    });
  },

  async createFromCartPaid(cart, opts = { clearAfter: true, userId: null }) {
    if (!cart?.id) throw new Error("Carrito inválido");
    
    // Validar que se proporcione un userId
    if (!opts.userId) {
      throw new Error("Debes iniciar sesión para completar la compra");
    }

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
      user_id: opts.userId,
      status: "pagada",
      total,
    });

    // Usar el nuevo endpoint que acepta array de items
    await this.addItems(order.id, detailed);

    if (opts.clearAfter) {
      await cartService.clear(cart.id);
      // Invalidar cache después de limpiar
      cartService.invalidateCache(cart.id);
    }

    return order;
  },
};
