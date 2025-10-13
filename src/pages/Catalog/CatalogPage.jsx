import React from 'react'
import ProductCard from './components/ProductCard'

export default function CatalogPage() {
  const [productos, setProductos] = React.useState([])
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    // Carga simple desde /public/data/products.json usando fetch nativo
    fetch('/data/products.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el catálogo')
        return res.json()
      })
      .then(data => setProductos(data))
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p>Cargando catálogo…</p>
  if (error) return <div className="alert alert-danger">Error: {error}</div>

  return (
    <div>
      <h2 className="mb-4">Catálogo</h2>
      <div className="row">
        {productos.map(p => <ProductCard key={p.id} producto={p} />)}
      </div>
    </div>
  )
}
