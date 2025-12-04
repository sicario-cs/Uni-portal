const cassandra = require("cassandra-driver");

const cassandraClient = new cassandra.Client({
  contactPoints: ["cassandra"],
  localDataCenter: "datacenter1",
  keyspace: "university",
});

cassandraClient
  .connect()
  .then(() => console.log("Cassandra connected"))
  .catch((err) => console.error("Cassandra connection error:", err));

module.exports = cassandraClient;
