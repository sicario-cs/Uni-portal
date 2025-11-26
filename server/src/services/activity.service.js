const cassandra = require("../config/db.cassandra");

async function logActivity(studentId, action, courseId = null, metadata = {}) {
  const timestamp = new Date();

  const query = `
    INSERT INTO student_activity (studentId, timestamp, action, courseId, metadata)
    VALUES (?, ?, ?, ?, ?)
  `;

  await cassandra.execute(
    query,
    [
      studentId,
      timestamp,
      action,
      courseId,
      JSON.stringify(metadata)
    ],
    { prepare: true }
  );
}

async function getStudentActivity(studentId) {
  const query = `
    SELECT * FROM student_activity
    WHERE studentId = ?
  `;

  const result = await cassandra.execute(query, [studentId], { prepare: true });
  return result.rows;
}

module.exports = { logActivity, getStudentActivity };
