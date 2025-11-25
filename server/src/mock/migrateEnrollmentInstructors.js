// server/src/mock/migrateEnrollmentInstructors.js
const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const Student = require("../models/student.model");
const Instructor = require("../models/instructor.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const User = require("../models/user.model");

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("MongoDB connected");

    const session = driver.session();

    // 1) نجيب كل الـ instructors
    const instructors = await Instructor.find().populate("userId");
    if (instructors.length === 0) {
      console.log("No instructors found in Mongo. Aborting.");
      process.exit(0);
    }
    console.log("Instructors found:", instructors.length);

    // 2) نجيب كل الـ enrollments
    const enrollments = await Enrollment.find();
    console.log("Enrollments found:", enrollments.length);

    // helper لاختيار مدرس عشوائي
    function getRandomInstructor() {
      const index = Math.floor(Math.random() * instructors.length);
      return instructors[index];
    }

    // نمرّ على كل Enrollment
    for (const e of enrollments) {
      // لو بالفعل له instructorId، نتجاوزه
      if (e.instructorId) {
        console.log(`Enrollment ${e._id} already has instructor, skipping.`);
        continue;
      }

      const randomInstructor = getRandomInstructor();
      const instructorId = randomInstructor._id;
      const courseId = e.courseId?.toString();
      const studentId = e.studentId?.toString();
      const semester = e.semester || null;

      if (!courseId || !studentId) {
        console.log(`Enrollment ${e._id} missing studentId or courseId, skipping.`);
        continue;
      }

      // 3) نحدّث الـ Enrollment في Mongo
      e.instructorId = instructorId;
      await e.save();

      // 4) Neo4j: نضمن وجود Nodes و Relationships

      // 4.1 Student node
      const studentDoc = await Student.findById(studentId).populate("userId");
      if (studentDoc && studentDoc.userId) {
        await session.run(
          `
          MERGE (s:Student {id: $id})
          SET s.name = $name
          `,
          {
            id: studentDoc._id.toString(),
            name: studentDoc.userId.fullName || studentDoc.userId.username,
          }
        );
      }

      // 4.2 Instructor node
      const insUser = randomInstructor.userId;
      await session.run(
        `
        MERGE (i:Instructor {id: $id})
        SET i.name = $name,
            i.title = $title
        `,
        {
          id: instructorId.toString(),
          name: insUser?.fullName || insUser?.username || "Unknown",
          title: randomInstructor.title || null,
        }
      );

      // 4.3 Course node
      const courseDoc = await Course.findById(courseId);
      if (courseDoc) {
        await session.run(
          `
          MERGE (c:Course {id: $id})
          SET c.name = $name,
              c.code = $code,
              c.credits = $credits
          `,
          {
            id: courseDoc._id.toString(),
            name: courseDoc.name,
            code: courseDoc.code,
            credits: courseDoc.credits || null,
          }
        );
      }

      // 4.4 علاقة ENROLLED_IN (Student -> Course)
      await session.run(
        `
        MATCH (s:Student {id: $studentId})
        MATCH (c:Course {id: $courseId})
        MERGE (s)-[:ENROLLED_IN]->(c)
        `,
        {
          studentId: studentId,
          courseId: courseId,
        }
      );

      // 4.5 علاقة TEACHES (Instructor -> Course)
      await session.run(
        `
        MATCH (i:Instructor {id: $instructorId})
        MATCH (c:Course {id: $courseId})
        MERGE (i)-[:TEACHES]->(c)
        `,
        {
          instructorId: instructorId.toString(),
          courseId: courseId,
        }
      );

      // 4.6 علاقة ENROLLED_WITH (Student -> Instructor)
      await session.run(
        `
        MATCH (s:Student {id: $studentId})
        MATCH (i:Instructor {id: $instructorId})
        MERGE (s)-[r:ENROLLED_WITH]->(i)
        SET r.semester = $semester
        `,
        {
          studentId: studentId,
          instructorId: instructorId.toString(),
          semester,
        }
      );

      console.log(
        `Enrollment ${e._id} -> instructor ${instructorId} synced to Neo4j`
      );
    }

    await session.close();
    await mongoose.disconnect();
    await driver.close();
    console.log("Migration + Neo4j sync completed ");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
