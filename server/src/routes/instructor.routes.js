const express = require("express");
const router = express.Router();

const instructorController = require("../controllers/instructor.controller");

router.post("/", instructorController.createInstructor);
router.get("/", instructorController.getAllInstructors);
router.get("/:id", instructorController.getInstructorById);
router.put("/:id", instructorController.updateInstructor);

module.exports = router;