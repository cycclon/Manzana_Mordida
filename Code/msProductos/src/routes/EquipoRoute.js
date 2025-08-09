const express = require('express');
const router = express.Router();
const EquipoController = require('../controllers/EquipoController');

router.get('/', EquipoController.getEquipos);
router.get('/equipo/:id', EquipoController.getEquipoID);
router.post('/crear-equipo', EquipoController.addEquipo);
router.put('/equipo/:id', EquipoController.editEquipo);
router.delete('/equipo/:id', EquipoController.deleteEquipo);

module.exports = router;