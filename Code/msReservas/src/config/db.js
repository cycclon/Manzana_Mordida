const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB conectado")
    } catch (error) {
        console.log('Error de conexión a MongoDB:', error);
        process.exit(1);
    }
}

module.exports = connectDB;