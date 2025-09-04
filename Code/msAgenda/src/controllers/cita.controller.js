const Cita = require('../schemas/cita.model');
const Cancelacion = require('../schemas/cancelacion.cita.model');

const CITAS_ANONIMAS = 'sucursal estado fecha horaInicio duracion';

async function getCitas(req, res, next) {
    try {
        const { fecha, sucursal } = req.params;
        const citas = await Cita.find({ fecha, sucursal });

        res.status(200).json(citas);
    } catch (error) {
        next(error);
    }
};

async function getCitasAnonimas(req, res, next) {
    try {
        const { fecha, sucursal } = req.params;        
        const citas = await Cita.find({ fecha, sucursal }).select(CITAS_ANONIMAS);
        
        res.status(200).json(citas);
    } catch (error) {
        next(error);
    }
};

async function getCitasAnonimasRango(req, res, next) {
    try {
        const { fechaDesde, fechaHasta, sucursal } = req.params;
        const citas = await Cita.find({
            fecha: {
                $gte: fechaDesde,
                $lte: fechaHasta
            },
            sucursal
        }).select(CITAS_ANONIMAS);

        res.status(200).json(citas);
    } catch (error) {
        next(error);
    }
};

async function cancelarCita(req, res, next) {
    try {
        const { idCita } = req.params;
        const { motivo } = req.body || 'No especificado';        

        // Registrar cancelacion con motivo y fecha
        const cancelacion = new Cancelacion({
            motivo,
            fecha: Date.now(),
            idCita
        });

        await cancelacion.save();

        res.status(201).json({message: 'Cita cancelada'});
    } catch (error) {
        next(error);
    }
};

async function solicitarCita(req, res, next) {
    try {
        const { cliente, fecha, horaInicio, sucursal } = req.body;
        const nuevaCita = new Cita({
            cliente,
            fecha,
            horaInicio,
            sucursal,
            estado: 'Solicitada',
            duracion: cliente.canje ? 2 : 0.5
        });

        await nuevaCita.save();
        res.status(201).json({ message: 'Cita registrada correctamente' });
    } catch (error) {
        next(error);
    }
};

async function confirmarCita(req, res, next) {
    try {
        res.status(201).json({ message: 'Cita confirmada.'});
    } catch (error) {
        next(error);
    }
};

async function reprogramarCita(req, res, next) {
    try {
        res.status(201).json({ message: 'Cita reprogramada.'});
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getCitas, 
    getCitasAnonimas,
    getCitasAnonimasRango,
    solicitarCita,
    cancelarCita,
    confirmarCita,
    reprogramarCita
};