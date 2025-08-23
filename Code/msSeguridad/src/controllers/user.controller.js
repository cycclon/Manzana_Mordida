const User = require("../models/user.model");
const { hashPassword } = require('../utils/password');

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

        res.status(201).json({ message: 'Usuario registrado correctamente' });
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

// Only used to setup the microservice when first deployed
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

async function viewerExists(req, res, next) {
    try {
        const { username } = req.body;
        const usuario = await User.findOne({ username: username });
        //console.log(req.body, usuario);
        const flag = usuario && usuario.role === 'viewer';

        return res.status(200).json({ exists: flag });
    } catch (error) {
        next(error);
    }
}

module.exports = { registerViewer, registerStaff, firstAdmin, viewerExists };