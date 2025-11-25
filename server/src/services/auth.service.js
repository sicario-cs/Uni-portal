const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const neo4jService = require("./neo4j.service");

async function registerUser({ username, email, fullName, password, role }) {
  const existing = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existing) {
    const err = new Error("Username or email already in use");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    fullName,
    passwordHash,
    role,
  });

  if (role === "student") {
    await neo4jService.createStudentNode(
      student._id.toString(),
      user.fullName
    );
  }
  
  return user;
}

async function loginUser({ username, password }) {
  const user = await User.findOne({ username });

  if (!user) {
    const err = new Error("Incorrect username or password");
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    const err = new Error("Incorrect username or password");
    err.status = 401;
    throw err;
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
};
