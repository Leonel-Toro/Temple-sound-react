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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [initialized, setInitialized] = React.useState(false);

  // Inicializar carrito solo cuando se necesite (lazy initialization)
  const ensureCartInitialized = React.useCallback(async () => {
    if (cart) return cart;
    
    try {
      const c = await cartService.ensureCart();
      setCart(c);
      return c;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [cart]);

  // Cargar items solo cuando se abre el modal por primera vez
  React.useEffect(() => {
    if (open && !initialized) {
      (async () => {
        try {
          setLoading(true);
          const c = await ensureCartInitialized();
          await refresh(c);
          setInitialized(true);
        } catch (e) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, initialized, ensureCartInitialized]);

  async function refresh(c = cart) {
    if (!c) return;
    const its = await cartService.listItems(c.id);
    
    if (its.length === 0) {
      setItems([]);
      return;
    }

    // OPTIMIZACIÓN: Obtener vinilos solo de los que necesitamos
    // Primero intentar obtener del cache
    const vinylIds = its.map(it => it.vinyl_id);
    const uniqueIds = [...new Set(vinylIds)];
    
    // Obtener vinilos (usará cache automáticamente si están disponibles)
    const vinyls = await Promise.all(
      uniqueIds.map(id => vinylService.get(id).catch(() => null))
    );
    
    // Crear un mapa de vinilos por ID para acceso rápido
    const vinylMap = new Map(vinyls.filter(Boolean).map(v => [v.id, v]));
    
    // Combinar items con sus vinilos correspondientes
    const detailed = its.map(it => ({
      ...it,
      vinyl: vinylMap.get(it.vinyl_id) || null
    }));
    
    setItems(detailed);
  }

  async function add(vinyl, qty = 1) {
    // Asegurar que el carrito esté inicializado
    const c = await ensureCartInitialized();
    
    try {
      // NO pasar items locales para forzar que obtenga datos frescos del servidor
      const result = await cartService.addOrUpdate(c.id, vinyl, qty, null);
      
      // Actualización optimista usando el resultado del servidor
      setItems(prev => {
        const existing = prev.find(it => it.vinyl_id === vinyl.id);
        
        if (existing) {
          // Si existe, actualizar con los datos del servidor
          return prev.map(it => 
            it.vinyl_id === vinyl.id 
              ? { ...it, ...result, vinyl: vinyl }
              : it
          );
        } else {
          // Si no existe, agregar el item con los datos del servidor
          return [...prev, { ...result, vinyl: vinyl }];
        }
      });
      
      // Invalidar cache para la próxima recarga
      cartService.invalidateCache(c.id);
    } catch (e) {
      console.error("Error al agregar al carrito:", e);
      throw e;
    }
  }

  async function increment(item) {
    const c = await ensureCartInitialized();
    const vinyl = item.vinyl;
    
    // VALIDACIÓN: Verificar que no supere el stock disponible
    if (vinyl && typeof vinyl.stock === 'number' && item.quantity >= vinyl.stock) {
      alert(`Stock máximo disponible: ${vinyl.stock}`);
      return;
    }
    
    try {
      // Pasar null para obtener datos frescos del servidor
      const result = await cartService.addOrUpdate(c.id, vinyl, +1, null);
      
      setItems(prev => prev.map(it => 
        it.id === item.id || it.vinyl_id === item.vinyl_id
          ? { ...it, ...result, vinyl: vinyl }
          : it
      ));
      
      cartService.invalidateCache(c.id);
    } catch (e) {
      console.error("Error al incrementar:", e);
      await refresh();
      throw e;
    }
  }

  async function decrement(item) {
    const c = await ensureCartInitialized();
    const vinyl = item.vinyl;
    const newQty = item.quantity - 1;
    
    try {
      // Pasar null para obtener datos frescos del servidor
      const result = await cartService.addOrUpdate(c.id, vinyl, -1, null);
      
      if (newQty <= 0 || result._removed) {
        setItems(prev => prev.filter(it => it.id !== item.id && it.vinyl_id !== item.vinyl_id));
      } else {
        setItems(prev => prev.map(it => 
          it.id === item.id || it.vinyl_id === item.vinyl_id
            ? { ...it, ...result, vinyl: vinyl }
            : it
        ));
      }
      
      cartService.invalidateCache(c.id);
    } catch (e) {
      console.error("Error al decrementar:", e);
      await refresh();
      throw e;
    }
  }

  async function remove(itemId) {
    const c = cart || await ensureCartInitialized();
    
    try {
      await cartService.removeItem(itemId, c.id);
      
      setItems(prev => prev.filter(it => it.id !== itemId));
      
      cartService.invalidateCache(c.id);
    } catch (e) {
      console.error("Error al eliminar:", e);
      await refresh();
      throw e;
    }
  }

  async function clear() {
    const c = await ensureCartInitialized();
    
    try {
      await cartService.clear(c.id);
      
      setItems([]);
      
      cartService.invalidateCache(c.id);
    } catch (e) {
      console.error("Error al limpiar carrito:", e);
      await refresh();
      throw e;
    }
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
