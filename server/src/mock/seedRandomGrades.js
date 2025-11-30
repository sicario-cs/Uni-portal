const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const Enrollment = require("../models/enrollment.model");
const Student = require("../models/student.model");
const Course = require("../models/course.model");

function randomGrade() {
  const numeric = Math.floor(50 + Math.random() * 51); // 50–100
  let letter = "F";

  if (numeric >= 90) letter = "A";
  else if (numeric >= 85) letter = "B+";
  else if (numeric >= 80) letter = "B";
  else if (numeric >= 75) letter = "C+";
  else if (numeric >= 70) letter = "C";
  else if (numeric >= 60) letter = "D";
  else letter = "F";

  return { numeric, letter };
}

async function run() {
  try {
    console.log("⏳ Connecting to Mongo...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("✅ Mongo connected");

    const session = driver.session();

    const enrollments = await Enrollment.find();

    console.log(`📘 Found ${enrollments.length} enrollments`);

    for (const enr of enrollments) {
      const grade = randomGrade();

      // -------- Update Mongo --------
      enr.finalGrade = grade;
      await enr.save();

      console.log(
        `🔵 Enrollment ${enr._id} → Grade: ${grade.numeric} (${grade.letter})`
      );

      // -------- Update Neo4j --------
      await session.run(
        `
        MATCH (s:Student {id: $studentId})-[r:ENROLLED_IN]->(c:Course {id: $courseId})
        SET r.numeric = $numeric,
            r.letter = $letter
        `,
        {
          studentId: enr.studentId.toString(),
          courseId: enr.courseId.toString(),
          numeric: grade.numeric,
          letter: grade.letter,
        }
      );

      console.log(`🟢 Updated Neo4j relation for enrollment ${enr._id}`);
    }

    await session.close();
    await mongoose.disconnect();
    await driver.close();

    console.log("🎉 All random grades applied + Neo4j synced!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
