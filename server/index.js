// Database connections
require("./src/config/db.mongo");
require("./src/config/db.redis");
require("./src/config/db.cassandra");
require("./src/config/db.neo4j");

// Import Express app
const app = require("./src/app");

<<<<<<< Updated upstream
=======

  
// Redis
const redisClient = redis.createClient({
  url: "redis://redis_db:6379"
});
redisClient.on("connect", () => {
  console.log("Redis connected");
});
redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});

redisClient.connect();

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Cassandra
const cassandraClient = new cassandra.Client({
  contactPoints: ["cassandra"],
  localDataCenter: "datacenter1"
});
cassandraClient.connect()
  .then(() => console.log("Cassandra connected"))
  .catch(err => console.error(err));

// Neo4j
const neoDriver = neo4j.driver(
  "bolt://neo4j:7687",
  neo4j.auth.basic("neo4j", "password")
);
neoDriver.verifyConnectivity()
  .then(() => console.log("Neo4j connected"))
  .catch(err => console.error(err));


app.get("/hi", (req, res) => {
  res.send("Hello ahmad");
});

 
>>>>>>> Stashed changes
// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});