const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const Department = require("../models/department.model");
const College = require("../models/college.model");

async function run() {
  try {
    console.log("Connecting to Mongo...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("Mongo connected!");

    const session = driver.session();

    // Get colleges
    const colleges = await College.find();
    if (colleges.length === 0) {
      console.log("❌ No colleges found. Cannot assign.");
      process.exit(0);
    }

    console.log(`Found ${colleges.length} colleges.`);

    // Get departments
    const departments = await Department.find();
    console.log(`Found ${departments.length} departments.`);

    function randomCollege() {
      const i = Math.floor(Math.random() * colleges.length);
      return colleges[i];
    }

    for (const dep of departments) {
      let chosenCollege = dep.collegeId;

      // Assign random college if null
      if (!chosenCollege) {
        const randomCol = randomCollege();
        chosenCollege = randomCol._id;

        await Department.updateOne(
            { _id: dep._id },
            { $set: { collegeId: chosenCollege } }
          );

        console.log(`🔄 Assigned department "${dep.name}" → random college "${randomCol.name}"`);
      }

      // --- Neo4j Sync ---

      // 1) Department Node
      await session.run(
        `
        MERGE (d:Department {id: $id})
        SET d.name = $name,
            d.code = $code
        `,
        {
          id: dep._id.toString(),
          name: dep.name || "",
          code: dep.code || "",
        }
      );

      // 2) College Node
      const collegeDoc = colleges.find(c => c._id.toString() === chosenCollege.toString());
      if (collegeDoc) {
        await session.run(
          `
          MERGE (c:College {id: $id})
          SET c.name = $name,
              c.code = $code
          `,
          {
            id: collegeDoc._id.toString(),
            name: collegeDoc.name,
            code: collegeDoc.code,
          }
        );

        // 3) Relationship PART_OF
        await session.run(
          `
          MATCH (d:Department {id: $departmentId})
          MATCH (c:College {id: $collegeId})
          MERGE (d)-[:PART_OF]->(c)
          `,
          {
            departmentId: dep._id.toString(),
            collegeId: collegeDoc._id.toString(),
          }
        );

        console.log(`🟢 Linked: ${dep.name} → ${collegeDoc.name}`);
      }
    }

    await session.close();
    await mongoose.disconnect();
    await driver.close();
    console.log("🎉 RANDOM ASSIGN + NEO4J SYNC COMPLETE!");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

run();
