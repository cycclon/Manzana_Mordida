const express = require('express');
const router = express.Router();
const EquipoController = require('../controllers/EquipoController');
const idValidator = require('../middleware/EquipoIdValidator');
const {authMiddleware, roleMiddleware} = require('../middleware/securityHandler');

// PUBLICO
router.get('/', EquipoController.getEquipos);
router.get('/equipo/:id', idValidator, EquipoController.getEquipoID);

// JWT ADMIN O SALES
router.post('/crear-equipo', authMiddleware, roleMiddleware(['admin', 'sales']), EquipoController.addEquipo);
router.put('/equipo/:id', authMiddleware, roleMiddleware(['admin', 'sales']), idValidator, EquipoController.editEquipo);
router.delete('/equipo/:id', authMiddleware, roleMiddleware(['admin', 'sales']), idValidator, EquipoController.deleteEquipo);

module.exports = router;