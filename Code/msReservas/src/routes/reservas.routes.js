const express = require('express');
const { 
    solicitarReserva,
    pagarSena,
    getReserva,
    confirmarReserva,
    completarReserva,
    getReservas  } = require('../controllers/reservas.controller');
const { authMiddleware, roleMiddleware} = require('../middleware/securityHandler');
const { reservaPropia } = require('../middleware/reservasHandler');

const router = new express.Router();

// VIEWER
router.post('/solicitar', 
    authMiddleware,
    roleMiddleware(['viewer']),
    solicitarReserva
);

router.post('/pagarsena/:idReserva', 
    authMiddleware,
    roleMiddleware(['viewer']),
    reservaPropia,
    pagarSena
);

router.get('/:id',
    authMiddleware,
    roleMiddleware(['viewer']),
    getReserva
);

// ADMIN OR SALES
router.post('/confirmar/:id', 
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    confirmarReserva
);

router.post('/completar',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    completarReserva
);

router.get('/',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    getReservas
);

module.exports = router;