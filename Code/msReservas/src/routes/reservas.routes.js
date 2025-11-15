/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints de gestión de reservas de equipos
 */

const express = require('express');
const { 
    solicitarReserva,
    pagarSena,
    getReserva,
    confirmarReserva,
    completarReserva,
    getReservas 
} = require('../controllers/reservas.controller');
const { authMiddleware, roleMiddleware} = require('../middleware/securityHandler');
const { reservaPropia, cambiarEstadoReserva, cambiarEstadoSena } = require('../middleware/reservasHandler');

const router = new express.Router();

// ============================================
// VIEWER ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/v1/reservas/solicitar:
 *   post:
 *     summary: Solicitar reserva
 *     description: Crea una reserva de un equipo calculando automáticamente la seña (20% del precio) y la fecha de vencimiento (7 días). El usuario debe estar autenticado y tener rol de viewer (cliente).
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipoId
 *               - sucursal
 *               - precio
 *               - clienteTelefono
 *               - equipo
 *             properties:
 *               equipoId:
 *                 type: string
 *                 description: ID del equipo a reservar
 *                 example: "507f1f77bcf86cd799439011"
 *               sucursal:
 *                 type: string
 *                 description: Sucursal donde se retirará el equipo
 *                 example: "Centro"
 *               precio:
 *                 type: number
 *                 description: Precio total del equipo
 *                 example: 500000
 *               clienteTelefono:
 *                 type: string
 *                 description: Teléfono de contacto del cliente
 *                 example: "3804280591"
 *               clienteEmail:
 *                 type: string
 *                 description: Email del cliente (opcional si está en el token)
 *                 example: "cliente@example.com"
 *               equipo:
 *                 type: object
 *                 description: Información del equipo a reservar
 *                 required:
 *                   - linea
 *                   - modelo
 *                   - color
 *                   - condicion
 *                 properties:
 *                   linea:
 *                     type: string
 *                     example: "iPhone"
 *                   modelo:
 *                     type: string
 *                     example: "14 Pro Max"
 *                   color:
 *                     type: string
 *                     example: "Space Black"
 *                   condicion:
 *                     type: string
 *                     enum: [Nuevo, Usado, Reacondicionado]
 *                     example: "Nuevo"
 *                   bateria:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                     description: Estado de la batería (0 a 1)
 *                     example: 1
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reserva solicitada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.post('/solicitar', 
    authMiddleware,
    roleMiddleware(['viewer']),
    solicitarReserva
);

