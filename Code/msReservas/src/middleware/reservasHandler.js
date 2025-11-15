const Reserva = require('../schemas/reserva.model');

/**
 * Middleware para verificar que la reserva pertenezca al usuario autenticado
 * Similar al checkSelfRequest de msClientes
 */
async function reservaPropia(req, res, next) {
    try {
        const idReserva = req.params.idReserva || req.params.id;
        
        if (!idReserva) {
            return res.status(400).json({
                success: false,
                message: 'ID de reserva requerido'
            });
        }

        const reserva = await Reserva.findById(idReserva);
        
        if (!reserva) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Verificar que el usuario sea el dueño de la reserva
        // Comparar con username y email para mayor flexibilidad
        const esPropia = reserva.cliente.nombreUsuario === req.user.username || 
                       reserva.cliente.email === req.user.email;
        
        if (!esPropia) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción en esta reserva'
            });
        }

        // Adjuntar la reserva al request para evitar consultarla nuevamente en el controller
        req.reserva = reserva;
        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Middleware factory para cambiar el estado de una reserva
 * Valida que el cambio de estado sea válido según el flujo de negocio
 * @param {string} nuevoEstado - El nuevo estado: 'Solicitada', 'Confirmada', 'Completada', 'Cancelada', 'Vencida'
 */
function cambiarEstadoReserva(nuevoEstado) {
    return async (req, res, next) => {
        try {
            const idReserva = req.params.id || req.params.idReserva;
            
            if (!idReserva) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reserva requerido'
                });
            }

            // Reutilizar la reserva si ya fue cargada por otro middleware
            const reserva = req.reserva || await Reserva.findById(idReserva);
            
            if (!reserva) {
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada'
                });
            }

            const estadoActual = reserva.estado;

            // Validar transiciones de estado permitidas
            const transicionesValidas = {
                'Solicitada': ['Confirmada', 'Cancelada', 'Vencida'],
                'Confirmada': ['Completada', 'Cancelada', 'Vencida'],
                'Completada': [], // Estado final, no se puede cambiar
                'Cancelada': [], // Estado final, no se puede cambiar
                'Vencida': [] // Estado final, no se puede cambiar
            };

            // Verificar si la transición es válida
            if (!transicionesValidas[estadoActual]) {
                return res.status(400).json({
                    success: false,
                    message: `Estado actual '${estadoActual}' no reconocido`
                });
            }

            if (!transicionesValidas[estadoActual].includes(nuevoEstado)) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede cambiar el estado de '${estadoActual}' a '${nuevoEstado}'`
                });
            }

            // Cambiar el estado (no guardamos aquí, lo hace el controller)
            reserva.estado = nuevoEstado;
            
            // Adjuntar la reserva modificada al request
            req.reserva = reserva;
            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Middleware factory para cambiar el estado de la seña
 * @param {string} nuevoEstado - El nuevo estado: 'Solicitada', 'Pagada', 'Confirmada', 'Vencida'
 */
function cambiarEstadoSena(nuevoEstado) {
    return async (req, res, next) => {
        try {
            const idReserva = req.params.id || req.params.idReserva;
            
            if (!idReserva) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reserva requerido'
                });
            }

            // Reutilizar la reserva si ya fue cargada por otro middleware
            const reserva = req.reserva || await Reserva.findById(idReserva);
            
            if (!reserva) {
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada'
                });
            }

            const estadoActualSena = reserva.sena.estado;

            // Validar transiciones de estado permitidas para la seña
            const transicionesValidas = {
                'Solicitada': ['Pagada', 'Vencida'],
                'Pagada': ['Confirmada', 'Vencida'],
                'Confirmada': [], // Estado final, no se puede cambiar
                'Vencida': [] // Estado final, no se puede cambiar
            };

            // Verificar si la transición es válida
            if (!transicionesValidas[estadoActualSena]) {
                return res.status(400).json({
                    success: false,
                    message: `Estado actual de seña '${estadoActualSena}' no reconocido`
                });
            }

            if (!transicionesValidas[estadoActualSena].includes(nuevoEstado)) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede cambiar el estado de la seña de '${estadoActualSena}' a '${nuevoEstado}'`
                });
            }

            // Cambiar el estado de la seña (no guardamos aquí, lo hace el controller)
            reserva.sena.estado = nuevoEstado;
            
            // Adjuntar la reserva modificada al request
            req.reserva = reserva;
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { reservaPropia, cambiarEstadoReserva, cambiarEstadoSena };