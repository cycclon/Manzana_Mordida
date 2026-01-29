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

// Get appointments in a date range (authenticated - for admin/sales)
async function getCitasRango(req, res, next) {
    try {
        const { fechaDesde, fechaHasta } = req.params;
        const { vendedor } = req.query;

        const query = {
            fecha: {
                $gte: fechaDesde,
                $lte: fechaHasta
            }
        };

        // If vendedor filter is provided, only return their appointments
        if (vendedor) {
            query['cliente.vendedor'] = vendedor;
        }

        const citas = await Cita.find(query).sort({ fecha: 1, horaInicio: 1 });

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
        const { id } = req.params;
        const { motivo } = req.body;

        // Note: The appointment status and motivoCancelacion are already updated
        // by the middleware (establecerCita + cambiarEstado('Cancelada'))
        // We just need to create the cancellation record

        // Registrar cancelacion con motivo y fecha
        const cancelacion = new Cancelacion({
            motivo: motivo || 'No especificado',
            fecha: Date.now(),
            idCita: id
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

/**
 * Get appointments for the current logged-in user
 * Matches by cliente.email
 * GET /api/v1/citas/mis-citas
 */
async function getMisCitas(req, res, next) {
    try {
        // Get email from query param or from JWT token
        const email = req.query.email || req.user?.email;

        if (!email) {
            return res.status(400).json({
                message: 'Email es requerido'
            });
        }

        const citas = await Cita.find({ 'cliente.email': email })
            .sort({ fecha: -1, horaInicio: -1 });

        res.status(200).json(citas);
    } catch (error) {
        next(error);
    }
}

/**
 * Accept a rescheduled appointment (public endpoint for viewers)
 * POST /api/v1/citas/aceptar/:id
 * Body: { email: string } - to verify ownership
 */
async function aceptarCita(req, res, next) {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email es requerido'
            });
        }

        const cita = await Cita.findById(id);

        if (!cita) {
            return res.status(404).json({
                message: 'Cita no encontrada'
            });
        }

        // Verify that the appointment belongs to this user
        if (cita.cliente.email !== email) {
            return res.status(403).json({
                message: 'No tienes permiso para aceptar esta cita'
            });
        }

        // Can only accept if it's "Solicitada" (the new rescheduled appointment)
        if (cita.estado !== 'Solicitada') {
            return res.status(400).json({
                message: 'Solo puedes aceptar citas en estado Solicitada'
            });
        }

        // Automatically confirm the appointment when viewer accepts
        // Since the sales person already proposed this time, they're available
        cita.estado = 'Confirmada';
        await cita.save();

        res.status(200).json({
            message: 'Cita confirmada exitosamente.',
            data: cita
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a confirmed appointment (for AI agent)
 * POST /api/v1/citas/crear-confirmada
 * Requires JWT authentication
 * Creates appointment directly in "Confirmada" state
 */
async function crearCitaConfirmada(req, res, next) {
    try {
        const { cliente, fecha, horaInicio, sucursal, vendedor, duracion } = req.body;

        // Validate required fields
        if (!cliente || !fecha || !horaInicio || !sucursal || !vendedor) {
            return res.status(400).json({
                message: 'Campos requeridos: cliente (con nombre), fecha, horaInicio, sucursal, vendedor'
            });
        }

        if (!cliente.nombre) {
            return res.status(400).json({
                message: 'El cliente debe tener al menos un nombre'
            });
        }

        const nuevaCita = new Cita({
            cliente,
            fecha,
            horaInicio,
            sucursal,
            vendedor,
            estado: 'Confirmada',
            duracion: duracion || (cliente.canje ? 2 : 0.5)
        });

        await nuevaCita.save();

        res.status(201).json({
            message: 'Cita confirmada creada exitosamente',
            data: nuevaCita
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCitas,
    getCitasRango,
    getCitasAnonimas,
    getCitasAnonimasRango,
    solicitarCita,
    cancelarCita,
    confirmarCita,
    reprogramarCita,
    getMisCitas,
    aceptarCita,
    crearCitaConfirmada
};