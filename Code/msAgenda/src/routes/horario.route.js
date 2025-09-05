/**
 * @swagger
 * tags:
 *  name: Horarios
 *  description: Endpoints de gestión de horarios
 */
const express = require('express');
const router = new express.Router();
const { addHorario, 
        addHorarios, 
        deleteHorario } = require('../controllers/horario.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
const { detectarSuperposicionSimple, detectarSuperposicionMultiple } = require('../middleware/horario.middleware');

// ADMIN OR SALES 
/**
 * @swagger
 * /api/v1/horarios/nuevo-horario:
 *   post:
 *     summary: Registrar horario
 *     description: Registra un nuevo horario en la base de datos
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/nuevoHorario'
 *     responses:
 *       "201":
 *         description: Horario registrado correctamente.
 *       "400":
 *         $ref: '#/components/responses/400'
 *       "401":
 *         $ref: '#/components/responses/401'         
 */
router.post('/nuevo-horario', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']), 
    detectarSuperposicionSimple, 
    addHorario
);
/**
 * @swagger
 * /api/v1/horarios/nuevos-horarios:
 *   post:
 *     summary: Registra varios horarios
 *     description: Registra varios horarios en distintos días de la semana
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/nuevosHorarios'
 *     responses:
 *       "201":
 *         description: Horarios registrados correctamente.
 *       "400":
 *         $ref: '#/components/responses/400'
 *       "401":
 *         $ref: '#/components/responses/401'         
 */
router.post('/nuevos-horarios', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']),
    detectarSuperposicionMultiple,
    addHorarios
);
/**
 * @swagger
 * /api/v1/horarios/{idHorario}:
 *   delete:
 *     summary: Eliminar horario
 *     description: Elimina un horario registrado en la base de datos
 *     tags: [Horarios]
 *     parameters:
 *       - $ref: '#/components/parameters/HorarioIdParam'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Horario eliminado correctamente.
 *       "401":
 *         $ref: '#/components/responses/401'
 *       "404":
 *         $ref: '#/components/responses/404'             
 */
router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']),
    deleteHorario
);

module.exports = router;