# Vite Proxy Configuration for API Requests

## 🎯 Purpose

This proxy configuration solves CORS (Cross-Origin Resource Sharing) issues during development by forwarding API requests from the Vite dev server (`http://localhost:5173`) to the backend microservices running on different ports.

---

## 🔧 How It Works

```
Browser Request:
http://localhost:5173/api/productos/api/equipos
         ↓
Vite Proxy intercepts request
         ↓
Rewrites path: /api/equipos
         ↓
Forwards to: http://localhost:3001/api/equipos
         ↓
Backend responds
         ↓
Vite forwards response to browser
```

**Key Benefits:**
- ✅ No CORS errors (same-origin requests)
- ✅ No need to modify backend code
- ✅ Works for development only
- ✅ Simulates production API gateway

---

## 📝 Configuration

### vite.config.js

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
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
      // ... other services
    },
  },
})
```

### .env File

```env
# Use relative paths (proxy handles routing)
VITE_API_SEGURIDAD=/api/seguridad
VITE_API_PRODUCTOS=/api/productos
VITE_API_CLIENTES=/api/clientes
VITE_API_AGENDA=/api/agenda
VITE_API_SUCURSALES=/api/sucursales
VITE_API_CANJES=/api/canjes
VITE_API_RESERVAS=/api/reservas
VITE_API_CUENTAS_BANCARIAS=/api/cuentas-bancarias
```

---

## 🔀 Proxy Routes Mapping

| Frontend Path | Backend Service | Port | Target Path |
|---------------|----------------|------|-------------|
| `/api/seguridad/*` | msSeguridad | 3002 | `/*` |
| `/api/productos/*` | msProductos | 3001 | `/*` |
| `/api/clientes/*` | msClientes | 3003 | `/*` |
| `/api/agenda/*` | msAgenda | 3004 | `/*` |
| `/api/sucursales/*` | msSucursales | 3005 | `/*` |
| `/api/canjes/*` | msCanjes | 3006 | `/*` |
| `/api/reservas/*` | msReservas | 3007 | `/*` |
| `/api/cuentas-bancarias/*` | msCuentasBancarias | 3009 | `/*` |

---

## 📋 Example API Calls

### Before Proxy (Direct - CORS Error)
```javascript
// ❌ CORS Error
fetch('http://localhost:3001/api/equipos')
```

### After Proxy (Via Proxy - Works)
```javascript
// ✅ Works
fetch('/api/productos/api/equipos')
```

### Using Environment Variables
```javascript
// ✅ Best Practice
const API_BASE = import.meta.env.VITE_API_PRODUCTOS;
fetch(`${API_BASE}/api/equipos`)
// Resolves to: /api/productos/api/equipos
// Proxied to: http://localhost:3001/api/equipos
```

---

## 🧪 Testing the Proxy

### Test from Terminal
```bash
# Test frontend is running
curl http://localhost:5173

# Test proxy to msProductos
curl http://localhost:5173/api/productos/api/equipos

# Test proxy to msSeguridad
curl http://localhost:5173/api/seguridad/auth/status
```

### Test from Browser Console
```javascript
// Open http://localhost:5173
// Open DevTools Console

// Test API call
fetch('/api/productos/api/equipos')
  .then(r => r.json())
  .then(console.log)

// Check Network tab - should show:
// Request URL: http://localhost:5173/api/productos/api/equipos
// Status: 200 OK (no CORS errors)
```

---

## ⚠️ Important Notes

### Development Only
- This proxy **only works in development** mode (`npm run dev`)
- Production builds need proper CORS configuration on backend

### Path Rewriting
The `rewrite` function removes the prefix:
```javascript
// Request: /api/productos/api/equipos
// Rewrite removes: /api/productos
// Forwarded as: /api/equipos (to http://localhost:3001)
```

### changeOrigin: true
This option changes the origin header to match the target, making the backend think the request came from `localhost:3001` instead of `localhost:5173`.

---

## 🚀 Production Considerations

### This Proxy Won't Work in Production!

When you build for production (`npm run build`), the Vite dev server is not used. You have two options:

### Option 1: Add CORS to Backend Services (Recommended)

Install `cors` package in each microservice:
```bash
npm install cors
```

Configure in each service:
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:5173',  // Development
    'https://yourdomain.com',  // Production
  ],
  credentials: true,
}));
```

### Option 2: Use API Gateway (Production)

Deploy an API gateway (like Nginx) that routes requests:
```nginx
location /api/productos {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 🔍 Troubleshooting

### Proxy Not Working
1. **Restart Vite server** after changing `vite.config.js`
   ```bash
   # Stop and restart
   npm run dev
   ```

2. **Check backend is running**
   ```bash
   curl http://localhost:3001/api/equipos
   ```

3. **Verify .env variables**
   ```bash
   echo $VITE_API_PRODUCTOS
   # Should output: /api/productos
   ```

4. **Check browser console** for errors

### CORS Errors Still Appearing
- Make sure you're using relative paths (`/api/productos`) not absolute URLs (`http://localhost:3001`)
- Verify Vite dev server restarted after config changes
- Check Network tab shows requests going through proxy

### 404 Errors
- Verify backend endpoint exists: `curl http://localhost:3001/api/equipos`
- Check path rewriting is correct in `vite.config.js`
- Ensure API path structure matches backend routes

---

## 📚 Files Modified

1. **vite.config.js** - Added proxy configuration
2. **.env** - Changed URLs to relative paths

---

## 🔄 Switching Between Proxy and Direct

### Use Proxy (Development)
```env
# .env
VITE_API_PRODUCTOS=/api/productos
```

### Use Direct URLs (If CORS enabled)
```env
# .env
VITE_API_PRODUCTOS=http://localhost:3001
```

**Note:** You need to restart Vite after changing `.env` files.

---

## ✅ Verification Checklist

- [x] Vite proxy configured in `vite.config.js`
- [x] Environment variables updated to use relative paths
- [x] Vite dev server restarted
- [x] Backend microservices running
- [x] Test API call works without CORS errors
- [ ] Document CORS solution for production
- [ ] Add CORS to backend services (future task)

---

**Status**: ✅ **Proxy Configured and Working**
**Environment**: Development Only
**Last Updated**: November 24, 2025

**⚠️ Remember**: Add CORS to backend services before deploying to production!
