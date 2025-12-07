/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints de gestión de reservas de equipos
 */

const express = require('express');
const multer = require('multer');
const {
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
} = require('../controllers/reservas.controller');
const { authMiddleware, roleMiddleware} = require('../middleware/securityHandler');
const { reservaPropia, cambiarEstadoReserva, cambiarEstadoSena } = require('../middleware/reservasHandler');

const router = new express.Router();

// Configure multer for memory storage (payment proofs)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs for payment proofs
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes o archivos PDF'));
        }
    },
});

/**
 * @swagger
 * /api/v1/reservas/calcular-sena:
 *   post:
 *     summary: Calcular monto de seña
 *     description: Calcula el monto de la seña (depósito) basado en el porcentaje configurado (por defecto 20% del monto total). Este endpoint no requiere autenticación y puede ser usado para calcular la seña antes de crear una reserva.
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *             properties:
 *               monto:
 *                 type: number
 *                 description: Monto total del producto o servicio
 *                 example: 750
 *     responses:
 *       200:
 *         description: Cálculo exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sena:
 *                   type: number
 *                   description: Monto de la seña calculado (PORCENTAJE_RESERVA * monto, por defecto 20%)
 *                   example: 150
 *             examples:
 *               example1:
 *                 value:
 *                   sena: 150
 *                 summary: Ejemplo con monto de 750 (20% = 150)
 */
router.post('/calcular-sena', calcularSena);

/**
 * @swagger
 * /api/v1/reservas/reserved-devices:
 *   get:
 *     summary: Obtener IDs de dispositivos reservados
 *     description: Retorna un array de IDs de dispositivos que tienen reservas activas (no Cancelada ni Vencida). Este endpoint es público y no requiere autenticación. Se usa para mostrar el estado de reserva en el marketplace.
 *     tags: [Reservas]
 *     responses:
 *       200:
 *         description: Lista de IDs de dispositivos reservados
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
 *                     type: string
 *                   example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 */
router.get('/reserved-devices', getReservedDevices);

// ============================================
// VIEWER ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/v1/reservas/solicitar:
 *   post:
 *     summary: Solicitar reserva
 *     description: Crea una reserva de un equipo usando su ID de productos. El monto de la seña debe ser calculado previamente usando el endpoint /calcular-sena. La fecha de vencimiento se calcula automáticamente (por defecto 7 días). El usuario debe estar autenticado y tener rol de viewer (cliente).
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
 *               - usuarioCliente
 *               - IdEquipo
 *               - montoSena
 *             properties:
 *               usuarioCliente:
 *                 type: string
 *                 description: Nombre de usuario del cliente (debe coincidir con el usuario autenticado)
 *                 example: "cycclon"
 *               IdEquipo:
 *                 type: string
 *                 description: ID del equipo a reservar (ObjectId de la colección productos)
 *                 example: "507f1f77bcf86cd799439011"
 *               montoSena:
 *                 type: number
 *                 description: Monto de la seña a pagar (calculado previamente con /calcular-sena, típicamente 20% del precio)
 *                 example: 150
 *               canje:
 *                 type: object
 *                 description: Información del equipo a canjear (opcional)
 *                 properties:
 *                   linea:
 *                     type: string
 *                     description: Línea del producto a canjear
 *                     example: "iPhone"
 *                   modelo:
 *                     type: string
 *                     description: Modelo del producto a canjear
 *                     example: "12 Pro"
 *                   bateria:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                     description: Estado de la batería del equipo a canjear (0 a 1, donde 1 = 100%)
 *                     example: 0.85
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
 * /api/v1/reservas/mis-reservas:
 *   get:
 *     summary: Obtener mis reservas
 *     description: Obtiene todas las reservas del usuario autenticado (viewer)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
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
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.get('/mis-reservas',
    authMiddleware,
    roleMiddleware(['viewer']),
    getMisReservas
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
 *     description: El cliente paga la seña (20% del precio) de su reserva y sube el comprobante de pago. Solo el dueño de la reserva puede realizar esta acción. Cambia el estado de la seña a 'Pagada'.
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - metodoPago
 *               - comprobante
 *             properties:
 *               metodoPago:
 *                 type: string
 *                 description: Método de pago utilizado
 *                 enum: [Efectivo, Transferencia, Tarjeta de Crédito, Tarjeta de Débito, MercadoPago]
 *                 example: "Transferencia"
 *               comprobante:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del comprobante de pago (imagen o PDF, máximo 5MB)
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
    upload.single('comprobante'),
    cambiarEstadoSena('Pagada'),
    pagarSena
);

/**
 * @swagger
 * /api/v1/reservas/cancelar/{id}:
 *   post:
 *     summary: Cancelar reserva
 *     description: Permite cancelar una reserva en estado Solicitada o Confirmada. Los viewers solo pueden cancelar sus propias reservas. Admin y sales pueden cancelar cualquier reserva.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la reserva a cancelar
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivoCancelacion:
 *                 type: string
 *                 description: Motivo de la cancelación
 *                 example: "Cancelado por el cliente"
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reserva cancelada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: No se puede cancelar una reserva en este estado
 *       403:
 *         description: No tienes permiso para cancelar esta reserva
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
router.post('/cancelar/:id',
    authMiddleware,
    roleMiddleware(['viewer', 'admin', 'sales']),
    cancelarReserva
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