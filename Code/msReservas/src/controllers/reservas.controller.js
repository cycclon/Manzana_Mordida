const Reserva = require('../schemas/reserva.model');

/**
 * Solicitar una nueva reserva
 * POST /api/v1/reservas/solicitar
 * Body: { cliente: {...}, equipo: {...}, sucursal: string }
 */
async function solicitarReserva(req, res, next) {
    try {
        const { equipo, sucursal } = req.body;
        
        // Obtener información del usuario autenticado
        const cliente = {
            nombreUsuario: req.user.username || req.user.nombreUsuario,
            email: req.user.email,
            telefono: req.body.telefono || req.user.telefono
        };

        // Calcular la seña (20% del precio según el .env)
        const porcentajeReserva = parseFloat(process.env.PORCENTAJE_RESERVA) || 0.2;
        const precioEquipo = req.body.precio || 0; // Debería venir del body o del servicio de productos
        const montoSena = precioEquipo * porcentajeReserva;

        // Calcular fecha de vencimiento
        const vigenciaReserva = parseInt(process.env.VIGENCIA_RESERVA) || 7;
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaReserva);

        // Crear la reserva
        const nuevaReserva = new Reserva({
            cliente,
            equipo,
            fecha: new Date(),
            sucursal,
            sena: {
                monto: montoSena,
                estado: 'Solicitada'
            },
            estado: 'Solicitada'
        });

        await nuevaReserva.save();

        res.status(201).json({
            success: true,
            message: 'Reserva solicitada exitosamente',
            data: nuevaReserva
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Pagar la seña de una reserva
 * POST /api/v1/reservas/pagarsena/:idReserva
 * Body: { metodoPago: string, comprobante?: string }
 */
async function pagarSena(req, res, next) {
    try {
        const { idReserva } = req.params;
        const { metodoPago, comprobante } = req.body;

        const reserva = await Reserva.findById(idReserva);
        
        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que la reserva esté en estado correcto
        if (reserva.estado !== 'Solicitada') {
            return res.status(400).json({
                success: false,
                message: 'La reserva no está en estado Solicitada'
            });
        }

        // Actualizar estado de la seña (el middleware ya lo hace, pero lo confirmamos aquí)
        reserva.sena.estado = 'Pagada';
        
        await reserva.save();

        // Aquí podrías integrar con un servicio de pagos real
        // o registrar el comprobante en otra colección

        res.status(200).json({
            success: true,
            message: 'Seña pagada exitosamente. Pendiente de confirmación por el vendedor.',
            data: reserva
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Obtener una reserva por ID
 * GET /api/v1/reservas/:id
 */
async function getReserva(req, res, next) {
    try {
        const { id } = req.params;
        
        const reserva = await Reserva.findById(id);
        
        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Si es un viewer, verificar que sea dueño de la reserva
        if (req.user.role === 'viewer') {
            if (reserva.cliente.nombreUsuario !== req.user.username && 
                reserva.cliente.email !== req.user.email) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver esta reserva'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: reserva
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Confirmar una reserva (admin/sales)
 * POST /api/v1/reservas/confirmar/:id
 */
async function confirmarReserva(req, res, next) {
    try {
        const { id } = req.params;
        
        const reserva = await Reserva.findById(id);
        
        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que la seña esté pagada
        if (reserva.sena.estado !== 'Pagada') {
            return res.status(400).json({
                success: false,
                message: 'La seña debe estar pagada antes de confirmar la reserva'
            });
        }

        // Los middlewares ya cambiaron los estados
        reserva.sena.estado = 'Confirmada';
        reserva.estado = 'Confirmada';
        
        await reserva.save();

        // Aquí podrías notificar al cliente por email/SMS
        // o actualizar el inventario en el servicio de productos

        res.status(200).json({
            success: true,
            message: 'Reserva confirmada exitosamente',
            data: reserva
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Completar una reserva (cuando el cliente retira el producto)
 * POST /api/v1/reservas/completar/:id
 * Body: { pagoFinal: number, metodoPago: string }
 */
async function completarReserva(req, res, next) {
    try {
        const { id } = req.params;
        const { pagoFinal, metodoPago } = req.body;
        
        const reserva = await Reserva.findById(id);
        
        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que esté confirmada
        if (reserva.estado !== 'Confirmada') {
            return res.status(400).json({
                success: false,
                message: 'La reserva debe estar confirmada antes de completarla'
            });
        }

        // El middleware ya cambió el estado
        reserva.estado = 'Completada';
        
        await reserva.save();

        // Aquí podrías:
        // - Registrar la venta final en el servicio de ventas
        // - Actualizar el inventario
        // - Generar factura/recibo
        // - Enviar notificación de confirmación al cliente

        res.status(200).json({
            success: true,
            message: 'Reserva completada exitosamente. Venta registrada.',
            data: reserva
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Obtener todas las reservas (admin/sales) con filtros opcionales
 * GET /api/v1/reservas?estado=Confirmada&sucursal=Centro
 */
async function getReservas(req, res, next) {
    try {
        const { estado, sucursal, cliente, fechaDesde, fechaHasta, page = 1, limit = 10 } = req.query;
        
        // Construir filtros
        const filtros = {};
        
        if (estado) {
            filtros.estado = estado;
        }
        
        if (sucursal) {
            filtros.sucursal = sucursal;
        }
        
        if (cliente) {
            filtros['cliente.nombreUsuario'] = { $regex: cliente, $options: 'i' };
        }
        
        if (fechaDesde || fechaHasta) {
            filtros.fecha = {};
            if (fechaDesde) {
                filtros.fecha.$gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                filtros.fecha.$lte = new Date(fechaHasta);
            }
        }

        // Paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const reservas = await Reserva.find(filtros)
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Reserva.countDocuments(filtros);

        res.status(200).json({
            success: true,
            data: reservas,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { 
    solicitarReserva,  
    pagarSena,
    getReserva,
    confirmarReserva,
    completarReserva,
    getReservas
};