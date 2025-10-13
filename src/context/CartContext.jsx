import React from "react";
import { cartService } from "../services/cartService";
import { vinylService } from "../services/vinylService";

function priceCLP(v) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v ?? 0);
}

const CartCtx = React.createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const c = await cartService.ensureCart();
        setCart(c);
        await refresh(c);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh(c = cart) {
    if (!c) return;
    const its = await cartService.listItems(c.id);
    const detailed = await Promise.all(
      its.map(async (it) => {
        try {
          const v = await vinylService.get(it.vinyl_id);
          return { ...it, vinyl: v };
        } catch {
          return it;
        }
      })
    );
    setItems(detailed);
  }

  async function add(vinyl, qty = 1) {
    if (!cart) return;
    await cartService.addOrUpdate(cart.id, vinyl, qty);
    await refresh();
  }

  async function increment(item) {
    if (!cart) return;
    const vinyl = item.vinyl ?? (await vinylService.get(item.vinyl_id));
    await cartService.addOrUpdate(cart.id, vinyl, +1);
    await refresh();
  }

  async function decrement(item) {
    if (!cart) return;
    const vinyl = item.vinyl ?? (await vinylService.get(item.vinyl_id));
    await cartService.addOrUpdate(cart.id, vinyl, -1);
    await refresh();
  }

  async function remove(itemId) {
    await cartService.removeItem(itemId);
    await refresh();
  }

  async function clear() {
    if (!cart) return;
    await cartService.clear(cart.id);
    await refresh();
  }

  const value = {
    cart, items, loading, error, open, setOpen,
    add, increment, decrement, remove, clear,
    totalCLP: () => items.reduce((acc, it) => acc + (it.vinyl?.price ?? 0) * (it.quantity ?? 0), 0),
    priceCLP,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartCtx);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
