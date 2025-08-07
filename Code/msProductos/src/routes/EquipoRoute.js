const express = require('express');
const router = express.Router();
const EquipoController = require('../controllers/EquipoController');

router.get('/', EquipoController.getEquipos);
router.post('/crear-equipo', EquipoController.addEquipo);

module.exports = router;