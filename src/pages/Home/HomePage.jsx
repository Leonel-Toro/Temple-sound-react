import React from 'react'

export default function HomePage() {
  return (
    <div className="row align-items-center">
      <div className="col-md-6">
        <h1 className="display-5 fw-bold">Bienvenido a Temple Sound</h1>
        <p className="lead">Descubre vinilos y música seleccionada con curaduría especial.</p>
        <a href="#/catalogo" className="btn btn-primary">Ver catálogo</a>
      </div>
      <div className="col-md-6">
        <img className="img-fluid rounded" src="/assets/placeholder-1.jpg" alt="Vinilo destacado" />
      </div>
    </div>
  )
}
