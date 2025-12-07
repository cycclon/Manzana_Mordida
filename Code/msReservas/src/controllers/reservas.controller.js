const Reserva = require('../schemas/reserva.model');
const { uploadComprobante } = require('../utils/R2Client');

/**
 * Solicitar una nueva reserva
 * POST /api/v1/reservas/solicitar
 * Body: { cliente: {...}, equipo: {...}, sucursal: string }
 */
async function solicitarReserva(req, res, next) {
    try {
        const { usuarioCliente, IdEquipo, canje, montoSena } = req.body;

        // Calcular fecha de vencimiento de la seña (30 minutos)
        const fechaVencimientoSena = new Date();
        fechaVencimientoSena.setMinutes(fechaVencimientoSena.getMinutes() + 30);

        // Crear la reserva
        const nuevaReserva = new Reserva({
            usuarioCliente,
            equipo: IdEquipo,
            canje,
            fecha: new Date(),
            sena: {
                monto: montoSena,
                estado: 'Solicitada',
                fechaVencimiento: fechaVencimientoSena
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
 * Body (multipart/form-data): { metodoPago: string, comprobante: File }
 */
async function pagarSena(req, res, next) {
    try {
        const { idReserva } = req.params;
        const { metodoPago } = req.body;
        const comprobanteFile = req.file;

        console.log('pagarSena - idReserva:', idReserva);
        console.log('pagarSena - metodoPago:', metodoPago);
        console.log('pagarSena - file:', comprobanteFile);

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

        // Verificar que se haya subido un archivo
        if (!comprobanteFile) {
            return res.status(400).json({
                success: false,
                message: 'Debe subir un comprobante de pago'
            });
        }

        // Upload payment proof to R2
        const comprobanteUrl = await uploadComprobante(comprobanteFile);
        console.log('pagarSena - comprobanteUrl:', comprobanteUrl);

        // Actualizar estado de la seña y guardar URL del comprobante
        reserva.sena.estado = 'Pagada';
        reserva.sena.comprobante = comprobanteUrl;

        await reserva.save();

        res.status(200).json({
            success: true,
            message: 'Seña pagada exitosamente. Pendiente de confirmación por el vendedor.',
            data: reserva
        });
    } catch (error) {
        console.error('Error en pagarSena:', error);
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
            if (reserva.usuarioCliente !== req.user.username) {
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

        // Mark reservation as completed
        reserva.estado = 'Completada';
        await reserva.save();

        // Update device status to "Vendido" in msProductos microservice
        try {
            const productosUrl = process.env.PRODUCTOSMS_URL || 'http://msProductos:3001/';
            const updateUrl = `${productosUrl}api/equipos/${reserva.equipo}`;

            console.log(`Updating device ${reserva.equipo} to Vendido...`);

            const updateResponse = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: 'Vendido',
                    fechaVenta: new Date()
                })
            });

            if (!updateResponse.ok) {
                console.error(`Failed to update device status: ${updateResponse.status}`);
                // Don't fail the reservation completion if device update fails
                // The reservation is still marked as completed
            } else {
                console.log(`Device ${reserva.equipo} marked as Vendido successfully`);
            }
        } catch (error) {
            console.error('Error updating device status:', error.message);
            // Don't fail the reservation completion if device update fails
        }

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

        if (cliente) {
            filtros.usuarioCliente = { $regex: cliente, $options: 'i' };
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

        // Fetch device details from productos microservice
        const productosUrl = process.env.PRODUCTOSMS_URL || 'http://msProductos:3001/';

        const reservasConEquipos = await Promise.all(
            reservas.map(async (reserva) => {
                try {
                    const url = `${productosUrl}api/equipos/equipo/${reserva.equipo}`;
                    console.log(`Fetching equipment from: ${url}`);
                    const response = await fetch(url);
                    console.log(`Response status: ${response.status}`);

                    if (response.ok) {
                        const equipo = await response.json();
                        console.log(`Equipment fetched successfully:`, equipo);
                        return {
                            ...reserva.toObject(),
                            equipo: equipo
                        };
                    } else {
                        console.error(`Failed to fetch equipo ${reserva.equipo}, status: ${response.status}`);
                    }
                } catch (error) {
                    console.error(`Error fetching equipo ${reserva.equipo}:`, error.message);
                }
                // If fetch fails, return with just the ID
                return reserva.toObject();
            })
        );

        res.status(200).json({
            success: true,
            data: reservasConEquipos,
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

function calcularSena(req, res, next) {
    const { monto } = req.body;
    return res.status(200).json({ sena: monto * (process.env.PORCENTAJE_RESERVA || .2)});
};

/**
 * Get reserved device IDs (public endpoint)
 * GET /api/v1/reservas/reserved-devices
 * Returns array of device IDs that have active reservations
 */
async function getReservedDevices(req, res, next) {
    try {
        const activeReservations = await Reserva.find({
            estado: { $nin: ['Cancelada', 'Vencida'] }
        }).select('equipo');

        const reservedDeviceIds = activeReservations
            .map(r => r.equipo)
            .filter(Boolean);

        res.status(200).json({
            success: true,
            data: reservedDeviceIds
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get reservations for the current logged-in user (viewer only)
 * GET /api/v1/reservas/mis-reservas
 */
async function getMisReservas(req, res, next) {
    try {
        // Get username from JWT token (set by authMiddleware in req.user)
        const username = req.user.username;

        const reservas = await Reserva.find({ usuarioCliente: username })
            .sort({ fecha: -1 });

        // Check and update expired reservations
        const now = new Date();
        const reservasActualizadas = await Promise.all(
            reservas.map(async (reserva) => {
                // Check if seña has expired (only for 'Solicitada' state)
                if (reserva.sena.estado === 'Solicitada' &&
                    reserva.sena.fechaVencimiento &&
                    now > reserva.sena.fechaVencimiento) {
                    // Mark as expired
                    reserva.sena.estado = 'Vencida';
                    reserva.estado = 'Vencida';
                    await reserva.save();
                }
                return reserva;
            })
        );

        // Fetch device details from productos microservice
        const productosUrl = process.env.PRODUCTOSMS_URL || 'http://msProductos:3001/';

        const reservasConEquipos = await Promise.all(
            reservasActualizadas.map(async (reserva) => {
                try {
                    const response = await fetch(`${productosUrl}api/equipos/equipo/${reserva.equipo}`);
                    if (response.ok) {
                        const equipo = await response.json();
                        return {
                            ...reserva.toObject(),
                            equipo: equipo
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching equipo ${reserva.equipo}:`, error);
                }
                // If fetch fails, return with just the ID
                return reserva.toObject();
            })
        );

        res.status(200).json({
            success: true,
            data: reservasConEquipos
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Cancel a reservation
 * POST /api/v1/reservas/cancelar/:id
 */
async function cancelarReserva(req, res, next) {
    try {
        const { id } = req.params;
        const { motivoCancelacion } = req.body;

        const reserva = await Reserva.findById(id);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Check if user owns this reservation (for viewers)
        if (req.user.role === 'viewer' && reserva.usuarioCliente !== req.user.username) {
            return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
        }

        // Can only cancel if in Solicitada or Confirmada state
        if (reserva.estado !== 'Solicitada' && reserva.estado !== 'Confirmada') {
            return res.status(400).json({
                message: `No se puede cancelar una reserva en estado ${reserva.estado}`
            });
        }

        reserva.estado = 'Cancelada';
        reserva.motivoCancelacion = motivoCancelacion || 'Sin especificar';
        await reserva.save();

        res.status(200).json({
            message: 'Reserva cancelada exitosamente',
            data: reserva
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
    getReservas,
    calcularSena,
    getReservedDevices,
    getMisReservas,
    cancelarReserva
};