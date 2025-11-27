# Manzana Mordida - Services Summary

## 📋 Quick Reference

### All Services & Ports

```
Frontend (React + Vite)    → http://localhost:5173

Microservices:
├── msSeguridad           → http://localhost:3002  (Authentication)
├── msProductos           → http://localhost:3001  (Products & Devices)
├── msClientes            → http://localhost:3003  (Customers)
├── msAgenda              → http://localhost:3004  (Appointments)
├── msSucursales          → http://localhost:3005  (Branches)
├── msCanjes              → http://localhost:3006  (Trade-ins)
├── msReservas            → http://localhost:3007  (Reservations)
└── msCuentasBancarias    → http://localhost:3009  (Bank Accounts)

Database:
└── MongoDB               → mongodb://localhost:27017
```

## 🚀 How to Start Everything

### Option 1: Using the provided script
```bash
./START_SERVICES.sh
```

### Option 2: Manual steps

1. **Configure environment** (first time only):
   ```bash
   # The .env file is already configured
   # If needed, you can copy from example:
   cp .env.example .env
   ```

2. **Start MongoDB** (if not already running):
   ```bash
   # Your MongoDB is already running on port 27017
   ```

3. **Start all microservices**:
   ```bash
   cd /Users/cycclon/Documents/Projects/Manzana_Mordida/Code
   docker-compose up -d --build
   ```

4. **Start React frontend**:
   ```bash
   cd AppleSales
   npm run dev
   ```

## 📖 API Documentation (Swagger)

Each microservice has Swagger docs at `/api-docs`:

- http://localhost:3002/api-docs (msSeguridad)
- http://localhost:3001/api-docs (msProductos)
- http://localhost:3003/api-docs (msClientes)
- http://localhost:3004/api-docs (msAgenda)
- http://localhost:3005/api-docs (msSucursales)
- http://localhost:3006/api-docs (msCanjes)
- http://localhost:3007/api-docs (msReservas)
- http://localhost:3009/api-docs (msCuentasBancarias)

## 🔐 Credentials & Configuration

All credentials are stored in the `.env` file in the project root.

### MongoDB (from .env)
- **Username**: Configured in `MONGODB_USER`
- **Password**: Configured in `MONGODB_PASSWORD`
- **Auth Database**: Configured in `MONGODB_AUTH_SOURCE`

### JWT (from .env)
- **Secret**: Configured in `JWT_SECRET`
- **Access Token Expiry**: Configured in `JWT_EXPIRY`
- **Refresh Token Expiry**: 7 days (hardcoded in docker-compose.yml)

### Cloudflare R2 (from .env)
- All R2 credentials are in the `.env` file
- Used by `msProductos` and `msReservas` for image/document storage

**⚠️ Important:** The `.env` file contains sensitive data. Never commit it to version control!

## 📁 Project Structure

```
/Users/cycclon/Documents/Projects/Manzana_Mordida/Code/
├── AppleSales/              # React Frontend (Port 5173)
├── msSeguridad/             # Authentication Service (Port 3002)
├── msProductos/             # Products & Devices Service (Port 3001)
├── msClientes/              # Customers Service (Port 3003)
├── msAgenda/                # Appointments Service (Port 3004)
├── msSucursales/            # Branches Service (Port 3005)
├── msCanjes/                # Trade-ins Service (Port 3006)
├── msReservas/              # Reservations Service (Port 3007)
├── msCuentasBancarias/      # Bank Accounts Service (Port 3009)
├── docker-compose.yml       # Docker Compose configuration
├── .env                     # Environment variables (DO NOT commit!)
├── .env.example             # Example environment file
├── DOCKER_SETUP.md          # Detailed Docker documentation
├── START_SERVICES.sh        # Quick start script
└── SERVICES_SUMMARY.md      # This file
```

## ⚙️ Common Commands

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up msSeguridad msProductos msClientes

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f msSeguridad

# Stop all services
docker-compose down

# Restart a service
docker-compose restart msSeguridad

# Check service status
docker-compose ps
```

### Frontend

```bash
cd AppleSales

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔍 Health Check

Run this to verify all services are accessible:

```bash
for port in 3001 3002 3003 3004 3005 3006 3007 3009; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/api-docs > /dev/null && echo "✓ OK" || echo "✗ FAIL"
done
```

## 🐛 Troubleshooting

### MongoDB connection issues
```bash
# Check if MongoDB is running
docker ps | grep mongo
# OR
ps aux | grep mongod

# Test connection
mongosh "mongodb://Manzana:Mordida445@localhost:27017/?authSource=admin"
```

### Port already in use
```bash
# Find what's using a port
lsof -ti:3002

# Kill the process
lsof -ti:3002 | xargs kill -9
```

### Service won't start
```bash
# View detailed logs
docker-compose logs msSeguridad

# Rebuild and restart
docker-compose build msSeguridad
docker-compose up -d msSeguridad
```

### Clear everything and start fresh
```bash
# Stop and remove all containers
docker-compose down

# Remove all built images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build
```

## 📦 Database Collections

Each microservice manages its own MongoDB database:

- **seguridad**: users, refresh_tokens
- **productos**: productos, equipos, images
- **clientes**: clientes
- **agenda**: citas, disponibilidad
- **sucursales**: sucursales
- **canjes**: canjes
- **reservas**: reservas, payments
- **cuentas_bancarias**: cuentas

## 🌐 Environment Files

### Backend Services (.env in project root)
Contains shared configuration for all microservices:
- MongoDB credentials
- JWT secret
- Cloudflare R2 configuration
- NODE_ENV setting

**Location:** `/Users/cycclon/Documents/Projects/Manzana_Mordida/Code/.env`

### Frontend (AppleSales/.env)
Contains React app configuration:

```env
VITE_API_SEGURIDAD=http://localhost:3002
VITE_API_PRODUCTOS=http://localhost:3001
VITE_API_CLIENTES=http://localhost:3003
VITE_API_AGENDA=http://localhost:3004
VITE_API_SUCURSALES=http://localhost:3005
VITE_API_CANJES=http://localhost:3006
VITE_API_RESERVAS=http://localhost:3007
VITE_API_CUENTAS_BANCARIAS=http://localhost:3009
VITE_DOLAR_API=https://dolarapi.com/v1/dolares/blue
```

**Location:** `/Users/cycclon/Documents/Projects/Manzana_Mordida/Code/AppleSales/.env`

## 📝 Notes

- All microservices are set to restart automatically unless stopped
- MongoDB runs outside of Docker Compose (on host machine)
- Services use `host.docker.internal` to connect to host's MongoDB
- **Environment variables are in `.env` file** - contains sensitive data, never commit!
- Use `.env.example` as a template for new deployments
- Service-specific variables (PORT, REFRESH_TOKEN_EXPIRY_DAYS, etc.) remain in docker-compose.yml
- All services are configured for production mode by default (change `NODE_ENV` in `.env` for development)
