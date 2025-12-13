import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      // Proxy API requests to backend microservices
      // Security service (msSeguridad) - port 3002
      '/api/seguridad': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seguridad/, ''),
      },
      // Products service (msProductos) - port 3001
      '/api/productos': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/equipos': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/colores': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Customers service (msClientes) - port 3003
      '/api/v1/clientes': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      // Agenda service (msAgenda) - port 3004
      '/api/v1/citas': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
      '/api/v1/horarios': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
      // Branches service (msSucursales) - port 3005
      '/api/v1/sucursales': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      // Trade-in service (msCanjes) - port 3006
      '/api/v1/canjes': {
        target: 'http://localhost:3006',
        changeOrigin: true,
      },
      // Reservations service (msReservas) - port 3007
      '/api/v1/reservas': {
        target: 'http://localhost:3007',
        changeOrigin: true,
      },
      // Bank accounts service (msCuentasBancarias) - port 3009
      '/api/v1/cuentas': {
        target: 'http://localhost:3009',
        changeOrigin: true,
      },
      // CRM service (msCRM) - port 3008
      '/api/v1/crm': {
        target: 'http://localhost:3008',
        changeOrigin: true,
      },
    },
  },
})
