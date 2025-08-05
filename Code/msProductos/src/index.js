const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Producto = require('./schemas/Producto');

// Configurar .env
dotenv.config({ path: '.env'});
// Conectar a base de datos
mongoose.connect(process.env.MONGO_URL);

const producto = new Producto({ marca: 'Apple', modelo: 'iPhone 16 Pro Max 256 GB', colores: ['Natural Titanium', 'White Titanium', 'Black Titanium', 'Desert Titanium']});

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Microservicio Productos escuchando en puerto ${port} `);
});