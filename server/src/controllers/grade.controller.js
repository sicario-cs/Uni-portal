const Grade = require("../models/grade.model");
const Enrollment = require("../models/enrollment.model");


function toLetterGrade(numeric) {
  if (numeric == null) return null;
  if (numeric >= 90) return "A";
  if (numeric >= 85) return "A-";
  if (numeric >= 80) return "B+";
  if (numeric >= 75) return "B";
  if (numeric >= 70) return "C+";
  if (numeric >= 65) return "C";
  if (numeric >= 60) return "D";
  return "F";
}

exports.createGrade = async (req, res, next) => {
  try {
    let {
      enrollmentId,
      studentId,
      courseId,
      term,
      assessmentType,
      title,
      points,
      maxPoints,
      submittedBy,
    } = req.body;

    if (
      !enrollmentId ||
      !studentId ||
      !courseId ||
      !term ||
      !assessmentType ||
      !title
    ) {
      return res
        .status(400)
        .json({ message: "Required data is missing in the request" });
    }

    const grade = await Grade.create({
      enrollmentId,
      studentId,
      courseId,
      term,
      assessmentType,
      title,
      points,
      maxPoints,
      submittedBy,
    });

    res.status(201).json(grade);
  } catch (err) {
    next(err);
  }
};

exports.getGradesByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, courseId } = req.query;

    const filter = { studentId };
    if (term) filter.term = term;
    if (courseId) filter.courseId = courseId;

    const grades = await Grade.find(filter)
      .sort({ term: 1, courseId: 1, submittedAt: 1 })
      .populate("courseId")
      .populate("submittedBy");

    res.json(grades);
  } catch (err) {
    next(err);
  }
};

exports.getGradesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { term, assessmentType } = req.query;

    const filter = { courseId };
    if (term) filter.term = term;
    if (assessmentType) filter.assessmentType = assessmentType;

    const grades = await Grade.find(filter)
      .sort({ term: 1, submittedAt: 1 })
      .populate("studentId")
      .populate("submittedBy");

    res.json(grades);
  } catch (err) {
    next(err);
  }
};

exports.recalculateEnrollmentGrade = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;


    const grades = await Grade.find({ enrollmentId });

    if (!grades.length) {
      return res
        .status(404)
        .json({ message: "No grades found for this enrollment" });
    }

    
    let totalPoints = 0;
    let totalMaxPoints = 0;

    grades.forEach((g) => {
      if (g.points != null && g.maxPoints != null) {
        totalPoints += g.points;
        totalMaxPoints += g.maxPoints;
      }
    });

    const numeric =
      totalMaxPoints > 0 ? Math.round((totalPoints / totalMaxPoints) * 100) : 0;
    const letter = toLetterGrade(numeric);

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        finalGrade: { letter, numeric },
        stats: { totalPoints, maxPoints: totalMaxPoints },
      },
      { new: true }
    );

    res.json({
      enrollment: updatedEnrollment,
      summary: { numeric, letter, totalPoints, totalMaxPoints },
    });
  } catch (err) {
    next(err);
  }
};
