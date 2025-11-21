const Enrollment = require("../models/enrollment.model");


exports.createEnrollment = async (req, res, next) => {
  try {
    const { studentId, courseId, semester } = req.body;

    if (!studentId || !courseId || !semester) {
      return res
        .status(400)
        .json({ message: "studentId, courseId, semester are required" });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      semester,
    });

    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "already enrolled in this course in this semester" });
    }
    next(err);
  }
};

exports.getEnrollmentsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    const filter = { studentId };
    if (semester) filter.semester = semester;

    const enrollments = await Enrollment.find(filter)
      .populate("courseId") 
      .sort({ semester: 1 });

    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};


exports.getEnrollmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { semester } = req.query;

    const filter = { courseId };
    if (semester) filter.semester = semester;

    const enrollments = await Enrollment.find(filter)
      .populate("studentId") 
      .sort({ semester: 1 });

    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};


exports.updateFinalGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { letter, numeric } = req.body;

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      { finalGrade: { letter, numeric } },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json(enrollment);
  } catch (err) {
    next(err);
  }
};