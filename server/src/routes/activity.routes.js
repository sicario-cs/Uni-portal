const router = require("express").Router();
const activityService = require("../services/activity.service");

router.get("/search", async (req, res) => {
  try {
    const {
      studentId,
      action,
      courseId,
      from,
      to,
      limit
    } = req.query;

    const data = await activityService.searchActivity({
      studentId,
      action,
      courseId,
      from,
      to,
      limit: limit ? parseInt(limit) : undefined,
    });

    res.json({
      count: data.length,
      results: data,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      error: err,
    });
  }
});

module.exports = router;
