import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      // Proxy API requests to backend microservices
      '/api/seguridad': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seguridad/, ''),
      },
      '/api/productos': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/productos/, ''),
      },
      '/api/equipos': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/colores': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/clientes': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clientes/, ''),
      },
      '/api/agenda': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/agenda/, ''),
      },
      '/api/sucursales': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sucursales/, ''),
      },
      '/api/canjes': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/canjes/, ''),
      },
      '/api/reservas': {
        target: 'http://localhost:3007',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reservas/, ''),
      },
      '/api/cuentas-bancarias': {
        target: 'http://localhost:3009',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cuentas-bancarias/, ''),
      },
      '/api/crm': {
        target: 'http://localhost:3008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/crm/, ''),
      },
    },
  },
})
