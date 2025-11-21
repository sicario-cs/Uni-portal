// server/src/services/auth.service.js
const User = require("../models/user.model");
const Student = require("../models/student.model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

async function registerUser({ username, email, fullName, password, role }) {
  // check for existing user
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    const err = new Error("Username or Email is already in use");
    err.status = 400;
    throw err;
  }


  const passwordHash = await bcrypt.hash(password, 10);

  // create user
  const user = await User.create({
    username,
    email,
    fullName,
    passwordHash,
    role,
  });

  if (role === "student") {
    await Student.create({
      userId: user._id,
      studentId: `STD${Date.now()}`, 
      major: null,
      level: 1,
      gpa: 0,
    });
  }

  const token = generateToken(user);

  return { user, token };
}

async function loginUser({ username, password }) {
  const user = await User.findOne({ username });

  if (!user) {
    const err = new Error("Data is incorrect");
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    const err = new Error("Data is incorrect");
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);

  return { user, token };
}

module.exports = {
  registerUser,
  loginUser,
};