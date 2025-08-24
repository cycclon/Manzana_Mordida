const Cliente = require('../models/cliente.model');

// Verifica que una solicitud a un endpoint se haga del mismo cliente
// Para que los datos del cliente puedan ser alterados sólo por el propio cliente
// Establece la variable 'cliente' en el objeto response (res)
async function checkSelfRequest(req, res, next) {
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
                res.cliente = cliente;
                         
                next();
            } else res.status(401).json({ message: 'Forbidden' });
        } else  res.stauts(404).json({ message: 'Not Found' });
    } catch (error) {
        next(error);
    }
}

module.exports = { checkSelfRequest };