/**
 * @swagger
 * /api/v1/reservas/{id}:
 *   get:
 *     summary: Reserva por ID
 *     description: Los clientes (viewer) solo pueden ver sus propias reservas. Admin y sales pueden ver cualquier reserva.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ReservaIdParam'
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       403:
 *         description: No tienes permiso para ver esta reserva
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.get('/:id',
    authMiddleware,
    roleMiddleware(['viewer']),
    getReserva
);

/**
 * @swagger
 * /api/v1/reservas/pagarsena/{idReserva}:
 *   post:
 *     summary: Registrar pago seña
 *     description: El cliente paga la seña (20% del precio) de su reserva. Solo el dueño de la reserva puede realizar esta acción. Cambia el estado de la seña a 'Pagada'.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: idReserva
 *         in: path
 *         required: true
 *         description: ID de la reserva
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metodoPago
 *             properties:
 *               metodoPago:
 *                 type: string
 *                 description: Método de pago utilizado
 *                 enum: [Efectivo, Transferencia, Tarjeta de Crédito, Tarjeta de Débito, MercadoPago]
 *                 example: "Transferencia"
 *               comprobante:
 *                 type: string
 *                 description: Número o código de comprobante (opcional)
 *                 example: "TRF-123456789"
 *     responses:
 *       200:
 *         description: Seña pagada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Seña pagada exitosamente. Pendiente de confirmación por el vendedor."
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: La reserva no está en estado correcto o faltan datos
 *       403:
 *         description: No tienes permiso para pagar esta reserva
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.post('/pagarsena/:idReserva',
    authMiddleware,
    roleMiddleware(['viewer']),
    reservaPropia,
    cambiarEstadoSena('Pagada'),
    pagarSena
);

// ============================================
// ADMIN OR SALES ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/v1/reservas/confirmar/{id}:
 *   post:
 *     summary: Confirmar reserva
 *     description: Confirma que la seña fue recibida y la reserva está confirmada. Cambia el estado de la reserva y la seña a 'Confirmada'. Solo admin y sales pueden realizar esta acción.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ReservaIdParam'
 *     responses:
 *       200:
 *         description: Reserva confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reserva confirmada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: La seña debe estar pagada antes de confirmar
 *       403:
 *         description: No tienes permiso para confirmar reservas
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.post('/confirmar/:id', 
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    cambiarEstadoSena('Confirmada'),
    cambiarEstadoReserva('Confirmada'),
    confirmarReserva
);

/**
 * @swagger
 * /api/v1/reservas/completar/{id}:
 *   post:
 *     summary: Completar reserva
 *     description: Marca la reserva como completada cuando el cliente retira el producto y paga el saldo restante. Solo admin y sales pueden realizar esta acción.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ReservaIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pagoFinal
 *               - metodoPago
 *             properties:
 *               pagoFinal:
 *                 type: number
 *                 description: Monto total pagado (incluye la seña)
 *                 example: 500000
 *               metodoPago:
 *                 type: string
 *                 description: Método de pago del saldo final
 *                 enum: [Efectivo, Transferencia, Tarjeta de Crédito, Tarjeta de Débito, MercadoPago]
 *                 example: "Efectivo"
 *     responses:
 *       200:
 *         description: Reserva completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reserva completada exitosamente. Venta registrada."
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *                 venta:
 *                   type: object
 *                   properties:
 *                     montoTotal:
 *                       type: number
 *                       example: 500000
 *                     montoSena:
 *                       type: number
 *                       example: 100000
 *                     montoRestante:
 *                       type: number
 *                       example: 400000
 *                     metodoPago:
 *                       type: string
 *                       example: "Efectivo"
 *       400:
 *         description: La reserva debe estar confirmada o faltan datos
 *       403:
 *         description: No tienes permiso para completar reservas
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.post('/completar/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    cambiarEstadoReserva('Completada'),
    completarReserva
);

/**
 * @swagger
 * /api/v1/reservas:
 *   get:
 *     summary: Listado de reservas
 *     description: Lista todas las reservas con opciones de filtrado por estado, sucursal, cliente y fechas. Incluye paginación.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: estado
 *         in: query
 *         description: Filtrar por estado de la reserva
 *         schema:
 *           type: string
 *           enum: [Solicitada, Confirmada, Completada, Cancelada, Vencida]
 *           example: "Confirmada"
 *       - name: sucursal
 *         in: query
 *         description: Filtrar por sucursal
 *         schema:
 *           type: string
 *           example: "Centro"
 *       - name: cliente
 *         in: query
 *         description: Buscar por nombre de usuario o email del cliente
 *         schema:
 *           type: string
 *           example: "cycclon"
 *       - name: fechaDesde
 *         in: query
 *         description: Filtrar reservas desde esta fecha (formato ISO 8601)
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00.000Z"
 *       - name: fechaHasta
 *         in: query
 *         description: Filtrar reservas hasta esta fecha (formato ISO 8601)
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-12-31T23:59:59.999Z"
 *       - name: page
 *         in: query
 *         description: Número de página para paginación
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Cantidad de resultados por página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *     responses:
 *       200:
 *         description: Listado de reservas obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reserva'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de reservas encontradas
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       description: Página actual
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Resultados por página
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       description: Total de páginas
 *                       example: 5
 *       403:
 *         description: No tienes permiso para ver el listado de reservas
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.get('/',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    getReservas
);

module.exports = router;