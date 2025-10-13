import React from 'react'

export default function NotFoundPage() {
  return (
    <div className="text-center">
      <h2 className="mb-3">Página no encontrada</h2>
      <p className="text-muted">La ruta solicitada no existe.</p>
      <a href="/" className="btn btn-primary">Ir al inicio</a>
    </div>
  )
}
