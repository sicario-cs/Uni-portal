const cassandra = require("cassandra-driver");

// Cassandra connection
const cassandraClient = new cassandra.Client({
  contactPoints: ["cassandra"],
  localDataCenter: "datacenter1"
});

cassandraClient.connect()
  .then(() => console.log("Cassandra connected"))
  .catch(err => console.error(err));

module.exports = cassandraClient;

