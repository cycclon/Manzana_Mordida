// LIBRARIES
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// DOCUMENTATION IMPORTS
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const redoc = require('redoc-express');

// MIDDLEWARE/UTILS
const errorHandler = require('./middleware/errorHandler');

// ROUTES
const ProductoRoute = require('./routes/ProductoRoute');
const EquipoRoute = require('./routes/EquipoRoute');

// CONFIG
// Configurar .env
dotenv.config({ path: '.env'});
// Conectar a base de datos
mongoose.connect(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Redoc route and style
app.get(
  '/redoc',
  redoc({
    title: 'Microservicio de gestión de productos y equipos',
    specUrl: '/swagger.json', // must match the route above
  })
);

// Expose swagger.json so Redoc can load it
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// ROUTES
app.use('/api/productos', ProductoRoute);
app.use('/api/equipos', EquipoRoute);

// MIDDLEWARE
app.use(errorHandler);

// SERVER INIT
app.listen(port, () => {
    console.log(`Microservicio Productos escuchando en puerto ${port} `);
});