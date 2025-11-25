import CartModal from "./components/CartModal";
import React from "react";
import Header from "./components/layout/Header";
import Modal from "./components/ui/Modal";
import Footer from "./components/layout/Footer";
import PasswordInput from "./components/ui/PasswordInput";
import VinilosPage from "./pages/Vinilos/VinilosPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import NosotrosPage from "./pages/Nosotros/NosotrosPage";
import ViniloPage from "./pages/Vinilos/ViniloPage";
import PagoPage from "./pages/Pago/PagoPage";
import AdminPage from "./pages/Admin/AdminPage";
import AdminUserPage from "./pages/Admin/AdminUserPage";
import AdminOrderPage from "./pages/Admin/AdminOrderPage";

function getPathFromLocation() {
  let p = window.location.pathname || "/";
  return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
}

function segments(path) {
  return path.replace(/^\/+/, "").split("/").filter(Boolean);
}

export default function App() {
  const [path, setPath] = React.useState(getPathFromLocation());
  const segs = segments(path);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const onPop = () => setPath(getPathFromLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to) => {
    if (to === path) return;
    window.history.pushState({}, "", to);
    setPath(to);
  };

  const abrirLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };
  const abrirRegistro = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Aquí puedes agregar validación real con tu backend
    // Por ahora, simulamos un login exitoso
    setUser({
      email: email,
      name: email.split('@')[0] // Usamos la parte antes del @ como nombre
    });
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const Hero = () => (
    <>
      <div className="pt-5"></div>
      <section className="position-relative w-100 min-vh-100 overflow-hidden">
        <div
          id="bgCarousel"
          className="carousel slide carousel-fade position-absolute top-0 start-0 w-100 h-100 z-0"
          data-bs-ride="carousel"
          data-bs-interval="4000"
        >
          <div className="carousel-inner w-100 h-100">
            <div
              className="carousel-item active w-100 h-100"
              style={{
                background: `url('https://img.freepik.com/premium-photo/record-player-wooden-table_852340-12790.jpg') center/cover no-repeat`,
              }}
            />
            <div
              className="carousel-item w-100 h-100"
              style={{
                background: `url('https://assets.newatlas.com/dims4/default/89c4b95/2147483647/strip/true/crop/1620x1080+150+0/resize/1920x1280!/quality/90/?url=http:%2F%2Fnewatlas-brightspot.s3.amazonaws.com%2Farchive%2Fsony-japan-vinyl-1.jpg') center/cover no-repeat`,
              }}
            />
            <div
              className="carousel-item w-100 h-100"
              style={{
                background: `url('https://indiehoy.com/wp-content/uploads/2023/03/vinilos-1.jpg') center/cover no-repeat`,
              }}
            />
          </div>
        </div>

        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75"
          style={{ pointerEvents: "none" }}
        ></div>

        <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
          <img
            src="/assets/img/logo3.png"
            alt="Logo Vinilos"
            className="img-fluid"
            style={{ maxHeight: "250px", filter: "brightness(0) invert(1)" }}
          />
          <p className="opacity-75 fs-4 d-none d-md-block">
            Un lugar donde cada disco es una reliquia, cada surco una historia y
            cada canción un viaje en el tiempo.
          </p>
          <a href="/vinilos" className="btn btn-light btn-md">
            Explorar Vinilos
          </a>
        </div>
      </section>
    </>
  );

  let Page = null;
  let pageProps = {};
  const isAdmin = segs[0] === "admin";
  
  if (path === "/" || segs.length === 0) {
    Page = Hero;
  } else if (path.startsWith("/vinilos")) {
    Page = VinilosPage;
  } else if (path.startsWith("/nosotros")) {
    Page = NosotrosPage;
    pageProps = { initialSection: "nosotros" };
  } else if (path.startsWith("/contacto")) {
    Page = NosotrosPage;
    pageProps = { initialSection: "contacto" };
  }else if(segs[0] === "vinilo" && segs[1]) {
    Page = ViniloPage;
    pageProps = { id: Number(segs[1]) };
  } else if (segs[0] === "pago-exitoso" && segs[1]) {
    Page = PagoPage;
    pageProps = { id: Number(segs[1]) };
  } else if (isAdmin && segs.length === 1) {
    Page = AdminPage;
  } else if (segs[0] === "admin" && segs[1] === "usuarios") {
    Page = AdminUserPage;
  } else if (segs[0] === "admin" && segs[1] === "ordenes") {
    Page = AdminOrderPage;
  } else {
    Page = NotFoundPage;
  }
  
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark">
      {!isAdmin && <Header onOpenLogin={() => setShowLogin(true)} user={user} onLogout={handleLogout} />}

      <main className={isAdmin ? "" : "flex-grow-1"}>
        <Page {...pageProps} />
      </main>

      {!isAdmin && <Footer />}
      
      <CartModal />
      <Modal
        show={showLogin}
        title="Iniciar sesión"
        onClose={() => setShowLogin(false)}
        size="sm"
        dark
      >
        <form
          onSubmit={handleLogin}
          noValidate
        >
          <div className="mb-3">
            <label htmlFor="loginUser" className="form-label">
              Correo
            </label>
            <input
              id="loginUser"
              name="email"
              type="email"
              className="form-control bg-dark text-white border-secondary"
              placeholder="correo@dominio.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="loginPass" className="form-label">
              Contraseña
            </label>
            <PasswordInput
              id="loginPass"
              name="password"
              className="form-control bg-dark text-white"
              minLength={4}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit">
              Entrar
            </button>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={abrirRegistro}
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        show={showRegister}
        title="Registrarse"
        onClose={() => setShowRegister(false)}
        size="sm"
        dark
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          noValidate
        >
          <div className="mb-3">
            <label htmlFor="regFullName" className="form-label">
              Nombre completo
            </label>
            <input
              id="regFullName"
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Tu nombre y apellido"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label">
              Correo
            </label>
            <input
              id="regEmail"
              type="email"
              className="form-control bg-dark text-white border-secondary"
              placeholder="correo@dominio.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="regPass" className="form-label">
              Contraseña
            </label>
            <PasswordInput
              id="regPass"
              className="form-control bg-dark text-white"
              minLength={4}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="regPass2" className="form-label">
              Confirmar contraseña
            </label>
            <PasswordInput
              id="regPass2"
              className="form-control bg-dark text-white"
              minLength={4}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit">
              Crear cuenta
            </button>
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={abrirLogin}
            >
              Ya tengo cuenta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
