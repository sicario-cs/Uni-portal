
const Student = require("../models/student.model");
const User = require("../models/user.model");
const Enrollment = require("../models/enrollment.model");
const Grade = require("../models/grade.model");


exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate("userId") 
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate("userId");

    if (!student) {
      return res.status(404).json({ message: "student dont exsist" });
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/by-user/:userId
exports.getStudentByUser = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      userId: req.params.userId,
    }).populate("userId");

    if (!student) {
      return res.status(404).json({ message: "no student for this user" });
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};


exports.updateStudent = async (req, res, next) => {
  try {
    const { major, level, gpa, status } = req.body;

    const update = {};
    if (major) update.major = major;
    if (level) update.level = level;
    if (gpa !== undefined) update.gpa = gpa;
    if (status) update.status = status;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "student dont exsist" });
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};


exports.getStudentEnrollments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollments = await Enrollment.find({ studentId: id })
      .populate("courseId")
      .sort({ semester: 1 });

    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};


exports.getStudentGrades = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grades = await Grade.find({ studentId: id })
      .populate("courseId")
      .populate("submittedBy")
      .sort({ term: 1 });

    res.json(grades);
  } catch (err) {
    next(err);
  }
};
