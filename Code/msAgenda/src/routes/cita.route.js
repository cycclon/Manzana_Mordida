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
router.get('/anonimas/:fechaDesde/:fechaHasta/:sucursal', getCitasAnonimasRango);

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
router.post('/cancelar/:id', establecerCita, cambiarEstado('Cancelada'), cancelarCita);
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
router.get('/:fecha', 
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    getCitas
);

router.post('/confirmar/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    establecerCita,
    cambiarEstado('Confirmada'), 
    confirmarCita
);

module.exports = router;
