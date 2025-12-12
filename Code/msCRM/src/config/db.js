const mongoose = require('mongoose');
const CRM = require('../schemas/crm.model');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB conectado")

        await CRM.init();
        console.log("Indices creado");
    } catch (error) {
        console.log('Error de conexión a MongoDB:', error);
        process.exit(1);
    }
}

module.exports = connectDB;