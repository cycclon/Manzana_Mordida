/**
 * @swagger
 * tags:
 *  name: Users
 *  description: Authentication endpoints
 */
const express = require('express');
const { registerViewer, registerStaff, firstAdmin, viewerExists } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const router = express.Router();

// PUBLIC
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user of type viewer
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Viewer successfully created
 */
router.post("/register", registerViewer);
/**
 * @swagger
 * /users/register-admin:
 *   post:
 *     summary: Register the first admin. Only use when setup MS
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Admin successfully created
 */
router.post("/register-admin", firstAdmin); // Only to be used when creating the database/server
/**
 * @swagger
 * /users/viewer-exists:
 *   post:
 *     summary: Checks if a username exsists in the DataBase and if it's of role 'viewer'
 *     tags: [Users]
 *     requestBody:
 *       description: Username to check
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                  type: string
 *                  example: johndoe
 *     responses:
 *       201:
 *         description: '{ exists: true/false }'
 */
router.post("/viewer-exists", viewerExists);

// TOKEN REQUIRED
/**
 * @swagger
 * /users/register-staff:
 *   post:
 *     summary: Register a new user of type admin or sales
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffRequest'
 *     responses:
 *       201:
 *         description: Staff successful registration
 *       400:
 *         description: Invalid input. Wrong format, or duplicate key (username)
 *       401:
 *         description: Unauthorized. Missing or invalid token
 */
router.post(
    "/register-staff",
    authMiddleware,
    roleMiddleware(['admin']),
    registerStaff
);

module.exports = router;