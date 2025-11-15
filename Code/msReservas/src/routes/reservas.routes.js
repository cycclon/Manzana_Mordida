const express = require('express');
const { 
    solicitarReserva,
    pagarSena,
    getReserva,
    confirmarReserva,
    completarReserva,
    getReservas } = require('../controllers/reservas.controller');
const { authMiddleware, roleMiddleware} = require('../middleware/securityHandler');
const { reservaPropia, cambiarEstadoReserva, cambiarEstadoSena } = require('../middleware/reservasHandler');

const router = new express.Router();

// VIEWER
router.post('/solicitar', 
    authMiddleware,
    roleMiddleware(['viewer']),
    solicitarReserva
);

router.get('/:id',
    authMiddleware,
    roleMiddleware(['viewer']),
    getReserva
);

router.post('/pagarsena/:idReserva',
    authMiddleware,
    roleMiddleware(['viewer']),
    reservaPropia,
    cambiarEstadoSena('Pagada'),
    pagarSena
);

// ADMIN OR SALES
router.post('/confirmar/:id', 
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    cambiarEstadoSena('Confirmada'),
    cambiarEstadoReserva('Confirmada'),
    confirmarReserva
);

router.post('/completar/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    cambiarEstadoReserva('Completada'),
    completarReserva
);

router.get('/',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    getReservas
);

module.exports = router;