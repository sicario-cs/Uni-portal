const mongoose = require("mongoose");

const uri = "mongodb://mongo_db:27017,mongo2:27017,mongo3:27017/university?replicaSet=rs0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

module.exports = mongoose;
