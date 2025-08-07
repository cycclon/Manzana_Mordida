const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Producto = require('./schemas/ProductoSchema');
const Color = require('./schemas/ColorSchema');

// Configurar .env
dotenv.config({ path: '.env'});
// Conectar a base de datos
mongoose.connect(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT;

app.get('/', async (req, res) => {
    const productos = await Producto.find({}).populate('colores', 'nombre');
    // console.log(productos);
    res.send(productos);
});

app.post('/crear-producto', async (req, res) => {
    try {
        const graphite = await Color.findOne({ nombre: 'Graphite'});
        const white = await Color.findOne({ nombre: 'White' });

        const producto = new Producto({ marca: 'Apple', linea: 'iPhone', modelo: '16 Pro Max 1TB', colores: [graphite._id, white._id]});

        await producto.save();
        console.log('Producto creado');
    } catch (error) {
        console.log(error);
    }

    res.send('Productos');
})

app.listen(port, () => {
    console.log(`Microservicio Productos escuchando en puerto ${port} `);
});