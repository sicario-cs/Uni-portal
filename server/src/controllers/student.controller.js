
const Student = require("../models/student.model");
const User = require("../models/user.model");
const Enrollment = require("../models/enrollment.model");
const Grade = require("../models/grade.model");
const neo4jService = require("../services/neo4j.service");
const activityService = require("../services/activity.service");

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

exports.getStudentOverview = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    // 1) بيانات الطالب الأساسية من Mongo
    const studentPromise = Student.findById(studentId)
      .populate("userId")
      .populate("major"); // لو major ref على Department

    // 2) الـ Enrollments من Mongo
    const enrollmentsPromise = Enrollment.find({ studentId })
      .populate("courseId")
      .populate("instructorId");

    // 3) الكورسات + العلامات من Neo4j
    const graphCoursesPromise = neo4jService.getStudentCoursesWithGrades(
      studentId.toString()
    );

    // 4) آخر نشاط من Cassandra
    const activityPromise = activityService.getRecentActivity(
      studentId.toString(),
      30
    );

    const [studentDoc, enrollments, graphCourses, recentActivity] =
      await Promise.all([
        studentPromise,
        enrollmentsPromise,
        graphCoursesPromise,
        activityPromise,
      ]);

    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found" });
    }

    // حساب GPA بسيط من Mongo
    const grades = enrollments
      .map(e => e.finalGrade?.numeric)
      .filter(v => typeof v === "number");

    let gpa = null;
    if (grades.length) {
      const sum = grades.reduce((a, b) => a + b, 0);
      gpa = Math.round((sum / grades.length) * 100) / 100;
    }

    const basicInfo = {
      studentId: studentDoc._id,
      userId: studentDoc.userId?._id,
      fullName: studentDoc.userId?.fullName,
      username: studentDoc.userId?.username,
      email: studentDoc.userId?.email,
      major: studentDoc.major?.name || studentDoc.major || null,
      level: studentDoc.level,
      gpaFromMongo: gpa,
      status: studentDoc.status,
    };

    const mongoCourses = enrollments.map(e => ({
      enrollmentId: e._id,
      courseId: e.courseId?._id,
      courseName: e.courseId?.name,
      courseCode: e.courseId?.code,
      instructorId: e.instructorId?._id,
      instructorTitle: e.instructorId?.title,
      semester: e.semester,
      finalGrade: e.finalGrade || null,
    }));

    return res.json({
      basicInfo,
      mongo: {
        enrollmentsCount: enrollments.length,
        courses: mongoCourses,
      },
      graph: {
        courses: graphCourses,
      },
      activity: recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

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
