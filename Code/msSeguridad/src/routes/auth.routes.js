/**
 * @swagger
 * tags:
 *  name: auth.routes
 *  description: Authentication endpoints
 */
const express = require('express');
const { 
    registerViewer,
    registerStaff,
    firstAdmin,
    login, 
    validateToken, 
    refreshToken, 
    logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = express.Router();

// Public
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user of type viewer
 *     tags: [Auth]
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
 * /auth/register-admin:
 *   post:
 *     summary: Register the first admin. Only use when setup MS
 *     tags: [Auth]
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
 * /auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/register-staff:
 *   post:
 *     summary: Register a new user of type admin or sales
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffRequest'
 *     responses:
 *       200:
 *         description: Staff successful registration
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/register-staff",
    authMiddleware,
    roleMiddleware(['admin']),
    registerStaff
);

/**
 * @swagger
 * /auth/validate-token:
 *   get:
 *     summary: Validate an access token
 *     description: Checks if the provided Bearer token is valid and not expired.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f2b9b9a1234567890abcde
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     role:
 *                       type: string
 *                       example: sales
 *       401:
 *         description: Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */
router.get("/validate", validateToken);

// Refresh and logout endpoints
/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refreshes the JWT
 *     description: Uses a previously created refresh token to refresh the user JWT. It also revokes the old refresh token and creates a new one.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  token:
 *                      type: string
 *                      example: long hex string
 *       401:
 *         description: Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */
router.post("/refresh", refreshToken);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: End the user active session
 *     description: Clears the token and revoke the refresh token for a logged in user.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      example: Logged out
 *       400:
 *         description: No refresh token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No refresh token provided
 */
router.post("/logout", logout);

module.exports = router;