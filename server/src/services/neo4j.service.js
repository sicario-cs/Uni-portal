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

async function updateEnrollmentGrade(studentId, courseId, grade) {
  const session = driver.session();

  try {
    await session.run(
      `
      MATCH (s:Student {id: $studentId})-[r:ENROLLED_IN]->(c:Course {id: $courseId})
      SET r.numeric = $numeric,
          r.letter = $letter
      `,
      {
        studentId,
        courseId,
        numeric: grade.numeric,
        letter: grade.letter,
      }
    );
  } finally {
    await session.close();
  }
}

async function getStudentCoursesWithGrades(studentId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (s:Student {id: $studentId})-[r:ENROLLED_IN]->(c:Course)
      OPTIONAL MATCH (i:Instructor)-[:TEACHES]->(c)
      RETURN
        c.id AS courseId,
        c.name AS name,
        c.code AS code,
        r.numeric AS numeric,
        r.letter AS letter,
        r.semester AS semester,
        collect(DISTINCT { id: i.id, name: i.name }) AS instructors
      `,
      { studentId }
    );

    return result.records.map(row => ({
      courseId: row.get("courseId"),
      name: row.get("name"),
      code: row.get("code"),
      grade: {
        numeric: row.get("numeric"),
        letter: row.get("letter"),
      },
      semester: row.get("semester"),
      instructors: row.get("instructors"),
    }));
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
  getStudentCoursesWithGrades,
  addTeachesRelation,
};
