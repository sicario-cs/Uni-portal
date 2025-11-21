// server/src/routes/college.routes.js
const express = require("express");
const router = express.Router();

const collegeController = require("../controllers/college.controller");


router.post("/", collegeController.createCollege);
router.get("/", collegeController.getAllColleges);
router.get("/:id", collegeController.getCollegeById);
router.patch("/:id", collegeController.updateCollege);
router.delete("/:id", collegeController.deleteCollege);

module.exports = router;
