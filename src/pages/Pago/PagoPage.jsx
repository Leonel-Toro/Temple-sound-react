import React from "react";
import { orderService } from "../../services/orderService";
import { vinylService } from "../../services/vinylService";

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
  const [items, setItems] = React.useState([]); // items enriquecidos con datos del vinilo
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // Obtener los items de la orden usando el nuevo endpoint
        const rawItems = await orderService.getWithItems(id);

        // OPTIMIZACIÓN: Obtener vinilos en paralelo usando cache
        const vinylIds = [...new Set(rawItems.map(it => it.vinyl_id))];
        const vinyls = await Promise.all(
          vinylIds.map(id => vinylService.get(id).catch(() => null))
        );
        
        // Crear un mapa de vinilos por ID para acceso rápido
        const vinylMap = new Map(vinyls.filter(Boolean).map(v => [v.id, v]));
        
        // Enriquecer cada item con info del vinilo
        const detailed = rawItems.map(it => ({
          ...it,
          vinyl: vinylMap.get(it.vinyl_id) || null
        }));

        if (!alive) return;
        
        // Crear un objeto de orden básico desde los items
        const orderData = {
          id: id,
          status: "pagada",
          total: detailed.reduce((acc, it) => {
            const unit = Number(it.price_unit) || 0;
            return acc + unit * Number(it.quantity || 0);
          }, 0)
        };
        
        setOrder(orderData);
        setItems(detailed);
      } catch (e) {
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

  // Subtotal calculado desde los items (por si en Xano cambiaste algo)
  const subtotal = items.reduce((acc, it) => {
    const unit = Number(it.price_unit) || Number(it.vinyl?.price) || 0;
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
              <div>
                <h1 className="h4 mb-1 text-white">¡Pago exitoso!</h1>
                <div className="text-white-50 small">
                  Número de orden <span className="text-white">{order.id}</span> · Estado:{" "}
                  <span className="badge text-bg-success">Pagada</span>
                </div>
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
                    {items.map((it) => {
                      const v = it.vinyl;
                      const imgUrl = v?.image?.[0]?.url || "";
                      const unit = Number(it.price_unit) || Number(v?.price) || 0;
                      const lineTotal = unit * Number(it.quantity || 0);
                      return (
                        <div key={it.id} className="list-group-item bg-dark text-white border-secondary">
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
