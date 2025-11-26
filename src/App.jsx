import CartModal from "./components/CartModal";
import React from "react";
import Header from "./components/layout/Header";
import Modal from "./components/ui/Modal";
import Footer from "./components/layout/Footer";
import VinilosPage from "./pages/Vinilos/VinilosPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import NosotrosPage from "./pages/Nosotros/NosotrosPage";
import ViniloPage from "./pages/Vinilos/ViniloPage";
import PagoPage from "./pages/Pago/PagoPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import AdminPage from "./pages/Admin/AdminPage";
import AdminUserPage from "./pages/Admin/AdminUserPage";
import AdminOrderPage from "./pages/Admin/AdminOrderPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";

function getPathFromLocation() {
  let p = window.location.pathname || "/";
  return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
}

function segments(path) {
  return path.replace(/^\/+/, "").split("/").filter(Boolean);
}

function AppContent() {
  const { user, logout } = useAuth();
  const [path, setPath] = React.useState(getPathFromLocation());
  const segs = segments(path);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);

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

  const handleLoginSuccess = (userData) => {
    setShowLogin(false);
    // Redirigir a vinilos para todos los usuarios
    navigate('/vinilos');
  };

  const handleRegisterSuccess = (userData) => {
    setShowRegister(false);
    // Redirigir a vinilos para todos los usuarios
    navigate('/vinilos');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
  } else if (path.startsWith("/perfil")) {
    Page = () => (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    );
  } else if(segs[0] === "vinilo" && segs[1]) {
    Page = ViniloPage;
    pageProps = { id: Number(segs[1]) };
  } else if (segs[0] === "pago-exitoso" && segs[1]) {
    Page = PagoPage;
    pageProps = { id: Number(segs[1]) };
  } else if (isAdmin && segs.length === 1) {
    Page = () => (
      <ProtectedRoute requiredRole="admin">
        <AdminPage />
      </ProtectedRoute>
    );
  } else if (segs[0] === "admin" && segs[1] === "usuarios") {
    Page = () => (
      <ProtectedRoute requiredRole="admin">
        <AdminUserPage />
      </ProtectedRoute>
    );
  } else if (segs[0] === "admin" && segs[1] === "ordenes") {
    Page = () => (
      <ProtectedRoute requiredRole="admin">
        <AdminOrderPage />
      </ProtectedRoute>
    );
  } else {
    Page = NotFoundPage;
  }
  
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark">
      {!isAdmin && <Header onOpenLogin={() => setShowLogin(true)} />}

      <main className={isAdmin ? "" : "flex-grow-1"}>
        <Page {...pageProps} />
      </main>

      {!isAdmin && <Footer />}
      
      <CartModal />
      
      {/* Modal de Login */}
      <Modal
        show={showLogin}
        title="Iniciar sesión"
        onClose={() => setShowLogin(false)}
        size="sm"
        dark
      >
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={abrirRegistro}
          onClose={() => setShowLogin(false)}
        />
      </Modal>

      {/* Modal de Registro */}
      <Modal
        show={showRegister}
        title="Registrarse"
        onClose={() => setShowRegister(false)}
        size="sm"
        dark
      >
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={abrirLogin}
          onClose={() => setShowRegister(false)}
        />
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
