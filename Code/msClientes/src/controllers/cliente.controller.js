const Cliente = require("../models/cliente.model");

async function getClientes(req, res, next) {
    try {
        // Obtener todos los clientes registrados
        const clientes = await Cliente.find({});
        
        res.status(200).json(clientes);
    } catch (error) {
        next(error);
    }
}

async function addCliente(req, res, next) {
    try {
        const { nombres, apellidos, email, whatsapp } = req.body;

        const nuevoCliente = new Cliente({
            nombres, apellidos, email, whatsapp
        });

        await nuevoCliente.save();
        res.status(201).json({ message: 'Cliente registrado' });
    } catch (error) {
        next(error)
    }
}

module.exports = { getClientes, addCliente };