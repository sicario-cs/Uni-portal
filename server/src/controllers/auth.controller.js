
const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      message: "User created successfully",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};