const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config(),
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use("/auth", require('./routes/auth.routes'));

app.get("/", (req, res) => res.send("Security service is running"));

app.use(errorHandler);

module.exports = app;