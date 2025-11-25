import React from 'react'

export default function ProductCard({ producto }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow-sm card-product">
        <a href={`#/producto/${producto.id}`}>
          <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
        </a>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{producto.nombre}</h5>
          <p className="card-text text-muted mb-4">
            ${producto.precio.toLocaleString('es-CL')}
          </p>
          <a href={`#/producto/${producto.id}`} className="btn btn-outline-primary mt-auto">
            Ver detalle
          </a>
        </div>
      </div>
    </div>
  )
}
