const cassandra = require("../config/db.cassandra");

async function logActivity(studentId, action, courseId = null, metadata = {}) {
  if (!studentId || !action) {
    throw new Error("studentId and action are required to log activity");
  }

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
      JSON.stringify(metadata),
    ],
    { prepare: true }
  );
}

async function getStudentActivity(studentId) {
  if (!studentId) {
    throw new Error("studentId is required (Cassandra partition key)");
  }

  const query = `
    SELECT * FROM student_activity
    WHERE studentId = ?
  `;

  const result = await cassandra.execute(query, [studentId], { prepare: true });
  return result.rows;
}

async function getRecentActivity(studentId, limit = 30) {
  if (!studentId) throw new Error("studentId is required");

  const query = `
    SELECT * FROM student_activity
    WHERE studentId = ?
  `;

  const result = await cassandra.execute(query, [studentId], { prepare: true });

  let rows = result.rows;

 
  rows.sort((a, b) => b.timestamp - a.timestamp);

  return rows.slice(0, limit);
}


async function searchActivity({
  studentId,
  action,
  courseId,
  from,
  to,
  limit = 100,
}) {
  if (!studentId) {
    throw new Error("studentId is required (Cassandra partition key)");
  }

  let query = `
    SELECT * FROM student_activity
    WHERE studentId = ?
  `;

  const params = [studentId];

  if (from) {
    query += " AND timestamp >= ?";
    params.push(new Date(from));
  }
  if (to) {
    query += " AND timestamp <= ?";
    params.push(new Date(to));
  }

  query += " ALLOW FILTERING";

  const result = await cassandra.execute(query, params, { prepare: true });

  let rows = result.rows;

  if (action) {
    rows = rows.filter((r) => r.action === action);
  }

  if (courseId) {
    rows = rows.filter((r) => r.courseid === courseId);
  }

  rows.sort((a, b) => b.timestamp - a.timestamp);

  return rows.slice(0, limit);
}

module.exports = {
  logActivity,
  getStudentActivity,
  searchActivity,
  getRecentActivity,
};
