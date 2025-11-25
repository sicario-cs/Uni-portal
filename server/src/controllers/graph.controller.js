const graphService = require("../services/graph.service");

exports.getCoursesOfStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const courses = await graphService.getCoursesOfStudent(studentId);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.getCoursesOfInstructor = async (req, res, next) => {
  try {
    const { instructorId } = req.params;
    const courses = await graphService.getCoursesOfInstructor(instructorId);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.getStudentsInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const students = await graphService.getStudentsInCourse(courseId);
    res.json(students);
  } catch (err) {
    next(err);
  }
};
