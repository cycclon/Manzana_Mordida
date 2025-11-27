# Docker Setup for Manzana Mordida Microservices

This docker-compose configuration starts all 8 microservices for the AppleSales application.

## Prerequisites

- Docker and Docker Compose installed
- MongoDB running locally on port 27017 (not included in docker-compose)
- `.env` file configured (copy from `.env.example` and update values)

## Services Included

All microservices connect to your local MongoDB instance at `localhost:27017`:

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| msSeguridad | 3002 | seguridad | Authentication & JWT tokens |
| msProductos | 3001 | productos | Products and devices (equipos) |
| msClientes | 3003 | clientes | Customer management |
| msAgenda | 3004 | agenda | Appointments scheduling |
| msSucursales | 3005 | sucursales | Branch offices |
| msCanjes | 3006 | canjes | Trade-in devices |
| msReservas | 3007 | reservas | Reservations & down payments |
| msCuentasBancarias | 3009 | cuentas_bancarias | Bank accounts |

## Quick Start

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# The .env file is already configured with working values
```

### 2. Start MongoDB (if not already running)

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=Manzana \
  -e MONGO_INITDB_ROOT_PASSWORD=Mordida445 \
  mongo:latest
```

### 3. Start All Microservices

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 4. Start Specific Services

```bash
# Start only specific microservices
docker-compose up msSeguridad msProductos msClientes
```

### 5. View Logs

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f msSeguridad
```

### 6. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Environment Variables

### Variables from .env file (shared across services):

**MongoDB Configuration:**
- `MONGODB_USER`: MongoDB username
- `MONGODB_PASSWORD`: MongoDB password
- `MONGODB_HOST`: MongoDB host (default: `host.docker.internal`)
- `MONGODB_PORT`: MongoDB port (default: `27017`)
- `MONGODB_AUTH_SOURCE`: Authentication database (default: `admin`)

**JWT Configuration:**
- `JWT_SECRET`: Shared secret for JWT validation
- `JWT_EXPIRY`: JWT token expiration time (default: `15m`)

**Application:**
- `NODE_ENV`: Environment (default: `production`)

**Cloudflare R2 (for msProductos and msReservas):**
- `R2_ENDPOINT`: R2 storage endpoint
- `R2_ACCESS_KEY_ID`: R2 access key
- `R2_SECRET_ACCESS_KEY`: R2 secret key
- `R2_BUCKET_NAME`: R2 bucket name
- `R2_PUBLIC_URL`: Public URL for R2 resources

### Variables hardcoded in docker-compose.yml:

**Service Ports:**
- Each service has its own `PORT` variable

**msSeguridad specific:**
- `REFRESH_TOKEN_EXPIRY_DAYS`: 7
- `REFRESH_TOKEN_BYTES`: 64
- `COOKIE_SECURE`: false

**msReservas specific:**
- `PORCENTAJE_RESERVA`: 0.2 (20% down payment)
- `VIGENCIA_RESERVA`: 7 (reservation valid for 7 days)

## Accessing Swagger Documentation

Each microservice exposes Swagger documentation:

- msSeguridad: http://localhost:3002/api-docs
- msProductos: http://localhost:3001/api-docs
- msClientes: http://localhost:3003/api-docs
- msAgenda: http://localhost:3004/api-docs
- msSucursales: http://localhost:3005/api-docs
- msCanjes: http://localhost:3006/api-docs
- msReservas: http://localhost:3007/api-docs
- msCuentasBancarias: http://localhost:3009/api-docs

## Troubleshooting

### Services can't connect to MongoDB

1. Verify MongoDB is running:
   ```bash
   docker ps | grep mongo
   # OR if running locally without docker:
   ps aux | grep mongod
   ```

2. Test MongoDB connection:
   ```bash
   docker exec -it mongodb mongosh -u Manzana -p Mordida445 --authenticationDatabase admin
   ```

3. Check if `host.docker.internal` resolves (Docker Desktop):
   ```bash
   docker run --rm alpine ping -c 1 host.docker.internal
   ```

### Port already in use

Stop the process using the port:
```bash
# Find process using port 3002
lsof -ti:3002 | xargs kill -9

# Or stop specific service
docker-compose stop msSeguridad
```

### Rebuild after code changes

```bash
# Rebuild specific service
docker-compose build msSeguridad

# Rebuild all services
docker-compose build
```

### View service status

```bash
docker-compose ps
```

## Development vs Production

This configuration is set for production (`NODE_ENV=production`). For development:

1. Change `NODE_ENV=development` in the `.env` file
2. Consider using `nodemon` for hot reload
3. Mount source code as volumes for live updates

## Network Configuration

All services run on the `applesales-network` bridge network, allowing them to communicate with each other using service names.

## Health Checks

To verify all services are running:

```bash
# Check if all ports are listening
for port in 3001 3002 3003 3004 3005 3006 3007 3009; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/api-docs > /dev/null && echo "✓ OK" || echo "✗ FAIL"
done
```

## Updating Services

To update a single service without affecting others:

```bash
# 1. Stop the service
docker-compose stop msSeguridad

# 2. Rebuild the service
docker-compose build msSeguridad

# 3. Start the service
docker-compose up -d msSeguridad
```

## Clean Start

To completely reset all containers:

```bash
# Stop and remove containers, networks
docker-compose down

# Remove all images
docker-compose down --rmi all

# Rebuild and start fresh
docker-compose up --build
```

## Notes

- MongoDB is NOT included in docker-compose (you must run it separately)
- All services use `host.docker.internal` to connect to MongoDB on your host machine
- Environment variables are stored in `.env` file (copy from `.env.example` to get started)
- Sensitive variables (MongoDB credentials, JWT secret, R2 keys) are in `.env` - **DO NOT commit this file!**
- Service-specific variables (PORT, REFRESH_TOKEN_EXPIRY_DAYS, etc.) remain in `docker-compose.yml`
- Services restart automatically unless explicitly stopped
- The `.env` file is already configured with working values for development
