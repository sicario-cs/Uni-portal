const express = require("express");
const router = express.Router();

const gradeController = require("../controllers/grade.controller");


router.post("/", gradeController.createGrade);


router.get(
  "/student/:studentId",
  gradeController.getGradesByStudent
);

router.get(
  "/course/:courseId",
  gradeController.getGradesByCourse
);

router.post(
  "/:enrollmentId/recalculate",
  gradeController.recalculateEnrollmentGrade
);

module.exports = router;
