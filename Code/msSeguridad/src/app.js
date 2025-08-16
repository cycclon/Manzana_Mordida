const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const redoc = require('redoc-express');
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

// Redoc route and style
app.get(
  '/redoc',
  redoc({
    title: 'Auth Microservice API Docs',
    specUrl: '/swagger.json', // must match the route above
  })
);

// Expose swagger.json so Redoc can load it
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Routes
app.use("/auth", require('./routes/auth.routes'));
app.use("/users", require('./routes/user.routes'));

app.get("/", (req, res) => res.send("Security service is running"));

app.use(errorHandler);

module.exports = app;