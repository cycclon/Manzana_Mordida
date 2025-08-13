const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');

dotenv.config(),
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/auth", require('./routes/auth.routes'));

app.get("/", (req, res) => res.send("Security service is running"));

app.use(errorHandler);

module.exports = app;