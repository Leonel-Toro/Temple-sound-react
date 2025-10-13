# React 19 + Vite + Bootstrap (CDN) — Proyecto simple

**Tecnologías**: React 19.0.1, Vite, React Router 6, Bootstrap (CDN), Jasmine + Karma.

## Requisitos
- Node 20+
- npm

## Instalación
```bash
npm install
npm run dev
```

Abre el navegador en http://localhost:5173

## Build de producción
```bash
npm run build
npm run preview
```

## Pruebas (Jasmine + Karma)
```bash
npm run test
npm run test:watch
```

> Nota: La configuración de Karma usa **esbuild** para transpilar JSX. Si deseas pruebas de componentes más complejas, podemos integrar @testing-library/react más adelante.
