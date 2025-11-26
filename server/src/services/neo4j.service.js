const driver = require("../config/db.neo4j");

async function createStudentNode(studentId, name) {
  const session = driver.session();
  try {
    await session.run(
      `MERGE (s:Student {id: $id}) SET s.name = $name`,
      { id: studentId, name }
    );
  } finally {
    await session.close();
  }
}

async function createCourseNode(courseId, name, code) {
  const session = driver.session();
  try {
    await session.run(
      `MERGE (c:Course {id: $id}) SET c.name = $name, c.code = $code`,
      { id: courseId, name, code }
    );
  } finally {
    await session.close();
  }
}

async function addEnrollmentRelation(studentId, courseId) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (s:Student {id: $studentId})
      MATCH (c:Course {id: $courseId})
      MERGE (s)-[:ENROLLED_IN]->(c)
      `,
      { studentId, courseId }
    );
  } finally {
    await session.close();
  }
}

async function createInstructorNode(id, name) {
  const session = driver.session();
  try {
    await session.run(
      `MERGE (i:Instructor {id: $id}) SET i.name = $name`,
      { id, name }
    );
  } finally {
    await session.close();
  }
}

async function addEnrollmentInstructorRelation(studentId, instructorId, semester) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (s:Student {id: $studentId})
      MATCH (i:Instructor {id: $instructorId})
      MERGE (s)-[:ENROLLED_WITH {semester: $semester}]->(i)
      `,
      { studentId, instructorId, semester }
    );
  } finally {
    await session.close();
  }
}

async function addTeachesRelation(instructorId, courseId) {
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (i:Instructor {id: $instructorId})
      MATCH (c:Course {id: $courseId})
      MERGE (i)-[:TEACHES]->(c)
      `,
      { instructorId, courseId }
    );
  } finally {
    await session.close();
  }
}

module.exports = {
  createStudentNode,
  createCourseNode,
  addEnrollmentRelation,
  createInstructorNode,
  addEnrollmentInstructorRelation,
  addTeachesRelation,
};
