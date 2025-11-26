const authService = require("../services/auth.service");
const activityService = require("../services/activity.service");


exports.register = async (req, res, next) => {
  try {
    const { username, email, fullName, password, role } = req.body;

    const user = await authService.registerUser({
      username,
      email,
      fullName,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await authService.loginUser({ username, password });


    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    res.json({
      message: "Login successful",
      session: req.session.user,
    });
  } catch (err) {
    next(err);
  }
};


exports.logout = async (req, res, next) => {
  try {
    if (req.session.user && req.session.user.id) {
      await activityService.logActivity(req.session.user.id, "logout");
    }

    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  } catch (err) {
    next(err);
  }
};


exports.me = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json(req.session.user);
};
