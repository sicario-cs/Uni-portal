const neo4j = require("neo4j-driver");

const NEO4J_URI = "neo4j://neo4j_db:7687";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "password";  

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  { encrypted: "ENCRYPTION_OFF" }
);

driver.verifyConnectivity()
  .then(() => console.log("Neo4j connected"))
  .catch((err) => console.error("Neo4j connection error:", err));

module.exports = driver;