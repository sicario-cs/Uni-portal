const cassandra = require("cassandra-driver");
//timestamp = clustering key
// studentId = partition key
const client = new cassandra.Client({
  contactPoints: ["cassandra_db"],
  localDataCenter: "datacenter1"
});

async function init() {
  try {
    console.log("Connecting to Cassandra...");
    await client.connect();
    console.log("Connected!");

   
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS university
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': '1'
      };
    `);

    console.log("Keyspace created/exists.");

    
    await client.execute(`USE university;`);

 
    await client.execute(`
      CREATE TABLE IF NOT EXISTS student_activity (
        studentId text,
        timestamp timestamp,
        action text,
        courseId text,
        metadata text,
        PRIMARY KEY (studentId, timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC);
    `);

    console.log("Table student_activity created/exists.");
    process.exit(0);
  } catch (err) {
    console.error("Cassandra init error:", err);
    process.exit(1);
  }
}

init();
