import React from "react";
import { userService } from "../../services/userService";

const PAGE_SIZE = 40;

function RoleBadge({ role }) {
  const r = (role || "").toLowerCase();
  if (r === "admin") return <span className="badge text-bg-danger">admin</span>;
  if (r === "vendedor" || r === "seller") return <span className="badge text-bg-primary">vendedor</span>;
  return <span className="badge text-bg-secondary">{role || "cliente"}</span>;
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "activo" || s === "active") return <span className="badge text-bg-success">Activo</span>;
  if (s === "pendiente" || s === "pending") return <span className="badge text-bg-warning">Pendiente</span>;
  if (s === "suspendido" || s === "blocked") return <span className="badge text-bg-secondary">Suspendido</span>;
  return <span className="badge text-bg-secondary">{status || "—"}</span>;
}

export default function AdminUserPage() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Modal crear / editar
  const [showCreate, setShowCreate] = React.useState(false);
  const [editRow, setEditRow] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [formErr, setFormErr] = React.useState("");

  React.useEffect(() => { refresh(); }, []);

  async function refresh() {
    try {
      setLoading(true); setError("");
      const data = await userService.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "No se pudo cargar el listado");
    } finally {
      setLoading(false);
    }
  }

  // Filtro + paginación
  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(u =>
      !t ||
      String(u.id).includes(t) ||
      (u.name || "").toLowerCase().includes(t) ||
      (u.email || "").toLowerCase().includes(t) ||
      (u.role || "").toLowerCase().includes(t) ||
      (u.status || "").toLowerCase().includes(t)
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // CRUD
  async function onCreate(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") || "",
      email: fd.get("email") || "",
      role: fd.get("role") || "cliente",
      status: fd.get("status") || "activo",
      // password: fd.get("password") || ""  // si quieres permitir setearlo aquí
    };
    try {
      setBusy(true); setFormErr("");
      const created = await userService.create(payload);
      setRows(prev => [created, ...prev]);
      setShowCreate(false);
      e.currentTarget.reset();
    } catch (err) {
      setFormErr(err.message || "No se pudo crear el usuario");
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
      email: fd.get("email") || "",
      role: fd.get("role") || "",
      status: fd.get("status") || "",
    };
    try {
      setBusy(true); setFormErr("");
      const updated = await userService.update(editRow.id, payload);
      setRows(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditRow(null);
    } catch (err) {
      setFormErr(err.message || "No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(row) {
    if (!confirm(`¿Eliminar a "${row.name}"?`)) return;
    try {
      await userService.remove(row.id);
      setRows(prev => prev.filter(u => u.id !== row.id));
    } catch (err) {
      alert(err.message || "No se pudo eliminar");
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <aside className="d-none d-md-block col-md-3 col-lg-2 bg-dark border-end border-secondary" style={{height:"100dvh"}}>
          <nav className="nav flex-column p-3 gap-1">
            <a className="navbar-brand d-flex justify-content-center" href="/">
              <span className="text-white fw-bold">Temple Sound</span>
            </a>
            <a className="nav-link text-white-50" href="/admin"> <i className="bi bi-box-seam me-2"></i>Productos</a>
            <a className="nav-link text-white active" aria-current="page" href="#"> <i className="bi bi-people me-2"></i>Usuarios</a>
            <a className="nav-link text-white-50" href="/admin/ordenes"><i className="bi bi-clipboard-check me-2"></i>Órdenes</a>
            <hr className="border-secondary" />
            <a className="nav-link text-danger" href="/"><i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión</a>
          </nav>
        </aside>

        <main className="col-12 col-md-9 col-lg-10 p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className="h4 mb-0">Usuarios</h1>
              <small className="text-white-50">Mantenedor de usuarios</small>
            </div>
            <div className="d-flex gap-2">
              <div className="input-group input-group-sm d-none d-md-flex">
                <span className="input-group-text bg-dark text-white border-secondary"><i className="bi bi-search"></i></span>
                <input
                  type="search"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Buscar…"
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

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="table-responsive">
            <table className="table table-dark table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th style={{width:80}}>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{width:220}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="text-center text-white-50">Cargando…</td></tr>
                )}
                {!loading && pageRows.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-white-50">Sin resultados</td></tr>
                )}

                {pageRows.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="fw-semibold">{u.name || "—"}</td>
                    <td className="text-white-50">{u.email || "—"}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-light" onClick={()=>setEditRow(u)}>Editar</button>
                        <button className="btn btn-outline-danger" onClick={()=>onDelete(u)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Modal Crear */}
      {showCreate && (
        <>
          <div className="modal d-block">
            <div className="modal-dialog">
              <form className="modal-content bg-dark text-white" onSubmit={onCreate}>
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo usuario</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={()=>setShowCreate(false)} />
                </div>
                <div className="modal-body">
                  {formErr && <div className="alert alert-danger">{formErr}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Nombre</label>
                      <input name="name" className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input name="email" type="email" className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Rol</label>
                      <select name="role" className="form-select bg-dark text-white border-secondary" defaultValue="cliente">
                        <option value="admin">admin</option>
                        <option value="vendedor">vendedor</option>
                        <option value="cliente">cliente</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Estado</label>
                      <select name="status" className="form-select bg-dark text-white border-secondary" defaultValue="activo">
                        <option value="activo">activo</option>
                        <option value="pendiente">pendiente</option>
                        <option value="suspendido">suspendido</option>
                      </select>
                    </div>
                    {/* <div className="col-12">
                      <label className="form-label">Password</label>
                      <input name="password" type="password" className="form-control bg-dark text-white border-secondary" />
                    </div> */}
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
            <div className="modal-dialog">
              <form className="modal-content bg-dark text-white" onSubmit={onUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar usuario</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={()=>setEditRow(null)} />
                </div>
                <div className="modal-body">
                  {formErr && <div className="alert alert-danger">{formErr}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Nombre</label>
                      <input name="name" defaultValue={editRow.name} className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input name="email" type="email" defaultValue={editRow.email} className="form-control bg-dark text-white border-secondary" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Rol</label>
                      <select name="role" className="form-select bg-dark text-white border-secondary" defaultValue={editRow.role || "cliente"}>
                        <option value="admin">admin</option>
                        <option value="vendedor">vendedor</option>
                        <option value="cliente">cliente</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Estado</label>
                      <select name="status" className="form-select bg-dark text-white border-secondary" defaultValue={editRow.status || "activo"}>
                        <option value="activo">activo</option>
                        <option value="pendiente">pendiente</option>
                        <option value="suspendido">suspendido</option>
                      </select>
                    </div>
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
