/**
 * @swagger
 * tags:
 *  name: Citas
 *  description: Endpoints de gestión de citas
 */
const express = require('express');
const router = new express.Router();
// MIDDLEWARE
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
const { cambiarEstado, establecerCita } = require('../middleware/cita.middleware');

// CONTROLLER
const { 
    getCitas, 
    getCitasAnonimas,
    getCitasAnonimasRango,
    solicitarCita,
    cancelarCita,
    confirmarCita,
    reprogramarCita
 } = require('../controllers/cita.controller');

//----------------- PUBLIC ROUTES------------------//
/////////////////////////////////////////////////////
/**
 * @swagger
 * /api/v1/citas/anonimas/{fechaDesde}/{fechaHasta}/{sucursal}:
 *   get:
 *     summary: Citas anonimas por rango de fechas y sucursal
 *     description: Devuelve el listado de citas sin especificar cliente, según un rango de fechas y sucursal
 *     tags: [Citas]
 *     parameters:
 *       - $ref: '#/components/parameters/citaFechaDesde'
 *       - $ref: '#/components/parameters/citaFechaHasta'
 *       - $ref: '#/components/parameters/sucursalCita'
 *     responses:
 *       200:
 *         description: Listado de citas anonimas (sin cliente) dentro del rango de fechas y la sucursal seleccionadas en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: [$ref: '#/components/schemas/citaAnonima']         
 *       404:
 *         $ref: '#/components/responses/400'
 */
router.get('/anonimas/:fechaDesde/:fechaHasta/:sucursal', getCitasAnonimasRango);
/**
 * @swagger
 * /api/v1/citas/anonimas/{fecha}/{sucursal}:
 *   get:
 *     summary: Citas anonimas por dia y sucursal
 *     description: Devuelve el listado de citas sin especificar cliente, por día y por sucursal
 *     tags: [Citas]
 *     parameters:
 *       - $ref: '#/components/parameters/citaDia'
 *       - $ref: '#/components/parameters/sucursalCita'
 *     responses:
 *       200:
 *         description: Listado de citas anonimas (sin cliente) para la fecha y la sucursal seleccionadas en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: [$ref: '#/components/schemas/citaAnonima']         
 *       404:
 *         $ref: '#/components/responses/400'
 */
router.get('/anonimas/:fecha/:sucursal', getCitasAnonimas);
/**
 * @swagger
 * /api/v1/citas/cancelar/{idCita}:
 *   post:
 *     summary: Cancelar Cita
 *     description: Cancela una cita pendiente
 *     tags: [Citas]
 *     parameters:
 *       - $ref: '#/components/parameters/CitaIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/cancelarCita'
 *     responses:
 *       201:
 *         description: Cita cancelada correctamente
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post('/cancelar/:id', 
    establecerCita,
    cambiarEstado('Cancelada'), 
    cancelarCita
);
/**
 * @swagger
 * /api/v1/citas/solicitar:
 *   post:
 *     summary: Solicitar Cita
 *     description: Envía una solicitud de cita en una sucursal, con fecha y hora específicas
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/solicitarCita'
 *     responses:
 *       201:
 *         description: Cita registrada correctamente
 *       400:
 *         $ref: '#/components/responses/400'
 */
router.post('/solicitar', solicitarCita);
/**
 * @swagger
 * /api/v1/citas/reprogramar/{idCita}:
 *   post:
 *     summary: Reprogramar Cita
 *     description: Define un nuevo día y horario para una cita. Registra una nueva cita y cambia el estado de la anterior
 *     tags: [Citas]
 *     parameters:
 *       - $ref: '#/components/parameters/CitaIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/reprogramarCita'
 *     responses:
 *       201:
 *         description: Cita reprogramada correctamente
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post('/reprogramar/:id',
    establecerCita,
    cambiarEstado('Reprogramada'), 
    reprogramarCita
);

//------------ ADMIN OR SALES ROUTES---------------//
/////////////////////////////////////////////////////
/**
 * @swagger
 * /api/v1/citas/{fecha}:
 *   get:
 *     summary: Citas por dia
 *     description: Devuelve el listado de citas por fecha
 *     tags: [Citas]
 *     parameters:
 *       - $ref: '#/components/parameters/citaDia'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de citas para el dia indicado en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: [$ref: '#/components/schemas/cita']
 */
router.get('/:fecha', 
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    getCitas
);
/**
 * @swagger
 * /api/v1/citas/confirmar/{idCita}:
 *   post:
 *     summary: Confirmar Cita
 *     description: Confirma una cita pendiente
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CitaIdParam'
 *     responses:
 *       201:
 *         description: Cita confirmada correctamente
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post('/confirmar/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    establecerCita,
    cambiarEstado('Confirmada'), 
    confirmarCita
);

module.exports = router;