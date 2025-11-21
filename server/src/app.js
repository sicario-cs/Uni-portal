const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize URLs - fixes issue with trailing newlines (%0A) in URLs
app.use((req, res, next) => {
  try {
    let cleanUrl = decodeURIComponent(req.originalUrl);
    cleanUrl = cleanUrl.trim().replace(/[\r\n\s]+$/, '');
    req.url = cleanUrl;
    req.path = cleanUrl.split('?')[0];
  } catch (e) {
    req.url = req.url.trim().replace(/[\r\n\s]+$/, '');
    req.path = req.path.trim().replace(/[\r\n\s]+$/, '');
  }
  next();
});

const authRoutes = require("./routes/auth.routes");

// Use routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Hello World");
});



module.exports = app;