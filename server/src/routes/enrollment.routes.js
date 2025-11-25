const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");

router.post("/", enrollmentController.createEnrollment);

router.get(
  "/student/:studentId",
  enrollmentController.getEnrollmentsByStudent
);

router.get(
  "/course/:courseId",
  enrollmentController.getEnrollmentsByCourse
);

router.patch("/:id/grade", enrollmentController.updateFinalGrade);

module.exports = router;
