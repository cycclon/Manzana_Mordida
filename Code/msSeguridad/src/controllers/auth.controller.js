const User = require("../models/user.model");
const RefreshToken = require('../models/refreshToken.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, verifyToken, createAndSaveRefreshToken } = require('../utils/token');

// Public registration (viewer only)
async function registerViewer(req, res, next) {
    try {
        const { username, password } = req.body;

        // Hash password
        const hashed = await hashPassword(password);

         // Save user
        const newUser = new User({
            username,
            password: hashed,
            role: 'viewer'
        });

        await newUser.save();

        res.status(201).json({message: 'Usuario registrado correctamente'});
    } catch (error) {
        next(error);
    }
}

// Admin creates staff (admin or sales)
async function registerStaff(req, res, next) {
    try {
        const { username, password, role } = req.body;

        if(!['admin', 'sales'].includes(role)){
            return res.status(400).json({ message: "Invalid role for staff registration."});
        }

        // Hash password
        const hashed = await hashPassword(password);

        const newUser = new User({
            username,
            password: hashed,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "Staff registrado correctamente" });
    } catch (error) {
        next(error);
    }
}

async function firstAdmin(req, res, next) {
    try {
        const { username, password } = req.body;

        // Hash password
        const hashed = await hashPassword(password);

        const newAdmin = new User({
            username,
            password: hashed,
            role: 'admin'
        });

        newAdmin.save();

        res.status(201).json({ message: "Administrador registrado correctamente" });
    } catch (error) {
        next(error);
    }
}


// Login
async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        // Basic Validation
        // if(!username || !password ) {
        //     return res.status(400).json({ message: "Se requiere nombre de usuario y contraseña."});
        // }

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

        res.json({ token });
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
        return res.json({ token: newAccessToken });
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

module.exports = { registerViewer, registerStaff, firstAdmin, login, validateToken, refreshToken, logout };