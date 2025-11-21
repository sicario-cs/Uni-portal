const neo4j = require("neo4j-driver");

// Neo4j connection
const neoDriver = neo4j.driver(
  "bolt://neo4j:7687",
  neo4j.auth.basic("neo4j", "password")
);

neoDriver.verifyConnectivity()
  .then(() => console.log("Neo4j connected"))
  .catch(err => console.error(err));

module.exports = neoDriver;

