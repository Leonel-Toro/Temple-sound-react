import { useCart } from "../../context/CartContext";
import React from "react";

export default function Header({ onOpenLogin }) {
  const { setOpen, items } = useCart();
  const count = items.reduce((a,b)=>a+(b.quantity||0),0);
  const [openModal, setOpenModal] = React.useState(false);

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
        <img src="./assets/img/logo3.png" alt="Logo_Templatesonund" style={{ width: 100, filter: 'brightness(0) invert(1)' }}/>
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
            <li className="nav-item">
              <button className="btn btn-outline-light ms-lg-1" onClick={onOpenLogin}>Iniciar Sesión</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
