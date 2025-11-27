import React from "react";
import { orderService } from "../../services/orderService";
import { vinylService } from "../../services/vinylService";
import { userService } from "../../services/userService";

const fmtCLP = (v) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
    .format(Number(v) || 0);

function useOrderIdProp(idProp) {
  if (idProp != null) return idProp;
  const parts = (typeof window !== "undefined" ? window.location.pathname : "").split("/");
  const last = parts[parts.length - 1];
  const n = Number(last);
  return Number.isFinite(n) ? n : null;
}

export default function PagoPage({ id: idProp }) {
  const id = useOrderIdProp(idProp);
  const [order, setOrder] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [items, setItems] = React.useState([]); // items enriquecidos con datos del vinilo
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // Obtener la información de la orden primero
        const allOrders = await orderService.list();
        const orderData = allOrders.find(o => o.id === id);
        
        if (!orderData) {
          throw new Error("Orden no encontrada");
        }

        // Obtener los items de la orden
        const rawItems = await orderService.getWithItems(id);
        
        if (!rawItems || rawItems.length === 0) {
          throw new Error("No se encontraron items para esta orden");
        }

        // OPTIMIZACIÓN: Obtener vinilos en paralelo usando cache
        const vinylIds = [...new Set(rawItems.map(it => it.vinyl_id))];
        const vinyls = await Promise.all(
          vinylIds.map(vid => vinylService.get(vid).catch(() => null))
        );
        
        // Crear un mapa de vinilos por ID para acceso rápido
        const vinylMap = new Map(vinyls.filter(Boolean).map(v => [v.id, v]));
        
        // Enriquecer cada item con info del vinilo
        const detailed = rawItems.map(it => ({
          ...it,
          vinyl: vinylMap.get(it.vinyl_id) || null
        }));

        if (!alive) return;
        
        // Obtener información del usuario si existe
        if (orderData.user_id) {
          const userData = await userService.get(orderData.user_id);
          setUser(userData);
        }
        
        setOrder(orderData);
        setItems(detailed);
      } catch (e) {
        console.error("Error cargando orden:", e);
        setError(e.message || "No se pudo cargar la orden");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <main className="py-4 mt-5"><div className="container text-white">Cargando…</div></main>;
  if (error) return <main className="py-4 mt-5"><div className="container"><div className="alert alert-danger">{error}</div></div></main>;
  if (!order) return <main className="py-4 mt-5"><div className="container text-white">Orden no encontrada</div></main>;

  // Subtotal calculado desde los items
  const subtotal = items.reduce((acc, it) => {
    const unit = Number(it.price_at_purchase) || Number(it.price_unit) || Number(it.vinyl?.price) || 0;
    return acc + unit * Number(it.quantity || 0);
  }, 0);
  const totalItems = items.reduce((a, it) => a + Number(it.quantity || 0), 0);

  return (
    <main className="py-4 mt-5 bg-dark text-white">
      <div className="container">

        {/* Encabezado */}
        <div className="card bg-dark border-0 mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div className="text-success fs-3"><i className="bi bi-check-circle-fill"></i></div>
              <div className="flex-grow-1">
                <h1 className="h4 mb-1 text-white">¡Pago exitoso!</h1>
                <div className="text-white-50 small">
                  Número de orden <span className="text-white">{order.id}</span> · Estado:{" "}
                  <span className="badge text-bg-success">Pagada</span>
                </div>
                {user && (
                  <div className="text-white-50 small mt-1">
                    <i className="bi bi-person-circle me-1"></i>
                    Cliente: <span className="text-white">{user.name || user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="row g-4">
          {/* Lista de ítems */}
          <div className="col-12 col-lg-8">
            <div className="card bg-dark border-0">
              <div className="card-body">
                <h5 className="card-title text-white mb-3">Lo que compraste</h5>

                {items.length === 0 ? (
                  <div className="text-white-50">No hay ítems.</div>
                ) : (
                  <div className="list-group list-group-flush">
                    {items.map((it, idx) => {
                      const v = it.vinyl;
                      const imgUrl = v?.image?.[0]?.url || "";
                      const unit = Number(it.price_at_purchase) || Number(it.price_unit) || Number(v?.price) || 0;
                      const lineTotal = unit * Number(it.quantity || 0);
                      return (
                        <div key={it.id || idx} className="list-group-item bg-dark text-white border-secondary">
                          <div className="d-flex align-items-center">
                            {/* Imagen */}
                            <div className="me-3">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={v?.name || `Vinilo ${it.vinyl_id}`}
                                  width="72"
                                  height="72"
                                  style={{ objectFit: "cover", borderRadius: 8 }}
                                />
                              ) : (
                                <div
                                  style={{ width: 72, height: 72, borderRadius: 8 }}
                                  className="bg-secondary"
                                />
                              )}
                            </div>

                            {/* Nombre y categoría */}
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{v?.name || `Vinilo ${it.vinyl_id}`}</div>
                              <div className="text-white-50 small">{v?.category || "—"}</div>
                              <div className="small">
                                <span className="text-white-50">ID Vinilo: </span>{it.vinyl_id}
                              </div>
                            </div>

                            {/* Cantidad y precios */}
                            <div className="text-end" style={{ minWidth: 160 }}>
                              <div className="small text-white-50">Precio unitario</div>
                              <div className="fw-bold">{fmtCLP(unit)}</div>
                              <div className="small text-white-50">Cantidad</div>
                              <div className="fw-semibold">{it.quantity}</div>
                            </div>

                            {/* Total línea */}
                            <div className="text-end ms-4" style={{ minWidth: 140 }}>
                              <div className="small text-white-50">Total</div>
                              <div className="fw-bold">{fmtCLP(lineTotal)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="col-12 col-lg-4">
            {/* Información de envío */}
            {user && (
              <div className="card bg-dark border-0 mb-3">
                <div className="card-body">
                  <h6 className="card-title text-white mb-3">
                    <i className="bi bi-truck me-2"></i>Información de envío
                  </h6>
                  
                  <div className="mb-2">
                    <div className="small text-white-50">Nombre</div>
                    <div className="text-white">{user.name || 'No especificado'}</div>
                  </div>
                  
                  {user.email && (
                    <div className="mb-2">
                      <div className="small text-white-50">Email</div>
                      <div className="text-white">{user.email}</div>
                    </div>
                  )}
                  
                  {user.phone && (
                    <div className="mb-2">
                      <div className="small text-white-50">Teléfono</div>
                      <div className="text-white">{user.phone}</div>
                    </div>
                  )}
                  
                  {user.shipping_address && (
                    <div className="mb-2">
                      <div className="small text-white-50">Dirección</div>
                      <div className="text-white">{user.shipping_address}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Resumen de compra */}
            <div className="card bg-dark border-0">
              <div className="card-body">
                <h6 className="card-title text-white-50 d-flex justify-content-between">
                  <span className="text-white">Resumen</span>
                  <span className="text-white small">{totalItems} artículo(s)</span>
                </h6>

                <div className="d-flex justify-content-between">
                  <span className="text-white-50">Subtotal</span>
                  <span className="text-white-50">{fmtCLP(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-white-50">Envío</span>
                  <span className="text-white-50">$ 0</span>
                </div>

                <hr className="border-secondary opacity-25" />

                <div className="d-flex justify-content-between fw-bold">
                  <span>Total pagado</span>
                  <span>{fmtCLP(order.total || subtotal)}</span>
                </div>

                <div className="d-grid mt-3">
                  <a className="btn btn-light" href="/vinilos">Seguir comprando</a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
