const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/department.controller");


router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);


router.get(
  "/by-college/:collegeId",
  departmentController.getDepartmentsByCollege
);

router.patch("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
