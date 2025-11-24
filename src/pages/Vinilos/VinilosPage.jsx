import React from "react";
import { vinylService } from "../../services/vinylService";
import { useCart } from "../../context/CartContext";

const fmtCLP = (v) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(v ?? 0);

export default function VinilosPage() {
  const { add } = useCart();
  const [novedades, setNovedades] = React.useState([]);
  const [catalogo, setCatalogo] = React.useState([]);   
  const [categorias, setCategorias] = React.useState([]);
  const [categoriaSel, setCategoriaSel] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await vinylService.list();
        const vinyls = data || [];

        // Ordenar por fecha de creación (más recientes primero)
        const sorted = [...vinyls].sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        
        const top = sorted.slice(0, 6);
        setNovedades(top);
        setCatalogo(vinyls);

        // Extraer categorías únicas
        const setCat = new Set(vinyls.map((v) => v.category).filter(Boolean));
        setCategorias(Array.from(setCat).sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        setError(e.message || "Error al cargar vinilos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = async (vinyl) => {
    if ((vinyl.stock ?? 0) <= 0) {
      alert("Sin stock disponible");
      return;
    }
    
    try {
      await add(vinyl, 1);
    } catch (e) {
      alert(e.message || "Error al agregar al carrito");
    }
  };

  const listaFiltrada = categoriaSel
    ? catalogo.filter((v) => v.category === categoriaSel)
    : catalogo;

  if (loading) return <div className="container py-4 text-light">Cargando…</div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div style={{marginTop:'5rem',marginBottom:'2rem'}}>
      <section className="container py-4">
        <div className="d-flex align-items-center mb-2">
          <button
            type="button"
            className="btn btn-outline-light me-2 d-none d-md-inline-flex"
            onClick={() => document.getElementById("novedadesRow")?.scrollBy({ left: -320, behavior: "smooth" })}
          >
            &lt;
          </button>

          <div id="novedadesRow" className="flex-grow-1 d-flex gap-3 overflow-auto no-scrollbar px-1">
            {novedades.map((vinyl) => {
              const imageUrl = vinyl.image?.[0]?.url || "";
              return (
                <div
                  key={vinyl.id}
                  className="card bg-dark border-secondary text-light"
                  style={{ minWidth: 220, maxWidth: 260 }}
                >
                  <a
                    href={`/vinilo/${vinyl.id}`}
                    className="stretched-link"
                    aria-label={`Ver ${vinyl.name}`}
                  />
                  {imageUrl ? (
                    <img src={imageUrl} className="card-img-top" alt={vinyl.name} />
                  ) : (
                    <div className="ratio ratio-1x1 bg-secondary"></div>
                  )}
                  <div className="card-body">
                    <h6 className="card-title mb-1">{vinyl.name}</h6>
                    <div className="text-muted small mb-2">{vinyl.category || "—"}</div>
                    <button
                      className="btn btn-outline-light w-100"
                      onClick={() => handleAdd(vinyl)}
                      disabled={(vinyl.stock ?? 0) <= 0}
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn btn-outline-light ms-2 d-none d-md-inline-flex"
            onClick={() => document.getElementById("novedadesRow")?.scrollBy({ left: 320, behavior: "smooth" })}
          >
            &gt;
          </button>
        </div>
      </section>

      <section className="container">
        <h2 className="text-light mb-3">Nuestros Vinilos</h2>
        <div className="row g-3">
          {listaFiltrada.map((vinyl) => {
            const imageUrl = vinyl.image?.[0]?.url || "";
            return (
              <div key={vinyl.id} className="col-12 col-sm-6 col-md-4">
                <div className="card bg-dark border-secondary text-light h-100">
                  <a
                    href={`/vinilo/${vinyl.id}`}
                    className="stretched-link"
                    aria-label={`Ver ${vinyl.name}`}
                  />
                  {imageUrl ? (
                    <img src={imageUrl} className="card-img-top" alt={vinyl.name} />
                  ) : (
                    <div className="ratio ratio-16x9 bg-secondary"></div>
                  )}

                  <div className="card-img-overlay d-flex flex-column justify-content-end p-2 p-md-3" style={{position: 'absolute',bottom: '60px'}}>
                    <div className="d-flex justify-content-between small" style={{background:'#00000082',padding:'.5rem',borderRadius:'5px'}}>
                      <span className="text-truncate">{vinyl.name}</span>
                      <span className="fw-bold">{fmtCLP(vinyl.price).replace("CLP ", "$ ")}</span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <button
                      className="btn btn-outline-light mt-auto"
                      onClick={() => handleAdd(vinyl)}
                      disabled={(vinyl.stock ?? 0) <= 0}
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {listaFiltrada.length === 0 && (
            <div className="col-12">
              <div className="alert alert-secondary text-light bg-dark border-secondary">
                No hay vinilos en esta categoría.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
