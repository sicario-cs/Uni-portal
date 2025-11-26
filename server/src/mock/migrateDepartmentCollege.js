const mongoose = require("mongoose");
const driver = require("../config/db.neo4j");

const Department = require("../models/department.model");
const College = require("../models/college.model");

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect("mongodb://mongo_db:27017/university");
    console.log("MongoDB connected.");

    const session = driver.session();

    // 1) Fetch all colleges
    const colleges = await College.find();
    console.log("Colleges:", colleges.length);

    // 2) Create College nodes in Neo4j
    for (const college of colleges) {
      await session.run(
        `
        MERGE (c:College {id: $id})
        SET c.name = $name,
            c.code = $code
        `,
        {
          id: college._id.toString(),
          name: college.name,
          code: college.code,
        }
      );
    }

    // 3) Fetch all departments
    const departments = await Department.find().populate("collegeId");
    console.log("Departments:", departments.length);

    // 4) Create Department nodes + PART_OF relationships
    for (const dep of departments) {
      if (!dep.collegeId) {
        console.log(`Department ${dep._id} has no collegeId. Skipping.`);
        continue;
      }

      // 4.1 Create department node
      await session.run(
        `
        MERGE (d:Department {id: $id})
        SET d.name = $name,
            d.code = $code
        `,
        {
          id: dep._id.toString(),
          name: dep.name,
          code: dep.code,
        }
      );

      // 4.2 PART_OF Relationship
      await session.run(
        `
        MATCH (d:Department {id: $departmentId})
        MATCH (c:College {id: $collegeId})
        MERGE (d)-[:PART_OF]->(c)
        `,
        {
          departmentId: dep._id.toString(),
          collegeId: dep.collegeId._id.toString(),
        }
      );

      console.log(
        `Linked Department ${dep.name} → College ${dep.collegeId.name}`
      );
    }

    await session.close();
    await mongoose.disconnect();
    await driver.close();

    console.log("Migration: Department → College completed successfully! ✅");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
