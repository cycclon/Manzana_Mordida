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
router.post("/register", registerViewer);
router.post("/register-admin", firstAdmin); // Only to be used when creating the database/server

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth, Login]
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

// Protected: only admin can register staff
router.post(
    "/register-staff",
    authMiddleware,
    roleMiddleware(['admin']),
    registerStaff
);

// Token validation endpoint (can be called by other microservices)
router.get("/validate", validateToken);

// Refresh and logout endpoints
router.post("/refresh", refreshToken);
router.post("/logout", logout);

module.exports = router;