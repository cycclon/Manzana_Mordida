const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshToken.model');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";
const REFRESH_TOKEN_BYTES = process.env.REFRESH_TOKEN_BYTES ? Number(process.env.REFRESH_TOKEN_BYTES) : 64

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

async function cleanupExpiredTokens(userId){
    const cutoff = new Date(Date.now() - (process.env.REFRESH_TOKEN_EXPIRY_DAYS || 7) * 24 * 60 * 60 * 1000);

    // Delete expired tokens or tokens marked as revoked
    await RefreshToken.deleteMany({
        user: userId,
        $or: [
            { expiresAt: { $lt: new Date() }},
            { revoked: true},
            { createdAt: { $lt: cutoff }}
        ]
    });
}

function generateRefreshTokenString(){
    return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

async function createAndSaveRefreshToken(userId, userAgent = "") {
    await cleanupExpiredTokens(userId);

    const tokenString = generateRefreshTokenString();
    const expiryDays = process.env.REFRESH_TOKEN_EXPIRY_DAYS
        ? Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS)
        : 7;
    const expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const rt = new RefreshToken({
        token: tokenString,
        user: userId,
        userAgent,
        expiresAt: expiryDate
    });
    await rt.save();
    return rt;
}

module.exports = { generateToken, verifyToken, generateRefreshTokenString, createAndSaveRefreshToken, cleanupExpiredTokens };