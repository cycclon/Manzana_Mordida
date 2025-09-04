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
            //console.log(req.cita);
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

function citaPropia(req, res, next) {
    if(req.user.username === req.cita.vendedor) { next(); }
    else { return res.status(400).json({ message: 'Un vendedor sólo puede modificar sus propias citas.'})}
}

module.exports = { cambiarEstado, establecerCita, citaPropia };