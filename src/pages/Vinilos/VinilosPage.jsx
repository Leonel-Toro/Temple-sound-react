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

        const normalizados = (data || []).map((v) => ({
          id: v.id,
          nombre: v.name,
          descripcion: v.description,
          precio: v.price,
          stock: v.stock,
          categoria: v.category || "",
          imagen: v.image?.[0]?.url || "",
          created_at: v.created_at,
        }));

        const top = normalizados.slice(0, 6);
        setNovedades(top);

        setCatalogo(normalizados);

        const setCat = new Set(normalizados.map((x) => x.categoria).filter(Boolean));
        setCategorias(Array.from(setCat).sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        setError(e.message || "Error al cargar vinilos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = async (item) => {
    if ((item.stock ?? 0) <= 0) {
      alert("Sin stock disponible");
      return;
    }
    await add({ id: item.id, stock: item.stock }, 1);
  };

  const listaFiltrada = categoriaSel
    ? catalogo.filter((x) => x.categoria === categoriaSel)
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
            {novedades.map((item) => (
              <div
                key={item.id}
                className="card bg-dark border-secondary text-light"
                style={{ minWidth: 220, maxWidth: 260 }}
              >
                <a
                  href={`/vinilo/${item.id}`}
                  className="stretched-link"
                  aria-label={`Ver ${item.nombre}`}
                />
                {item.imagen ? (
                  <img src={item.imagen} className="card-img-top" alt={item.nombre} />
                ) : (
                  <div className="ratio ratio-1x1 bg-secondary"></div>
                )}
                <div className="card-body">
                  <h6 className="card-title mb-1">{item.nombre}</h6>
                  <div className="text-muted small mb-2">{item.categoria || "—"}</div>
                  <button
                    className="btn btn-outline-light w-100"
                    onClick={() => handleAdd(item)}
                    disabled={(item.stock ?? 0) <= 0}
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            ))}
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
          {listaFiltrada.map((item) => (
            <div key={item.id} className="col-12 col-sm-6 col-md-4">
              <div className="card bg-dark border-secondary text-light h-100">
                <a
                  href={`/vinilo/${item.id}`}
                  className="stretched-link"
                  aria-label={`Ver ${item.nombre}`}
                />
                {item.imagen ? (
                  <img src={item.imagen} className="card-img-top" alt={item.nombre} />
                ) : (
                  <div className="ratio ratio-16x9 bg-secondary"></div>
                )}

                <div className="card-img-overlay d-flex flex-column justify-content-end p-2 p-md-3" style={{position: 'absolute',bottom: '60px'}}>
                  <div className="d-flex justify-content-between small" style={{background:'#00000082',padding:'.5rem',borderRadius:'5px'}}>
                    <span className="text-truncate">{item.nombre}</span>
                    <span className="fw-bold">{fmtCLP(item.precio).replace("CLP ", "$ ")}</span>
                  </div>
                </div>

                <div className="card-body d-flex flex-column">
                  <button
                    className="btn btn-outline-light mt-auto"
                    onClick={() => handleAdd(item)}
                    disabled={(item.stock ?? 0) <= 0}
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
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
