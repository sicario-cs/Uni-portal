const express = require("express");
const router = express.Router();

const courseController = require("../controllers/course.controller");


router.get("/", courseController.getAllCourses);
router.get("/:code", courseController.getCourseByCode);
router.post("/", courseController.createCourse);

module.exports = router;