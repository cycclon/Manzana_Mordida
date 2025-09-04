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

router.post('/cancelar/:id', establecerCita, cambiarEstado('Cancelada'), cancelarCita);

router.post('/solicitar', solicitarCita);

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
