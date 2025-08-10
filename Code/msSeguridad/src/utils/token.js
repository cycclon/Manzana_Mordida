const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";

function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null; // Invalid or expired token
    }
}

module.exports = { generateToken, verifyToken };