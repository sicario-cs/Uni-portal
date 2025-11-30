const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const User = require("../models/user.model");
const Student = require("../models/student.model");
const Instructor = require("../models/instructor.model");

async function run() {
  try {
    console.log("Connecting to Mongo...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("Mongo connected!");

    const session = driver.session();

    // Fetch all users
    const users = await User.find();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      const userId = user._id.toString();
      const fullName = user.fullName;
      const username = user.username;
      const email = user.email;

      // Check if this user has a Student document
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        await session.run(
          `
          MATCH (s:Student {id: $studentId})
          SET s.name = $fullName,
              s.username = $username,
              s.email = $email
          `,
          {
            studentId: student._id.toString(),
            fullName,
            username,
            email,
          }
        );

        console.log(`Updated Student node → ${fullName}`);
      }

      // Check if this user has an Instructor document
      const instructor = await Instructor.findOne({ userId: user._id });
      if (instructor) {
        await session.run(
          `
          MATCH (i:Instructor {id: $instructorId})
          SET i.name = $fullName,
              i.username = $username,
              i.email = $email
          `,
          {
            instructorId: instructor._id.toString(),
            fullName,
            username,
            email,
          }
        );

        console.log(`Updated Instructor node → ${fullName}`);
      }
    }

    await session.close();
    await mongoose.disconnect();
    await driver.close();

    console.log("🎉 Sync completed! All Neo4j names updated.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Sync Error:", err);
    process.exit(1);
  }
}

run();
