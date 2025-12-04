const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const User = require("../models/user.model");
const Instructor = require("../models/instructor.model");
const Department = require("../models/department.model");

async function run() {
  try {
    console.log("Connecting to Mongo...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("Mongo connected!");

    const session = driver.session();

    const users = await User.find({ role: "instructor" });
    console.log(`Found ${users.length} instructor users.`);

    // 2) جلب كل الأقسام لاختيار عشوائي منها
    const departments = await Department.find();
    if (departments.length === 0) {
      console.log("❌ No departments found in Mongo. Cannot continue.");
      process.exit(0);
    }

    console.log(`Found ${departments.length} departments.`);

    function randomItem(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    // 3) نبدأ إنتاج الـ Instructor documents
    for (const user of users) {
      // check if instructor already exists:
      const exists = await Instructor.findOne({ userId: user._id });
      if (exists) {
        console.log(`Skipping: Instructor already exists for ${user.fullName}`);
        continue;
      }

      // choose random department:
      const randomDep = randomItem(departments);

      // random title
      const titles = [
        "Assistant Professor",
        "Associate Professor",
        "Lecturer",
        "Teaching Assistant",
        "Senior Lecturer",
      ];
      const title = randomItem(titles);

      const instructor = await Instructor.create({
        userId: user._id,
        department: randomDep._id,
        title,
        office: `B-${Math.floor(Math.random() * 300)}`,
        phone: "+9705" + Math.floor(10000000 + Math.random() * 89999999),
        status: "active",
      });

      console.log(`Instructor created: ${user.fullName} → ${randomDep.name}`);

      // ---------------- NEO4J -------------------

      // 1) Instructor Node
      await session.run(
        `
        MERGE (i:Instructor {id: $id})
        SET i.name = $name,
            i.title = $title
        `,
        {
          id: instructor._id.toString(),
          name: user.fullName,
          title,
        }
      );

      // 2) Department Node
      await session.run(
        `
        MERGE (d:Department {id: $id})
        SET d.name = $name,
            d.code = $code
        `,
        {
          id: randomDep._id.toString(),
          name: randomDep.name,
          code: randomDep.code,
        }
      );

      // 3) Relationship WORKS_IN
      await session.run(
        `
        MATCH (i:Instructor {id: $instructorId})
        MATCH (d:Department {id: $departmentId})
        MERGE (i)-[:WORKS_IN]->(d)
        `,
        {
          instructorId: instructor._id.toString(),
          departmentId: randomDep._id.toString(),
        }
      );

      console.log(
        `🟢 Linked Instructor ${user.fullName} → Department ${randomDep.name}`
      );
    }

    // cleanup
    await session.close();
    await mongoose.disconnect();
    await driver.close();

    console.log("🎉 MIGRATION COMPLETE: Instructors + Neo4j synced!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

run();
