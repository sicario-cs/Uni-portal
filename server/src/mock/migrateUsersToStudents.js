const mongoose = require("mongoose");

const User = require("../models/user.model");
const Student = require("../models/student.model");
const Department = require("../models/department.model");

async function run() {
  try {
    console.log("Connecting to Mongo...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("Mongo connected!");

    // 1) Get all users with role = student
    const users = await User.find({ role: "student" });
    console.log(`Found ${users.length} student users.`);

    // 2) Get all departments (for major assignment)
    const departments = await Department.find();
    if (departments.length === 0) {
      console.log("⚠️ No departments found. Majors will be null.");
    }

    function randomDepartment() {
      if (departments.length === 0) return null;
      const index = Math.floor(Math.random() * departments.length);
      return departments[index];
    }

    function randomGPA() {
      // Generate GPA between 60 - 100
      return Math.round((60 + Math.random() * 40) * 100) / 100;
    }

    function randomLevel() {
      return Math.ceil(Math.random() * 4);  // 1 to 4
    }

    for (const user of users) {
      // skip if student already exists
      const exists = await Student.findOne({ userId: user._id });
      if (exists) {
        console.log(`Skipping: Student already exists for ${user.fullName}`);
        continue;
      }

      const dep = randomDepartment();
      const studentId = `STD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const student = await Student.create({
        userId: user._id,
        studentId,
        major: dep ? dep._id : null,
        level: randomLevel(),
        gpa: randomGPA(),
        status: "active",
      });

      console.log(
        `Created Student ${user.fullName} → studentId ${studentId} (major: ${dep ? dep.name : "N/A"})`
      );
    }

    await mongoose.disconnect();
    console.log("🎉 Student migration completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

run();
