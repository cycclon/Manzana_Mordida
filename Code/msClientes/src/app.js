const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
// DOCUMENTATION IMPORTS
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const redoc = require('redoc-express');
// ROUTES
const ClienteRoute = require('./routes/cliente.routes');

dotenv.config(),
connectDB();

// CONFIG
const app = express();
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Redoc route and style
app.get(
  '/redoc',
  redoc({
    title: 'Documentación de API para microservicio clientes - app AppleSales',
    specUrl: '/docs/clientes/swagger.json', // must match the route above
  })
);

// Expose swagger.json so Redoc can load it
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Routes
app.use('/api/v1/clientes', ClienteRoute);

app.get("/", (req, res) => res.send("AppleSales - Servicio clientes corriendo"));

app.use(errorHandler);

module.exports = app;
