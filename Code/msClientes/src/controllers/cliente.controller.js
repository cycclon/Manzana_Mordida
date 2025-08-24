const Cliente = require("../models/cliente.model");

// Devuelve el listado de clientes registrados
async function getClientes(req, res, next) {
    try {
        // Obtener todos los clientes registrados
        const clientes = await Cliente.find({});
        
        res.status(200).json(clientes);
    } catch (error) {
        next(error);
    }
}

// Agrega un nuevo cliente
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

// Devuelve un cliente según su ID. Sólo puede acceder el propio cliente
async function getCliente(req, res, next) {
    try {
        const { id } = req.params || ""; // id de cliente

        // Comprobar que el ID de cliente corresponda al cliente logueado
        // Obtener usuario segun token
        const response = await fetch(process.env.SEGURIDADMS_URL + 'auth/validate', {
            method: 'GET',
            headers: {
                'Content-Type': "application/json",
                'Authorization': req.headers.authorization
            }
        });

        if(response.ok) {
            const data = await response.json();
            const cliente = await Cliente.findById({ _id: id });

            if(cliente && data.user.username === cliente.usuario) {
                res.status(200).json({ message: 'ok' });
            } else {
                res.status(404).json({ message: 'Forbidden' });
            }                
        } else {
            res.stauts(404).json({ message: 'Not Found' });
        }        
    } catch (error) {
        next(error);
    }
}

module.exports = { getClientes, addCliente, getCliente};