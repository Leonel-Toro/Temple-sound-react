import React from "react";
import { orderService } from "../../services/orderService";

const fmtCLP = (v) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
    .format(Number(v) || 0);

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CL", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PAGE_SIZE = 20;

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "pagada" || s === "completada") return <span className="badge text-bg-success">Pagada</span>;
  if (s === "pendiente") return <span className="badge text-bg-warning">Pendiente</span>;
  if (s === "cancelada") return <span className="badge text-bg-danger">Cancelada</span>;
  if (s === "en proceso") return <span className="badge text-bg-info">En proceso</span>;
  return <span className="badge text-bg-secondary">{status || "—"}</span>;
}

export default function AdminOrderPage() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [orderItems, setOrderItems] = React.useState([]);
  const [loadingItems, setLoadingItems] = React.useState(false);

  React.useEffect(() => { refresh(); }, []);

  async function refresh() {
    try {
      setLoading(true); 
      setError("");
      const data = await orderService.list();
      // Ordenar por fecha de creación (más reciente primero)
      const sorted = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setRows(sorted);
    } catch (e) {
      setError(e.message || "No se pudo cargar el historial de órdenes");
    } finally {
      setLoading(false);
    }
  }

  async function viewOrderDetails(orderId) {
    try {
      setLoadingItems(true);
      const items = await orderService.getWithItems(orderId);
      setOrderItems(items);
      setSelectedOrder(rows.find(o => o.id === orderId));
    } catch (e) {
      alert("Error al cargar los detalles de la orden: " + e.message);
    } finally {
      setLoadingItems(false);
    }
  }

  function closeDetails() {
    setSelectedOrder(null);
    setOrderItems([]);
  }

  // Filtro + paginación
  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(o =>
      !t ||
      String(o.id).includes(t) ||
      String(o.user_id).includes(t) ||
      (o.status || "").toLowerCase().includes(t) ||
      fmtCLP(o.total).toLowerCase().includes(t)
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Cálculo de estadísticas
  const stats = React.useMemo(() => {
    const total = rows.length;
    const totalRevenue = rows.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const pagadas = rows.filter(o => (o.status || "").toLowerCase() === "pagada").length;
    const pendientes = rows.filter(o => (o.status || "").toLowerCase() === "pendiente").length;
    
    return { total, totalRevenue, pagadas, pendientes };
  }, [rows]);

  return (
    <div className="container-fluid">
      <div className="row">
        <aside className="d-none d-md-block col-md-3 col-lg-2 bg-dark border-end border-secondary" style={{height:"100dvh"}}>
          <nav className="nav flex-column p-3 gap-1">
            <a className="navbar-brand d-flex justify-content-center" href="/">
              <span className="text-white fw-bold">Temple Sound</span>
            </a>
            <a className="nav-link text-white-50" href="/admin"> <i className="bi bi-box-seam me-2"></i>Productos</a>
            <a className="nav-link text-white-50" href="/admin/usuarios"><i className="bi bi-people me-2"></i>Usuarios</a>
            <a className="nav-link text-white active" aria-current="page" href="#"><i className="bi bi-clipboard-check me-2"></i>Órdenes</a>
            <hr className="border-secondary" />
            <a className="nav-link text-danger" href="/"><i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión</a>
          </nav>
        </aside>

        <main className="col-12 col-md-9 col-lg-10 p-3 bg-dark text-white min-vh-100">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 mb-3">
            <i className="bi bi-clipboard-check me-2"></i>
            Historial de Órdenes
          </h1>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card bg-secondary text-white h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-white-50">Total Órdenes</h6>
              <h3 className="card-title mb-0">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-white-50">Órdenes Pagadas</h6>
              <h3 className="card-title mb-0">{stats.pagadas}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-white-50">Ingresos Totales</h6>
              <h3 className="card-title mb-0">{fmtCLP(stats.totalRevenue)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-secondary text-white border-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Buscar por ID, usuario, estado o total..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button 
            className="btn btn-outline-light"
            onClick={refresh}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de órdenes */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario ID</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-end">Total</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No se encontraron órdenes
                    </td>
                  </tr>
                ) : (
                  pageRows.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <i className="bi bi-person me-1"></i>
                        {order.user_id}
                      </td>
                      <td>{fmtDate(order.created_at)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="text-end fw-bold">{fmtCLP(order.total)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => viewOrderDetails(order.id)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link bg-dark text-white border-secondary"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link bg-dark text-white border-secondary">
                    Página {page} de {totalPages}
                  </span>
                </li>
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link bg-dark text-white border-secondary"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}

          <div className="text-muted text-center mt-2">
            Mostrando {pageRows.length} de {filtered.length} órdenes
            {q && ` (filtradas de ${rows.length} totales)`}
          </div>
        </>
      )}

      {/* Modal de detalles de orden */}
      {selectedOrder && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={closeDetails}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Detalles de la Orden #{selectedOrder.id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeDetails}
                ></button>
              </div>
              <div className="modal-body">
                {/* Información de la orden */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Usuario ID:</strong> {selectedOrder.user_id}
                    </p>
                    <p className="mb-2">
                      <strong>Fecha:</strong> {fmtDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="mb-2">
                      <strong>Estado:</strong> <StatusBadge status={selectedOrder.status} />
                    </p>
                    <p className="mb-2">
                      <strong>Total:</strong> <span className="fs-4 text-success">{fmtCLP(selectedOrder.total)}</span>
                    </p>
                  </div>
                </div>

                <hr className="border-secondary" />

                {/* Items de la orden */}
                <h6 className="mb-3">Items de la Orden</h6>
                {loadingItems ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando items...</span>
                    </div>
                  </div>
                ) : orderItems.length === 0 ? (
                  <div className="alert alert-warning">
                    No se encontraron items para esta orden
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-sm">
                      <thead>
                        <tr>
                          <th>Vinilo</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio Unitario</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              {item.vinyl_name || `Vinilo #${item.vinyl_id}`}
                              {item.vinyl_artist && (
                                <div className="text-muted small">
                                  <i className="bi bi-person me-1"></i>
                                  {item.vinyl_artist}
                                </div>
                              )}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{fmtCLP(item.price_at_purchase)}</td>
                            <td className="text-end fw-bold">
                              {fmtCLP(item.quantity * item.price_at_purchase)}
                            </td>
                          </tr>
                        ))}
                        <tr className="table-active">
                          <td colSpan="3" className="text-end fw-bold">Total:</td>
                          <td className="text-end fw-bold text-success">
                            {fmtCLP(selectedOrder.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeDetails}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
