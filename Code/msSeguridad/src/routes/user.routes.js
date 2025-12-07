/**
 * @swagger
 * tags:
 *  name: Users
 *  description: Authentication endpoints
 */
const express = require('express');
const { registerViewer, registerStaff, firstAdmin, viewerExists, getAllUsers } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const router = express.Router();

// PUBLIC
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Create viewer (user)
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
 *     summary: Create first admin (user)
 *     description: Only use when setting up the database.
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
 *     summary: Check username existence (viewer)'
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
 *     summary: Create user (admin or sales)
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

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   role:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/",
    authMiddleware,
    roleMiddleware(['admin']),
    getAllUsers
);

module.exports = router;