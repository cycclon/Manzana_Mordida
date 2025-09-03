/**
 * @swagger
 * tags:
 *  name: Citas
 *  description: Endpoints de gestión de citas
 */
const express = require('express');
const router = new express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
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

// PUBLIC
router.get('/anonimas/:fechaDesde/:fechaHasta/:sucursal', getCitasAnonimasRango);

router.get('/anonimas/:fecha/:sucursal', getCitasAnonimas);

router.post('/cancelar/:id', cancelarCita);

router.post('/solicitar', solicitarCita);

// ADMIN OR SALES
router.get('/:fecha', 
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    getCitas
);

router.post('/confirmar/:id', confirmarCita);

router.post('/reprogramar/:id', reprogramarCita);

module.exports = router;
