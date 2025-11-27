import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { authService } from "../services/authService";

export default function CartModal() {
  const {
    open, setOpen,
    cart,                   // ⬅️ NECESARIO para crear la orden
    items, loading, error,
    increment, decrement, remove, clear,
    totalCLP, priceCLP
  } = useCart();

  const { user, updateUser } = useAuth(); // Obtener el usuario autenticado

  // ⬅️ Estados que usas en handlePay
  const [payLoading, setPayLoading] = React.useState(false);
  const [payError, setPayError] = React.useState("");

  // Recargar datos del usuario cuando se abre el modal
  React.useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
      // Obtener datos frescos del usuario desde sessionStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        updateUser(currentUser);
      }
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [open, updateUser]);

  if (!open) return null;

  async function handlePay() {
    try {
      setPayError("");
      setPayLoading(true);

      // Verificar que el usuario esté autenticado
      if (!user || !user.id) {
        setPayError("Debes iniciar sesión para realizar una compra");
        return;
      }

      // DEBUG: Mostrar datos del usuario
      console.log("Usuario actual:", user);
      console.log("Teléfono:", user.phone);
      console.log("Dirección:", user.shipping_address);

      // Validar que el usuario tenga datos de envío completos
      if (!user.phone || !user.shipping_address) {
        setPayError("Debes completar tu información de envío (teléfono y dirección) en tu perfil antes de comprar");
        return;
      }

      // crea orden "pagada" (sin pasarela) y vacía el carrito
      const order = await orderService.createFromCartPaid(cart, { 
        clearAfter: true,
        userId: user.id
      });

      setOpen(false);
      window.location.href = `/pago-exitoso/${order.id}`;
    } catch (e) {
      setPayError(e.message || "No se pudo procesar el pago");
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tu carrito</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setOpen(false)} />
            </div>

            <div className="modal-body">
              {loading && <div className="alert alert-info">Cargando…</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              {payError && <div className="alert alert-danger">{payError}</div>}

              {items.length === 0 && !loading ? (
                <div className="text-center text-muted py-4">No hay productos en tu carrito.</div>
              ) : (
                <div className="list-group">
                  {items.map((it) => {
                    const v = it.vinyl || {};
                    const img = v.image?.[0]?.url;
                    return (
                      <div key={it.id} className="list-group-item">
                        <div className="d-flex gap-3 align-items-center">
                          {img && <img src={img} alt={v.name} width="64" height="64" style={{objectFit:"cover"}} />}
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{v.name}</div>
                            <div className="text-muted small">{v.category}</div>
                            <div className="fw-bold">{priceCLP(v.price)}</div>
                          </div>

                          <div className="btn-group" role="group" aria-label="Cantidad">
                            <button className="btn btn-outline-secondary" onClick={() => decrement(it)} disabled={payLoading}>-</button>
                            <button className="btn btn-outline-secondary" disabled>{it.quantity}</button>
                            <button className="btn btn-outline-secondary" onClick={() => increment(it)} disabled={payLoading}>+</button>
                          </div>

                          <button className="btn btn-outline-danger" onClick={() => remove(it.id)} disabled={payLoading}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer d-flex flex-column">
              {/* Mensaje de advertencia si faltan datos */}
              {user && (!user.phone || !user.shipping_address) && (
                <div className="alert alert-warning w-100 mb-2 py-2 small">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Completa tu información de envío (teléfono y dirección) en tu perfil para poder comprar.
                </div>
              )}
              
              <div className="d-flex justify-content-between w-100">
                <button className="btn btn-outline-secondary" onClick={clear} disabled={items.length === 0 || payLoading}>
                  Vaciar
                </button>
                <div className="d-flex align-items-center gap-3">
                  <div className="fw-bold">Total: {priceCLP(totalCLP())}</div>
                  <button
                    className="btn btn-primary"
                    disabled={items.length === 0 || payLoading || !user || !user.phone || !user.shipping_address}
                    onClick={handlePay}
                    title={!user ? "Debes iniciar sesión para comprar" : (!user.phone || !user.shipping_address) ? "Completa tu información de envío" : ""}
                  >
                    {payLoading ? "Procesando…" : "Ir a pagar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={() => setOpen(false)} />
    </>
  );
}
