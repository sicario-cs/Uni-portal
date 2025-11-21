const mongoose = require("mongoose");

// MongoDB connection
mongoose.connect("mongodb://mongo:27017/university")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

module.exports = mongoose;

