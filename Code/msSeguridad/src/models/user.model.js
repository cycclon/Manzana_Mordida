const mongoose = require('mongoose');

const usernameRegex = /^[a-zA-Z0-9._-]{4,}$/; // letters, numbers, . _ -, min length 4
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/; // min 8, 1 uppercase, 1 number

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [usernameRegex, "Username must be at least 4 characters of letters, numbers, dot, hyphen or underscore."]
    },
    password: {
        type: String,
        required: true,
        match: [passwordRegex, 'Password must be at least 8 characters, with at least one uppercase and one number']
    },
    role: {
        type: String,
        enum: ["admin", "sales", "viewer"],
        default: "viewer"
    }
    
}, { timestamps: true } );

module.exports = mongoose.model("user", userSchema);