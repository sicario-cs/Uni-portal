const express = require("express");
const router = express.Router();
const graphController = require("../controllers/graph.controller");

// GET: All courses of a student
router.get("/student/:studentId/courses", graphController.getCoursesOfStudent);

// GET: All courses taught by instructor
router.get("/instructor/:instructorId/courses", graphController.getCoursesOfInstructor);

// GET: All students in a course
router.get("/course/:courseId/students", graphController.getStudentsInCourse);

module.exports = router;
