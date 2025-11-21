const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/hi", (req, res) => {
  res.send("Hello ahmad");
});

module.exports = app;