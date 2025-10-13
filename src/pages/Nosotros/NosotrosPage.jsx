import React from "react";

export default function NosotrosPage({ initialSection = "nosotros" }) {
  const refNosotros = React.useRef(null);
  const refContacto = React.useRef(null);

  React.useEffect(() => {
    const target =
      initialSection === "contacto" ? refContacto.current : refNosotros.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [initialSection]);

  return (
    <main className="pt-5 bg-black text-white">
      <section
        id="nosotros"
        ref={refNosotros}
        className="min-vh-100 d-flex align-items-center justify-content-center text-center position-relative"
        style={{
          background: `url('https://c.wallhere.com/photos/7d/fd/vinyl_music-212662.jpg!d') center/cover no-repeat`,
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75"
          style={{ pointerEvents: "none" }}
        />

        <div className="container position-relative text-white">
          <h2 className="display-5 fw-semibold mb-3">Nosotros</h2>
          <p className="lead mb-4">
            En <strong>Temple Sound</strong> vivimos el vinilo: curamos
            catálogos, cuidamos ediciones y conectamos a coleccionistas con
            música que merece ser escuchada como se hizo para sonar.
          </p>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 bg-dark bg-opacity-75 border-0 text-white">
                <div className="card-body">
                  <h3 className="h5 mb-2">Misión</h3>
                  <p className="mb-0">
                    Acercar el formato vinilo a nuevos y antiguos auditores con
                    una curaduría honesta y un servicio cercano.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 bg-dark bg-opacity-75 border-0 text-white">
                <div className="card-body">
                  <h3 className="h5 mb-2">Visión</h3>
                  <p className="mb-0">
                    Ser la tienda referencia para quienes buscan calidad de
                    sonido, historia y coleccionabilidad.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card h-100 bg-dark bg-opacity-75 border-0 text-white">
                <div className="card-body">
                  <h3 className="h5 mb-2">Valores</h3>
                  <ul className="mb-0 ps-3 text-start">
                    <li>Autenticidad</li>
                    <li>Calidad</li>
                    <li>Comunidad</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        ref={refContacto}
        className="py-5 bg-black text-white border-top border-secondary"
      >
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-12 col-lg-8">
              <h2 className="h3 mb-3">Contacto</h2>
              <p className="text-white-50">
                ¿Tienes dudas o buscas un disco en particular? Escríbenos y te
                ayudamos.
              </p>
              <hr className="border-secondary opacity-25 w-25 mx-auto" />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-dark border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="h5 mb-4 text-white">Envíanos un mensaje</h3>
                  <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="mb-3 text-start">
                      <label htmlFor="c-nombre" className="form-label text-white">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="c-nombre"
                        className="form-control"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="mb-3 text-start">
                      <label htmlFor="c-email" className="form-label text-white">
                        Correo
                      </label>
                      <input
                        type="email"
                        id="c-email"
                        className="form-control"
                        placeholder="tucorreo@dominio.com"
                      />
                    </div>
                    <div className="mb-3 text-start">
                      <label
                        htmlFor="c-mensaje"
                        className="form-label text-white"
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="c-mensaje"
                        className="form-control"
                        rows={5}
                        placeholder="¿En qué te ayudamos?"
                      />
                    </div>
                    <div className="d-grid d-sm-flex justify-content-end gap-3">
                      <button type="submit" className="btn btn-light">
                        Enviar
                      </button>
                      <button type="reset" className="btn btn-outline-light">
                        Limpiar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card h-100 bg-dark border-0 shadow-sm">
                <div className="card-body d-flex flex-column text-white">
                  <h3 className="h5 mb-3">Nuestra ubicación</h3>

                  <p className="mb-2">
                    <i className="bi bi-envelope me-2"></i>
                    <a
                      href="mailto:contacto@templesound.cl"
                      className="text-white text-decoration-none"
                    >
                      contacto@templesound.cl
                    </a>
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-clock me-2"></i> Lunes a Viernes, 10:00–18:00
                  </p>
                  <p className="mb-4">Respondemos dentro de 24–48 hrs hábiles.</p>

                  <div className="ratio ratio-16x9 rounded overflow-hidden mb-3">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1..."
                      width="600"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa Temple Sound"
                    />
                  </div>

                  <a
                    href="https://maps.google.com/?q=Temple+Sound"
                    target="_blank"
                    rel="noopener"
                    className="btn btn-outline-light"
                  >
                    Abrir en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
