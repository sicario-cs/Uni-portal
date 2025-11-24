const mongoose = require("mongoose");
const User = require("../models/user.model");
const Student = require("../models/student.model");

async function run() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect("mongodb://mongo_db:27017/university");

    console.log("Connected!");

    // Get all users with role = student
    const studentsUsers = await User.find({ role: "student" });

    console.log("Total users with student role:", studentsUsers.length);

    let counter = 1;

    for (const user of studentsUsers) {
      const exists = await Student.findOne({ userId: user._id });

      if (exists) {
        console.log(`Student already exists for user: ${user.username}`);
        continue;
      }

      // Generate studentId like STD0001, STD0002 ...
      const studentId = "STD" + String(counter).padStart(4, "0");
      counter++;

      await Student.create({
        userId: user._id,
        studentId,
        major: "Undeclared",
        level: 1,
        gpa: 0,
        status: "active",
      });

      console.log(`Created student for user ${user.username} → ${studentId}`);
    }

    console.log("Student creation completed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
