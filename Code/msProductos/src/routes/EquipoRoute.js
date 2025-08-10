const express = require('express');
const router = express.Router();
const EquipoController = require('../controllers/EquipoController');
const idValidator = require('../middleware/EquipoIdValidator');

router.get('/', EquipoController.getEquipos);
router.get('/equipo/:id', idValidator, EquipoController.getEquipoID);
router.post('/crear-equipo', EquipoController.addEquipo);
router.put('/equipo/:id', idValidator, EquipoController.editEquipo);
router.delete('/equipo/:id', idValidator, EquipoController.deleteEquipo);

module.exports = router;