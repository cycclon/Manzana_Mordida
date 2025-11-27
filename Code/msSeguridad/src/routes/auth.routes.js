/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Authentication endpoints
 */
const express = require('express');
const {
    login, 
    validateToken, 
    refreshToken, 
    logout } = require('../controllers/auth.controller');

    const router = express.Router();

// PUBLIC
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       "200":
 *         description: Login successful. Returns user data and tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID
 *                       example: 6898ef9d6e5f03a7f4497c7b
 *                     username:
 *                       type: string
 *                       description: Username
 *                       example: admin
 *                     role:
 *                       type: string
 *                       description: User role
 *                       example: admin
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODk4ZWY5ZDZlNWYwM2E3ZjQ0OTdjN2IiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU1MzUzNTc1LCJleHAiOjE3NTUzNTQ0NzV9.DjraMhOtSJJcVkwtDyWqMhb6lB5W5emVL3lgYuTJcKg
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token (also sent as httpOnly cookie)
 *                   example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

// TOKEN REQUIRED
/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validate access token
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
 *                   enum: [false]
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */
router.get("/validate", validateToken);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refreshes JWT
 *     description: Uses a previously created refresh token to refresh the user JWT. It also revokes the old refresh token and creates a new one.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed. Returns user data and new tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID
 *                       example: 6898ef9d6e5f03a7f4497c7b
 *                     username:
 *                       type: string
 *                       description: Username
 *                       example: admin
 *                     role:
 *                       type: string
 *                       description: User role
 *                       example: admin
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token (also sent as httpOnly cookie)
 *                   example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 *       401:
 *         description: Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid refresh token
 */
router.post("/refresh", refreshToken);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
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