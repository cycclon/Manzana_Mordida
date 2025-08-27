const express = require('express');
const router = new express.Router();
const { addHorario, 
        addHorarios, 
        deleteHorario } = require('../controllers/horario.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
const { detectarSuperposicionSimple, detectarSuperposicionMultiple } = require('../middleware/horario.middleware');

// ADMIN OR SALES
router.post('/nuevo-horario', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']), 
    detectarSuperposicionSimple, 
    addHorario
);

router.post('/nuevos-horarios', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']),
    detectarSuperposicionMultiple,
    addHorarios
);

router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']),
    deleteHorario
);

module.exports = router;