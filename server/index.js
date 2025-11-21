// Database connections
require("./src/config/db.mongo");
require("./src/config/db.redis");
require("./src/config/db.cassandra");
require("./src/config/db.neo4j");

// Import Express app
const app = require("./src/app");

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});