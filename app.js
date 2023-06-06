require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json());

// Setup your Middleware and API Router here
app.use(cors());

const apiRouter = require("./api");

app.use("/api", apiRouter);

app.use((error, req, res, next) => {
  res.send({
    error: error.name,
    name: error.name,
    message: error.message,
  });
});

module.exports = app;
