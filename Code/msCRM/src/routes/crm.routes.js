const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
const {
    addCRM,
    editCRM,
    cambiarEstado,
    cambiarEstadoMultiple,
    toggleRequiereHumano,
    getCRMCliente,
    getCRMEstado,
    getCRMId,
    getAllCRMs,
    getEstadisticas,
    getOpciones,
    deleteCRM
} = require('../controllers/crm.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: CRM
 *     description: Gestión de leads y clientes del CRM
 *   - name: Opciones
 *     description: Endpoints públicos para obtener opciones de dropdowns
 *   - name: Estadísticas
 *     description: Estadísticas y métricas del CRM
 */

// ============================================
// ENDPOINTS PÚBLICOS
// ============================================

/**
 * @swagger
 * /api/v1/crm/opciones:
 *   get:
 *     summary: Obtener opciones para dropdowns
 *     description: Retorna los estados del CRM y las redes sociales disponibles para usar en formularios
 *     tags: [Opciones]
 *     responses:
 *       200:
 *         description: Opciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opciones'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/opciones', getOpciones);

// All other routes require authentication
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'sales']));

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * @swagger
 * /api/v1/crm/estadisticas:
 *   get:
 *     summary: Obtener estadísticas del CRM
 *     description: Retorna estadísticas agregadas de los leads (total, por estado, por red social, etc.)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fechaDesde
 *         in: query
 *         required: false
 *         description: Fecha inicial para filtrar estadísticas (formato YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-01-01'
 *       - name: fechaHasta
 *         in: query
 *         required: false
 *         description: Fecha final para filtrar estadísticas (formato YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-12-31'
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estadisticas'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/estadisticas', getEstadisticas);

// ============================================
// CREAR CRM
// ============================================

/**
 * @swagger
 * /api/v1/crm:
 *   post:
 *     summary: Crear nuevo lead/cliente
 *     description: Crea un nuevo registro en el CRM. El usuario + red social debe ser único.
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CRMCreate'
 *     responses:
 *       201:
 *         description: Lead creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Lead creado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/CRM'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       409:
 *         $ref: '#/components/responses/409'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.post('/', addCRM);

// ============================================
// CAMBIO DE ESTADO MÚLTIPLE
// ============================================

/**
 * @swagger
 * /api/v1/crm/estado-multiple:
 *   put:
 *     summary: Cambiar estado de múltiples leads
 *     description: Permite cambiar el estado de varios leads a la vez. Útil para operaciones masivas.
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambioEstadoMultiple'
 *     responses:
 *       200:
 *         description: Estados actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '5 leads actualizados exitosamente'
 *                 actualizados:
 *                   type: integer
 *                   example: 5
 *                 fallidos:
 *                   type: integer
 *                   example: 0
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.put('/estado-multiple', cambiarEstadoMultiple);

// ============================================
// CAMBIO DE ESTADO INDIVIDUAL
// ============================================

/**
 * @swagger
 * /api/v1/crm/{idcrm}/estado/{nuevoestado}:
 *   put:
 *     summary: Cambiar estado de un lead
 *     description: Cambia el estado de un lead específico y registra el cambio en el historial
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CRMIdParam'
 *       - $ref: '#/components/parameters/NuevoEstadoParam'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambioEstado'
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Estado actualizado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/CRM'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.put('/:idcrm/estado/:nuevoestado', cambiarEstado);

// ============================================
// TOGGLE REQUIERE HUMANO
// ============================================

/**
 * @swagger
 * /api/v1/crm/{idcrm}/requiere-humano:
 *   put:
 *     summary: Cambiar bandera "requiere humano"
 *     description: Activa o desactiva la bandera que indica si un lead requiere atención humana (no puede ser manejado por bot)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CRMIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleRequiereHumano'
 *     responses:
 *       200:
 *         description: Bandera actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Bandera "requiere humano" actualizada'
 *                 data:
 *                   $ref: '#/components/schemas/CRM'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.put('/:idcrm/requiere-humano', toggleRequiereHumano);

// ============================================
// EDITAR CRM
// ============================================

/**
 * @swagger
 * /api/v1/crm/{idcrm}:
 *   put:
 *     summary: Editar datos de un lead
 *     description: Actualiza la información de contacto y notas de un lead existente. No permite cambiar usuario ni red social.
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CRMIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CRMUpdate'
 *     responses:
 *       200:
 *         description: Lead actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Lead actualizado exitosamente'
 *                 data:
 *                   $ref: '#/components/schemas/CRM'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.put('/:idcrm', editCRM);

// ============================================
// ELIMINAR CRM
// ============================================

/**
 * @swagger
 * /api/v1/crm/{idcrm}:
 *   delete:
 *     summary: Eliminar un lead
 *     description: Elimina permanentemente un registro del CRM. Esta acción no se puede deshacer.
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CRMIdParam'
 *     responses:
 *       200:
 *         description: Lead eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Lead eliminado exitosamente'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.delete('/:idcrm', deleteCRM);

// ============================================
// BÚSQUEDA POR USUARIO
// ============================================

/**
 * @swagger
 * /api/v1/crm/cliente/{usuario}:
 *   get:
 *     summary: Buscar leads por nombre de usuario
 *     description: Busca todos los leads que coincidan con el nombre de usuario especificado (búsqueda parcial, case-insensitive)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UsuarioParam'
 *     responses:
 *       200:
 *         description: Búsqueda realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CRM'
 *                 total:
 *                   type: integer
 *                   example: 3
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/cliente/:usuario', getCRMCliente);

// ============================================
// FILTRAR POR ESTADO
// ============================================

/**
 * @swagger
 * /api/v1/crm/estado/{estado}:
 *   get:
 *     summary: Obtener leads por estado
 *     description: Retorna todos los leads que se encuentran en un estado específico del embudo de ventas
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EstadoParam'
 *     responses:
 *       200:
 *         description: Leads obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CRM'
 *                 total:
 *                   type: integer
 *                   example: 25
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/estado/:estado', getCRMEstado);

// ============================================
// OBTENER CRM POR ID
// ============================================

/**
 * @swagger
 * /api/v1/crm/{idcrm}:
 *   get:
 *     summary: Obtener un lead por ID
 *     description: Retorna la información completa de un lead específico, incluyendo su historial de estados
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CRMIdParam'
 *     responses:
 *       200:
 *         description: Lead obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CRM'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/:idcrm', getCRMId);

// ============================================
// LISTAR TODOS LOS CRMs (CON FILTROS Y PAGINACIÓN)
// ============================================

/**
 * @swagger
 * /api/v1/crm:
 *   get:
 *     summary: Listar todos los leads
 *     description: Retorna una lista paginada de leads con opciones de filtrado y ordenamiento
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - $ref: '#/components/parameters/FilterUsuarioParam'
 *       - $ref: '#/components/parameters/FilterEstadoParam'
 *       - $ref: '#/components/parameters/FilterRedSocialParam'
 *       - $ref: '#/components/parameters/FilterRequiereHumanoParam'
 *     responses:
 *       200:
 *         description: Lista de leads obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CRMPaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.get('/', getAllCRMs);

module.exports = router;
