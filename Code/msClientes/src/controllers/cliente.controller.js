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
        const { nombres, apellidos, email, whatsapp, usuario } = req.body;

        // Validar que el usuario exista
        const response = await fetch(process.env.SEGURIDADMS_URL + "users/viewer-exists", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario })
        });
        
        if(response) {
            const data = await response.json();
                       
            if(data.exists) {
                // Validar que el usuario no esté ya vinculado a otro cliente
                const cliente = await Cliente.findOne({ usuario: usuario });

                if(!cliente) {
                    const nuevoCliente = new Cliente({
                        nombres, apellidos, email, whatsapp, usuario
                    });

                    await nuevoCliente.save();
                    res.status(201).json({ message: 'Cliente registrado' });
                } else {
                    res.status(400).json({ message: 'El usuario ya está asociado a otro cliente'})
                }                
            } else { 
                res.status(404).json({ message: 'Usuario no encontrado'});
            }            
        } else {
            res.status(404).json({ message: 'Usuario no encontrado'});
        }        
    } catch (error) {
        next(error)
    }
}

module.exports = { getClientes, addCliente };