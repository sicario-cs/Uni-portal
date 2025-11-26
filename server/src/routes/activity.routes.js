const router = require("express").Router();
const activityService = require("../services/activity.service");

router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const data = await activityService.getStudentActivity(studentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activity", error: err });
  }
});

module.exports = router;
