const User = require("../models/user.model");
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, verifyToken } = require('../utils/token');

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
        if(!username || !password ) {
            return res.status(400).json({ message: "Se requiere nombre de usuario y contraseña."});
        }

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

module.exports = { registerViewer, registerStaff, firstAdmin, login, validateToken };