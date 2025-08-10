const express = require('express');
const { registerViewer, registerStaff, firstAdmin, login, validateToken } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');


const router = express.Router();

// Public
router.post("/register", registerViewer);
router.post("/register-admin", firstAdmin); // Only to be used when creating the database/server
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

module.exports = router;