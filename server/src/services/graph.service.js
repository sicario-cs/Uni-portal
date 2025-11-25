const driver = require("../config/db.neo4j");

async function getCoursesOfStudent(studentId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (s:Student {id: $studentId})-[:ENROLLED_IN]->(c:Course)
      RETURN c
      `,
      { studentId }
    );

    return result.records.map((r) => r.get("c").properties);
  } finally {
    await session.close();
  }
}

async function getCoursesOfInstructor(instructorId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (i:Instructor {id: $instructorId})-[:TEACHES]->(c:Course)
      RETURN c
      `,
      { instructorId }
    );

    return result.records.map((r) => r.get("c").properties);
  } finally {
    await session.close();
  }
}

async function getStudentsInCourse(courseId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (s:Student)-[:ENROLLED_IN]->(c:Course {id: $courseId})
      RETURN s
      `,
      { courseId }
    );

    return result.records.map((r) => r.get("s").properties);
  } finally {
    await session.close();
  }
}

module.exports = {
  getCoursesOfStudent,
  getCoursesOfInstructor,
  getStudentsInCourse,
};
