// LIBRARIES
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// MIDDLEWARE/UTILS
const errorHandler = require('./middleware/errorHandler');

// ROUTES
const ProductoRoute = require('./routes/ProductoRoute');
const EquipoRoute = require('./routes/EquipoRoute');

// Configurar .env
dotenv.config({ path: '.env'});
// Conectar a base de datos
mongoose.connect(process.env.MONGO_URL);

// CONFIG
const app = express();
const port = process.env.PORT;
app.use(express.json());

// ROUTES
app.use('/api/productos', ProductoRoute);
app.use('/api/equipos', EquipoRoute);

// MIDDLEWARE
app.use(errorHandler);

// SERVER INIT
app.listen(port, () => {
    console.log(`Microservicio Productos escuchando en puerto ${port} `);
});