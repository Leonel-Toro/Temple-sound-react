import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import React from "react";

export default function Header({ onOpenLogin }) {
  const { setOpen, items } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const count = items.reduce((a,b)=>a+(b.quantity||0),0);
  const [openModal, setOpenModal] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    logout();
    window.location.href = '/';
  };

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  const Link = ({ href, children }) => (
    <a
      className="nav-link"
      href={href}
      onClick={() => setOpen(false)}
    >
      {children}
    </a>
  );

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-black fixed-top shadow">
      <div className="container-fluid justify-content-end">
        <a href="/">
        <img src="/assets/img/logo3.png" alt="Logo_Templatesonund" style={{ width: 100, filter: 'brightness(0) invert(1)' }}/>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Menú"
          aria-expanded={openModal}
          onClick={() => setOpenModal((v) => !v)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link href="/vinilos">Vinilos</Link>
            </li>
            <li className="nav-item">
              <Link href="/nosotros">Nosotros</Link>
            </li>
            <li className="nav-item">
              <Link href="/contacto">Contacto</Link>
            </li>
            <li className="nav-item me-2">
              <button className="btn btn-outline-light position-relative" onClick={()=>setOpen(true)}>
                <i className="bi bi-cart3"></i> Carrito
                {count > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {count}
                  </span>
                )}
              </button>
            </li>
            {!user ? (
              <li className="nav-item">
                <button className="btn btn-outline-light ms-lg-1" onClick={onOpenLogin}>
                  <i className="bi bi-person"></i> Iniciar Sesión
                </button>
              </li>
            ) : (
              <li className="nav-item dropdown">
                <button 
                  className="btn btn-outline-light ms-lg-1 dropdown-toggle" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-expanded={showProfileDropdown}
                >
                  <i className="bi bi-person-circle"></i> {user.first_name || user.name || 'Usuario'}
                </button>
                {showProfileDropdown && (
                  <ul className="dropdown-menu dropdown-menu-end show bg-dark" style={{ position: 'absolute', right: 0 }}>
                    <li className="dropdown-header text-white">
                      <div className="small text-muted">Conectado como:</div>
                      <div>{user.email}</div>
                      <div>
                        <span className={`badge ${isAdmin() ? 'bg-danger' : 'bg-info'} mt-1`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider border-secondary" /></li>
                    <li>
                      <a 
                        className="dropdown-item text-white" 
                        href="/perfil"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <i className="bi bi-person me-2"></i> Mi Perfil
                      </a>
                    </li>
                    {isAdmin() && (
                      <li>
                        <a 
                          className="dropdown-item text-white" 
                          href="/admin"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <i className="bi bi-gear me-2"></i> Panel Admin
                        </a>
                      </li>
                    )}
                    <li><hr className="dropdown-divider border-secondary" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
