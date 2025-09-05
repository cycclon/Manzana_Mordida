const Cita = require('../schemas/cita.model');

async function establecerCita(req, res, next) {
    try {
        const { id } = req.params;
        const cita = await Cita.findById(id);
        if(!cita) return res.status(404).json({ message: 'Cita inexistente' });
        req.cita = cita;
        //console.log(req.cita);
        next();
    } catch (error) {
        next(error);
    }
}

function cambiarEstado(nuevoEstado) {
    return async (req, res, next) => {
        try {
            
            switch(nuevoEstado) {
                case "Confirmada":
                    if(req.cita.estado !== "Solicitada") {
                        return res.status(400).json({ message: `No se puede confirmar una cita ${ req.cita.estado }` });
                    } else { req.cita.vendedor = req.user.username; }
                    break;
                case "Cancelada":
                    if(req.cita.estado !== 'Solicitada' && req.cita.estado !== 'Confirmada') {
                        return res.status(400).json({ message: `No se puede cancelar una cita ${ req.cita.estado }` });
                    }
                    break;
                case "Reprogramada":
                    if(req.cita.estado === 'Reprogramada') {
                        return res.status(400).json({ message: `La cita ya fue reprogramada` });
                    } else {
                        console.log(req.cita);
                        const { nuevaFecha, nuevaHora } = req.body;
                        const citaReprogramada = new Cita({
                            cliente: req.cita.cliente,
                            fecha: nuevaFecha,
                            horaInicio: nuevaHora,
                            sucursal: req.cita.sucursal,
                            estado: "Solicitada",
                            duracion: req.cita.cliente.canje ? 2 : 0.5,
                            vendedor: req.cita.vendedor
                        });
                        console.log('ok');
                        const result = await citaReprogramada.save();

                        req.cita.reprogramada = result._id;
                    }
                    break;
                default:
                    return res.status(400).json({ message: 'Estado incorrecto.' });
            }
            req.cita.estado = nuevoEstado;
            await req.cita.save();
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { cambiarEstado, establecerCita };