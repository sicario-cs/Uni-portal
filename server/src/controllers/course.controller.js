const Course = require("../models/course.model");
const neo4jService = require("../services/neo4j.service");

exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};


exports.getCourseByCode = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const course = await Course.findOne({ code });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};


exports.createCourse = async (req, res, next) => {
  try {
    const { code, name, creditHours, department, description, prerequisites } =
      req.body;

    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Course code already exists" });
    }

    const course = await Course.create({
      code,
      name,
      creditHours,
      department,
      description,
      prerequisites,
    });
     
    await neo4jService.createCourseNode(
      course._id.toString(),
      course.name,
      course.code
    );

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};