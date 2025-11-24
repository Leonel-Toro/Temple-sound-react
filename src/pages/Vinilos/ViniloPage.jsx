import React from "react";
import { vinylService } from "../../services/vinylService";
import { useCart } from "../../context/CartContext";

const fmtCLP = (v) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(v ?? 0);

function useVinylIdProp(idProp) {
  if (idProp != null) return idProp;
  const parts = (typeof window !== "undefined" ? window.location.pathname : "").split("/");
  const last = parts[parts.length - 1];
  const idNum = Number(last);
  return Number.isFinite(idNum) ? idNum : null;
}

export default function ViniloPage({ id: idProp }) {
  const id = useVinylIdProp(idProp);
  const { add, setOpen } = useCart();

  const [v, setV] = React.useState(null);
  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState("descripcion"); // tabs controladas
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const vinyl = await vinylService.get(id);
        if (!mounted) return;
        
        // Usar datos de API directamente
        setV(vinyl);
      } catch (e) {
        setError(e.message || "No se pudo cargar el vinilo");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // Navegación con teclado en el carrusel
  React.useEffect(() => {
    if (!v || !v.image || v.image.length <= 1) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentImageIndex(prev => 
          prev === 0 ? v.image.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentImageIndex(prev => 
          prev === v.image.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [v]);

  const onAdd = async () => {
    if (!v) return;
    if ((v.stock ?? 0) <= 0) {
      alert("Sin stock disponible");
      return;
    }
    
    const n = Math.max(1, Number(qty) || 1);
    
    try {
      await add(v, n);
    } catch (e) {
      alert(e.message || "Error al agregar al carrito");
    }
  };

  const onBuyNow = async () => {
    if (!v) return;
    if ((v.stock ?? 0) <= 0) {
      alert("Sin stock disponible");
      return;
    }
    
    const n = Math.max(1, Number(qty) || 1);
    
    try {
      // Agregar al carrito
      await add(v, n);
      // Abrir el modal de carrito directamente
      setOpen(true);
    } catch (e) {
      alert(e.message || "Error al procesar la compra");
    }
  };

  if (loading) return <main className="py-4 mt-5"><div className="container text-white">Cargando…</div></main>;
  if (error) return <main className="py-4 mt-5"><div className="container"><div className="alert alert-danger">{error}</div></div></main>;
  if (!v) return <main className="py-4 mt-5"><div className="container text-white">Vinilo no encontrado</div></main>;

  return (
    <main className="py-4 mt-5 bg-black text-white">
      <div className="container">

        {/* Breadcrumb (clases iguales a tu HTML) */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item">
              <a href="/vinilos" className="link-light text-decoration-none">Nuestros Vinilos</a>
            </li>
            <li className="breadcrumb-item active text-white-50" aria-current="page">
              {v.name} {v.year ? `— ${v.year}` : ""}
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Portada */}
          <div className="col-12 col-lg-6">
            {v.image && v.image.length > 0 ? (
              <>
                {/* Imagen principal */}
                <div className="card bg-dark border-0 mb-2">
                  <div className="ratio ratio-1x1">
                    <img
                      src={v.image[currentImageIndex]?.url}
                      alt={`${v.name} - Imagen ${currentImageIndex + 1}`}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  
                  {/* Controles del carrusel */}
                  {v.image.length > 1 && (
                    <>
                      <button
                        className="carousel-control-prev position-absolute top-50 start-0 translate-middle-y"
                        type="button"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? v.image.length - 1 : prev - 1
                        )}
                        style={{ width: '10%' }}
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                      </button>
                      <button
                        className="carousel-control-next position-absolute top-50 end-0 translate-middle-y"
                        type="button"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === v.image.length - 1 ? 0 : prev + 1
                        )}
                        style={{ width: '10%' }}
                      >
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Siguiente</span>
                      </button>
                      
                      {/* Indicador de posición */}
                      <div className="position-absolute bottom-0 end-0 m-3">
                        <span className="badge bg-dark bg-opacity-75 text-white">
                          {currentImageIndex + 1} / {v.image.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Miniaturas */}
                {v.image.length > 1 && (
                  <div className="d-flex gap-2 overflow-auto pb-2">
                    {v.image.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`btn p-0 border-0 flex-shrink-0 ${
                          idx === currentImageIndex ? 'opacity-100' : 'opacity-50'
                        }`}
                        onClick={() => setCurrentImageIndex(idx)}
                        style={{ width: '80px', height: '80px' }}
                      >
                        <img
                          src={img.url}
                          alt={`Miniatura ${idx + 1}`}
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="card bg-dark border-0">
                <div className="ratio ratio-1x1">
                  <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                    <i className="bi bi-image text-white-50" style={{ fontSize: '4rem' }}></i>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="col-12 col-lg-6">
            <h1 className="h3 mb-1">{v.name}</h1>
            <p className="text-white-50 mb-2">
              {v.category || "—"} {v.year ? `· ${v.year}` : ""}
            </p>

            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge text-bg-secondary">{v.format || "LP"}</span>
              <span className="badge text-bg-secondary">{v.rpm || '12" · 33⅓ RPM'}</span>
              <span className="badge text-bg-secondary">{v.category || "—"}</span>
            </div>

            <hr className="border-secondary opacity-25" />

            <div className="d-flex justify-content-between align-items-end">
              <div>
                <div className="small text-white-50">Precio</div>
                <div className="display-6 fw-bold">{fmtCLP(v.price).replace("CLP","$")}</div>
              </div>
              <div className="text-end">
                <span className={`badge ${ (v.stock ?? 0) > 0 ? "text-bg-success" : "text-bg-secondary"}`}>
                  {(v.stock ?? 0) > 0 ? "En stock" : "Sin stock"}
                </span>
              </div>
            </div>

            {/* Comprar (manteniendo clases) */}
            <form className="mt-3" onSubmit={(e)=>e.preventDefault()}>
              <div className="row g-2 align-items-center">
                <div className="col-12 col-sm-4">
                  <label className="form-label small mb-1">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={qty}
                    inputMode="numeric"
                    onChange={(e)=>setQty(e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-8 d-grid">
                  <label className="form-label small mb-1 invisible">.</label>
                  <button
                    type="button"
                    className="btn btn-light fw-semibold"
                    onClick={onAdd}
                    disabled={(v.stock ?? 0) <= 0}
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>

              <div className="d-grid d-sm-flex gap-2 mt-2">
                <button type="button" className="btn btn-outline-light flex-grow-1" onClick={onBuyNow} disabled={(v.stock ?? 0) <= 0}>
                  Comprar ahora
                </button>
                <button type="button" className="btn btn-outline-secondary"><i className="bi bi-heart"></i></button>
                <button type="button" className="btn btn-outline-secondary"><i className="bi bi-share"></i></button>
              </div>
            </form>

            <ul className="list-unstyled small mt-3 mb-0">
              <li className="mb-1"><i className="bi bi-truck me-2"></i>Despacho y retiro en tienda</li>
              <li className="mb-1"><i className="bi bi-arrow-repeat me-2"></i>Cambios/devoluciones 10 días</li>
              <li className="mb-1"><i className="bi bi-shield-check me-2"></i>Producto original y sellado</li>
            </ul>
          </div>
        </div>

        {/* Tabs (controladas en React pero con las MISMAS clases Bootstrap) */}
        <div className="row g-4 mt-1">
          <div className="col-12 col-lg-8">
            <ul className="nav nav-tabs border-secondary" id="tabDetalle" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab==="descripcion" ? "active" : ""}`}
                  id="tab-descripcion"
                  type="button"
                  role="tab"
                  onClick={()=>setActiveTab("descripcion")}
                >
                  Descripción
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab==="tracklist" ? "active" : ""}`}
                  id="tab-tracklist"
                  type="button"
                  role="tab"
                  onClick={()=>setActiveTab("tracklist")}
                >
                  Tracklist
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab==="specs" ? "active" : ""}`}
                  id="tab-specs"
                  type="button"
                  role="tab"
                  onClick={()=>setActiveTab("specs")}
                >
                  Especificaciones
                </button>
              </li>
            </ul>

            <div className="tab-content pt-3" id="tabContentDetalle">
              {/* Descripción */}
              <div className={`tab-pane fade ${activeTab==="descripcion" ? "show active" : ""}`} id="pane-descripcion" role="tabpanel" aria-labelledby="tab-descripcion">
                <p className="text-white-50 mb-0">
                  {v.description || "Sin descripción."}
                </p>
              </div>

              {/* Tracklist — si luego lo agregas en Xano, reemplaza estático por v.tracklist */}
              <div className={`tab-pane fade ${activeTab==="tracklist" ? "show active" : ""}`} id="pane-tracklist" role="tabpanel" aria-labelledby="tab-tracklist">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <h6 className="mb-2">Lado A</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item bg-dark text-white border-secondary">01 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">02 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">03 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">04 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">05 — …</li>
                    </ul>
                  </div>
                  <div className="col-12 col-md-6">
                    <h6 className="mb-2">Lado B</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item bg-dark text-white border-secondary">06 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">07 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">08 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">09 — …</li>
                      <li className="list-group-item bg-dark text-white border-secondary">10 — …</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Especificaciones */}
              <div className={`tab-pane fade ${activeTab==="specs" ? "show active" : ""}`} id="pane-specs" role="tabpanel" aria-labelledby="tab-specs">
                <div className="table-responsive">
                  <table className="table table-dark table-borderless align-middle mb-0">
                    <tbody>
                      <tr><th className="fw-normal text-white-50">Formato</th><td>{v.format || "LP"}</td></tr>
                      <tr><th className="fw-normal text-white-50">Género</th><td>{v.category || "—"}</td></tr>
                      <tr><th className="fw-normal text-white-50">Año</th><td>{v.year || "—"}</td></tr>
                      <tr><th className="fw-normal text-white-50">Sello</th><td>{v.label || "—"}</td></tr>
                      <tr><th className="fw-normal text-white-50">País</th><td>—</td></tr>
                      <tr><th className="fw-normal text-white-50">Código</th><td>{v.code || "—"}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Lateral (misma tarjeta y clases) */}
          <div className="col-12 col-lg-4">
            <div className="card bg-dark border-0">
              <div className="card-body">
                <h6 className="card-title text-white mb-2">Información de la tienda</h6>
                <p className="small text-white-50 mb-2">Horarios, retiro en tienda, etc.</p>
                <hr className="border-secondary opacity-25" />
                <h6 className="card-title text-white mb-2">Métodos de pago</h6>
                <p className="small text-white-50 mb-0">Detalle de medios de pago aceptados.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
