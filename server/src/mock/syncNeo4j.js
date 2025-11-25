// server/src/mock/syncNeo4j.js
const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const User = require("../models/user.model");
const Student = require("../models/student.model");
const Instructor = require("../models/instructor.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

async function syncStudents(session) {
  const students = await Student.find().populate("userId");
  console.log("Students in Mongo:", students.length);

  for (const s of students) {
    if (!s.userId) continue;

    const id = s._id.toString();
    const name = s.userId.fullName || s.userId.username || "Unknown";

    await session.run(
      `
      MERGE (st:Student {id: $id})
      SET st.name = $name,
          st.studentId = $studentId
      `,
      {
        id,
        name,
        studentId: s.studentId || null,
      }
    );
  }

  console.log("Students synced to Neo4j");
}

async function syncInstructors(session) {
  const instructors = await Instructor.find().populate("userId");
  console.log("Instructors in Mongo:", instructors.length);

  for (const ins of instructors) {
    if (!ins.userId) continue;

    const id = ins._id.toString();
    const name = ins.userId.fullName || ins.userId.username || "Unknown";

    await session.run(
      `
      MERGE (i:Instructor {id: $id})
      SET i.name = $name,
          i.title = $title
      `,
      {
        id,
        name,
        title: ins.title || null,
      }
    );
  }

  console.log("Instructors synced to Neo4j");
}

async function syncCourses(session) {
  const courses = await Course.find();
  console.log("Courses in Mongo:", courses.length);

  for (const c of courses) {
    const id = c._id.toString();

    await session.run(
      `
      MERGE (co:Course {id: $id})
      SET co.name = $name,
          co.code = $code,
          co.credits = $credits
      `,
      {
        id,
        name: c.name,
        code: c.code,
        credits: c.credits || null,
      }
    );
  }

  console.log("Courses synced to Neo4j");
}

async function syncEnrollments(session) {
  const enrollments = await Enrollment.find();
  console.log("Enrollments in Mongo:", enrollments.length);

  for (const e of enrollments) {
    const studentId = e.studentId?.toString();
    const courseId = e.courseId?.toString();

    if (!studentId || !courseId) continue;

    await session.run(
      `
      MATCH (s:Student {id: $studentId})
      MATCH (c:Course {id: $courseId})
      MERGE (s)-[r:ENROLLED_IN {semester: $semester}]->(c)
      `,
      {
        studentId,
        courseId,
        semester: e.semester || null,
      }
    );
  }

  console.log("Enrollments (ENROLLED_IN) synced to Neo4j");
}

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("Connected to MongoDB");

    const session = driver.session();

    // ⚠️ إذا حاب تعيد بناء الـ Graph من الصفر، فك التعليق عن السطرين:
    // console.log("Clearing Neo4j graph...");
    // await session.run("MATCH (n) DETACH DELETE n");

    await syncStudents(session);
    await syncInstructors(session);
    await syncCourses(session);
    await syncEnrollments(session);

    await session.close();
    await mongoose.disconnect();
    await driver.close();

    console.log("Neo4j sync completed ✅");
    process.exit(0);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

main();
