# Environment Variables Mapping

This document explains how environment variables are organized between `.env` file and `docker-compose.yml`.

## Variables in .env file (Shared across services)

### MongoDB Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `MONGODB_USER` | MongoDB username | `Manzana` |
| `MONGODB_PASSWORD` | MongoDB password | `Mordida445` |
| `MONGODB_HOST` | MongoDB host | `host.docker.internal` |
| `MONGODB_PORT` | MongoDB port | `27017` |
| `MONGODB_AUTH_SOURCE` | Auth database | `admin` |

### JWT Configuration
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `JWT_SECRET` | JWT signing secret | `supersecretkey` |
| `JWT_EXPIRY` | Access token expiry | `15m` |

### Application
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NODE_ENV` | Environment mode | `production` or `development` |

### Cloudflare R2 (for msProductos and msReservas)
| Variable | Description | Used By |
|----------|-------------|---------|
| `R2_ENDPOINT` | R2 storage endpoint | msProductos, msReservas |
| `R2_ACCESS_KEY_ID` | R2 access key | msProductos, msReservas |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | msProductos, msReservas |
| `R2_BUCKET_NAME` | R2 bucket name | msProductos, msReservas |
| `R2_PUBLIC_URL` | Public URL for R2 | msProductos, msReservas |

## Variables Hardcoded in docker-compose.yml

### Per-Service Variables
| Variable | Service | Value | Reason |
|----------|---------|-------|--------|
| `PORT` | All services | 3001-3009 | Each service needs unique port |

### msSeguridad Specific
| Variable | Value | Reason |
|----------|-------|--------|
| `REFRESH_TOKEN_EXPIRY_DAYS` | `7` | Security policy |
| `REFRESH_TOKEN_BYTES` | `64` | Token size |
| `COOKIE_SECURE` | `false` | Dev/localhost setting |

### msReservas Specific
| Variable | Value | Reason |
|----------|-------|--------|
| `PORCENTAJE_RESERVA` | `0.2` | Business rule (20% down payment) |
| `VIGENCIA_RESERVA` | `7` | Business rule (7 days validity) |

## How Services Use Variables

### All Services (except msSeguridad)
```yaml
environment:
  - MONGO_URL=mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/[database]?authSource=${MONGODB_AUTH_SOURCE}
  - PORT=[service-specific-port]
  - JWT_SECRET=${JWT_SECRET}
  - NODE_ENV=${NODE_ENV}
```

### msSeguridad
```yaml
environment:
  - MONGO_URI=mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/seguridad?authSource=${MONGODB_AUTH_SOURCE}
  - JWT_SECRET=${JWT_SECRET}
  - JWT_EXPIRY=${JWT_EXPIRY}
  - REFRESH_TOKEN_EXPIRY_DAYS=7        # Hardcoded
  - REFRESH_TOKEN_BYTES=64             # Hardcoded
  - COOKIE_SECURE=false                # Hardcoded
  - PORT=3002
  - NODE_ENV=${NODE_ENV}
```

### msProductos
```yaml
environment:
  - MONGO_URL=mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/productos?authSource=${MONGODB_AUTH_SOURCE}
  - PORT=3001
  - JWT_SECRET=${JWT_SECRET}
  - NODE_ENV=${NODE_ENV}
  - R2_ENDPOINT=${R2_ENDPOINT}         # From .env
  - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
  - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
  - R2_BUCKET_NAME=${R2_BUCKET_NAME}
  - R2_PUBLIC_URL=${R2_PUBLIC_URL}
```

### msReservas
```yaml
environment:
  - MONGO_URL=mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/reservas?authSource=${MONGODB_AUTH_SOURCE}
  - JWT_SECRET=${JWT_SECRET}
  - PORT=3007
  - PORCENTAJE_RESERVA=.2              # Hardcoded
  - VIGENCIA_RESERVA=7                 # Hardcoded
  - NODE_ENV=${NODE_ENV}
  - R2_ENDPOINT=${R2_ENDPOINT}         # From .env
  - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
  - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
  - R2_BUCKET_NAME=${R2_BUCKET_NAME}
  - R2_PUBLIC_URL=${R2_PUBLIC_URL}
```

## Security Best Practices

✅ **DO:**
- Keep `.env` file in `.gitignore`
- Use `.env.example` as template for new deployments
- Rotate sensitive values (JWT_SECRET, R2 keys) regularly
- Use strong passwords for MongoDB
- Change default values in production

❌ **DON'T:**
- Commit `.env` file to version control
- Share `.env` file in public channels
- Use default passwords in production
- Hardcode sensitive values in docker-compose.yml

## Testing Configuration

Verify all variables are properly loaded:

```bash
# Check docker-compose resolves all variables
docker-compose config

# Start services and check logs for connection issues
docker-compose up

# Verify environment inside a container
docker exec -it ms-seguridad env | grep -E "MONGO|JWT|NODE_ENV"
```

## Migration from Old Configuration

If you have old microservice `.env` files, they are no longer needed for Docker deployment:

| Old Location | New Location | Notes |
|--------------|--------------|-------|
| `msSeguridad/.env` | Root `.env` | Variables now shared |
| `msProductos/.env` | Root `.env` | R2 variables added to root |
| `msReservas/.env` | Root `.env` | PORCENTAJE/VIGENCIA in docker-compose |
| Other `ms*/.env` | Root `.env` | All consolidated |

**Note:** Individual `.env` files are still used when running services locally without Docker.
