const User = require("../models/user.model");
const RefreshToken = require('../models/refreshToken.model');
const { comparePassword } = require('../utils/password');
const { generateToken, verifyToken, createAndSaveRefreshToken } = require('../utils/token');

// Login
async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(401).json({ message: 'Credenciales inválidas'});
        }

        // Compare passsword
        const isMatch = await comparePassword(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas'});
        }

        // Generate JWT
        const token = generateToken({
            sub: user._id,
            username: user.username,
            role: user.role
        });

        // Create refresh token and persist it
        const userAgent = req.get("User-Agent") || "";
        const rtDoc = await createAndSaveRefreshToken(user._id, userAgent);

        // Set refresh token as httpOnly cookie and send access token in body
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 1000 * 60 * 60 * 24 * (process.env.REFRESH_TOKEN_EXPIRY_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) : 7)
        };

        res.cookie("refreshToken", rtDoc.token, cookieOptions);

        // Return user data along with tokens
        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            },
            accessToken: token,
            refreshToken: rtDoc.token
        });
    } catch (error) {
        next(error);
    }
}

// Validate token from other microservices or the front end
async function validateToken(req, res, next) {
    try {
        
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ valid: false, message: "No token provided."})
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if(!decoded) {
            return res.status(401).json({ valid: false, message: 'Invalid or expired token'});
        }

        return res.json({
            valid: true,
            user: {
                id: decoded.sub,
                username: decoded.username,
                role: decoded.role
            }
        })
    } catch (error) {
        next(error);
    }
}

async function refreshToken(req, res, next) {
    try {
        // read refresh token from cookie or body
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if(!refreshToken) {
            return res.status(401).json({message: "No refresh token provided"});
        }

        // find token in DB
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken }).populate("user");
        if(!tokenDoc || tokenDoc.revoked) {
            return res.status(401).json({message: "Invalid refresh token"});
        }

        const user = tokenDoc.user;
        if(!user) return res.status(401).json({ message: "Invalid refresh token (no user)"});

        // rotation: create new refresh token and revoke old one
        const userAgent = req.get("User-Agent") || "";
        const newRt = await createAndSaveRefreshToken(user._id, userAgent);

        tokenDoc.revoked = true;
        tokenDoc.replacedByToken = newRt.token;
        await tokenDoc.save();

        // issue new access token
        const newAccessToken = generateToken({
            sub: user._id,
            username: user.username,
            role: user.role
        });

        // set cookie or send token in body (match your login strategy)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 1000 * 60 * 60 * 24 * (process.env.REFRESH_TOKEN_EXPIRY_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) : 7)
        };

        res.cookie("refreshToken", newRt.token, cookieOptions);
        return res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            },
            accessToken: newAccessToken,
            refreshToken: newRt.token
        });
    } catch (error) {
        next(error);
    }    
}

async function logout(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if(!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided"});
        }

        const tokenDoc = await RefreshToken.findOne({ token: refreshToken })
        if(tokenDoc) {
            tokenDoc.revoked = true;
            await tokenDoc.save();
        }

        // remove cookie
        res.clearCookie("RefreshToken", { httpOnly: true, secure: process.env.COOKIE_SECURE === "true", sameSite: "Strict" });
        return res.json({ message: 'Logged out' });
    } catch (error) {
        next(error);
    }
}

module.exports = { login, validateToken, refreshToken, logout };