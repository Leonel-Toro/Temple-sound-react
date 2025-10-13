import React from "react";
import { vinylService } from "../../services/vinylService";

const fmtCLP = (v) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })
    .format(Number(v) || 0);

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CL");
};

const PAGE_SIZE = 40;

export default function AdminPage() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Modales
  const [showCreate, setShowCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [formErr, setFormErr] = React.useState("");

  React.useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      const data = await vinylService.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "No se pudo cargar el listado");
    } finally {
      setLoading(false);
    }
  }

  // filtro + paginación (cliente)
  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(v =>
      !t ||
      v.name?.toLowerCase().includes(t) ||
      v.description?.toLowerCase().includes(t) ||
      v.category?.toLowerCase().includes(t) ||
      String(v.id).includes(t)
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // helpers UI
  function stateBadge(stock) {
    const s = Number(stock || 0);
    if (s <= 0) return <span className="badge text-bg-secondary">Agotado</span>;
    if (s <= 5) return <span className="badge text-bg-warning">Bajo stock</span>;
    return <span className="badge text-bg-success">Activo</span>;
  }

  // CRUD handlers
  async function onCreate(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") || "",
      description: fd.get("description") || "",
      price: Number(fd.get("price") || 0),
      stock: Number(fd.get("stock") || 0),
      category: fd.get("category") || "",
      // image: []  // Integración de subida la hacemos cuando me confirmes el flujo de Xano
    };
    try {
      setBusy(true); setFormErr("");
      const created = await vinylService.create(payload);
      setRows(prev => [created, ...prev]);
      setShowCreate(false);
      e.currentTarget.reset();
    } catch (err) {
      setFormErr(err.message || "No se pudo crear el producto");
    } finally {
      setBusy(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editRow) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") || "",
      description: fd.get("description") || "",
      price: Number(fd.get("price") || 0),
      stock: Number(fd.get("stock") || 0),
      category: fd.get("category") || "",
    };
    try {
      setBusy(true); setFormErr("");
      const updated = await vinylService.update(editRow.id, payload);
      setRows(prev => prev.map(x => x.id === updated.id ? updated : x));
      setEditRow(null);
    } catch (err) {
      setFormErr(err.message || "No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(row) {
    if (!confirm(`¿Eliminar "${row.name}"?`)) return;
    try {
      await vinylService.remove(row.id);
      setRows(prev => prev.filter(x => x.id !== row.id));
    } catch (err) {
      alert(err.message || "No se pudo eliminar");
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">

        <aside className="d-none d-md-block col-md-3 col-lg-2 bg-dark border-end border-secondary">
          <nav className="nav flex-column p-3 gap-1">
            <a className="navbar-brand d-flex justify-content-center" href="/">
              <span className="text-white fw-bold">Temple Sound</span>
            </a>
            <a className="nav-link text-white active" href="/"><i className="bi bi-box-seam me-2"></i>Productos</a>
            <a className="nav-link text-white-50" href="/admin/usuarios"><i className="bi bi-people me-2"></i>Usuarios</a>
            <hr className="border-secondary" />
            <a className="nav-link text-danger" href="/"><i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión</a>
          </nav>
        </aside>

        <main className="col-12 col-md-9 col-lg-10 p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className="h4 mb-0">Productos</h1>
              <small className="text-white-50">Listado, creación y edición</small>
            </div>
            <div className="d-flex gap-2">
              <div className="input-group input-group-sm d-none d-md-flex">
                <span className="input-group-text bg-dark text-white border-secondary"><i className="bi bi-search"></i></span>
                <input
                  type="search"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Buscar por nombre, categoría, descripción…"
                  value={q}
                  onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
                />
              </div>
              <button className="btn btn-outline-light btn-sm" onClick={refresh} title="Refrescar">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button className="btn btn-light btn-sm" onClick={()=>setShowCreate(true)}>
                <i className="bi bi-plus-lg me-1"></i>Nuevo
              </button>
            </div>
          </div>

          {/* Tabla con exactamente las columnas del esquema */}
          <div className="table-responsive">
            <table className="table table-dark table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th style={{width:60}}>Imagen</th>
                  <th style={{width:80}}>ID</th>
                  <th>created_at</th>
                  <th>name</th>
                  <th>description</th>
                  <th style={{width:120}}>price</th>
                  <th style={{width:90}}>stock</th>
                  <th style={{width:140}}>category</th>
                  <th style={{width:170}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="text-center text-white-50">Cargando…</td></tr>
                )}
                {!loading && pageRows.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-white-50">Sin resultados</td></tr>
                )}
                {pageRows.map((v) => {
                  const img = v.image?.[0]?.url;
                  return (
                    <tr key={v.id}>
                      <td>
                        {img
                          ? <img src={img} alt={v.name} className="rounded" width="48" height="48" style={{objectFit:"cover"}} />
                          : <div className="rounded bg-secondary" style={{width:48, height:48}} />
                        }
                      </td>
                      <td>{v.id}</td>
                      <td className="small text-white-50">{fmtDate(v.created_at)}</td>
                      <td className="fw-semibold">{v.name}</td>
                      <td className="small text-white-50 text-truncate" style={{maxWidth:280}} title={v.description || ""}>
                        {v.description || "—"}
                      </td>
                      <td>{fmtCLP(v.price)}</td>
                      <td>{v.stock ?? 0}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span>{v.category || "—"}</span>
                          {stateBadge(v.stock)}
                        </div>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <a href={`/vinilo/${v.id}`} className="btn btn-outline-light">Ver</a>
                          <button className="btn btn-outline-light" onClick={()=>setEditRow(v)}>Editar</button>
                          <button className="btn btn-outline-danger" onClick={()=>onDelete(v)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <nav className="mt-3">
            <ul className="pagination pagination-sm justify-content-end">
              <li className={`page-item ${page===1 ? "disabled":""}`}>
                <button className="page-link bg-dark text-white border-secondary" onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
              </li>
              {Array.from({length: totalPages}).map((_,i)=>(
                <li className={`page-item ${page===i+1?"active":""}`} key={i}>
                  <button className="page-link bg-dark text-white border-secondary" onClick={()=>setPage(i+1)}>{i+1}</button>
                </li>
              ))}
              <li className={`page-item ${page===totalPages ? "disabled":""}`}>
                <button className="page-link bg-dark text-white border-secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
              </li>
            </ul>
          </nav>
        </main>
      </div>

      {showCreate && (
        <>
          <div className="modal d-block">
            <div className="modal-dialog modal-lg">
              <form className="modal-content bg-dark text-white" onSubmit={onCreate}>
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo vinilo</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={()=>setShowCreate(false)} />
                </div>
                <div className="modal-body">
                  {formErr && <div className="alert alert-danger">{formErr}</div>}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">name</label>
                      <input name="name" className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">category</label>
                      <input name="category" className="form-control bg-dark text-white border-secondary" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">description</label>
                      <textarea name="description" rows="3" className="form-control bg-dark text-white border-secondary" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">price</label>
                      <input name="price" type="number" min="0" className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">stock</label>
                      <input name="stock" type="number" min="0" className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    {/* Imagen (pendiente de flujo de upload Xano) */}
                    <div className="col-12">
                      <div className="alert alert-secondary small mb-0">
                        La carga de <strong>image</strong> se integra cuando confirmes el endpoint de upload en Xano.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowCreate(false)} disabled={busy}>Cancelar</button>
                  <button type="submit" className="btn btn-light" disabled={busy}>{busy? "Guardando…":"Crear"}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={()=>setShowCreate(false)} />
        </>
      )}

      {/* Modal Editar */}
      {editRow && (
        <>
          <div className="modal d-block">
            <div className="modal-dialog modal-lg">
              <form className="modal-content bg-dark text-white" onSubmit={onUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar vinilo</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={()=>setEditRow(null)} />
                </div>
                <div className="modal-body">
                  {formErr && <div className="alert alert-danger">{formErr}</div>}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">name</label>
                      <input name="name" defaultValue={editRow.name} className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">category</label>
                      <input name="category" defaultValue={editRow.category} className="form-control bg-dark text-white border-secondary" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">description</label>
                      <textarea name="description" defaultValue={editRow.description} rows="3" className="form-control bg-dark text-white border-secondary" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">price</label>
                      <input name="price" type="number" min="0" defaultValue={editRow.price} className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">stock</label>
                      <input name="stock" type="number" min="0" defaultValue={editRow.stock} className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    {/* Imagen (pendiente igual que en crear) */}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setEditRow(null)} disabled={busy}>Cancelar</button>
                  <button type="submit" className="btn btn-light" disabled={busy}>{busy? "Guardando…":"Guardar"}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={()=>setEditRow(null)} />
        </>
      )}
    </div>
  );
}
