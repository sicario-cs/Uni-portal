
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");


router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.get("/by-user/:userId", studentController.getStudentByUser);
router.patch("/:id", studentController.updateStudent);


router.get("/:id/enrollments", studentController.getStudentEnrollments);
router.get("/:id/grades", studentController.getStudentGrades);

module.exports = router;
