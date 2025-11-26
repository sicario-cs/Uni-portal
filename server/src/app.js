const express = require("express");
require("./config/db.redis");
const session = require("express-session");
const RedisStore = require("connect-redis").RedisStore;
const redisClient = require("./config/redisClient");
require("./config/db.neo4j");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
});

app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

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
const gradeRoutes = require("./routes/grade.routes");
const graphRoutes = require("./routes/graph.routes");
const courseRoutes = require("./routes/courses.routes")
const activityRoutes = require("./routes/activity.routes");
const collegeRoutes = require("./routes/college.routes");
const studentRoutes = require("./routes/student.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const instructorRoutes = require("./routes/instructor.routes");
const departmentRoutes = require("./routes/department.routes");
// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/departments", departmentRoutes);


app.get("/", (req, res) => {
  res.send("Hello World");
});


app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    message,
  });
});

module.exports = app;