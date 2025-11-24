// server/src/controllers/auth.controller.js
const authService = require("../services/auth.service");

// تسجيل مستخدم جديد
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

// تسجيل الدخول + إنشاء Session Redis
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await authService.loginUser({ username, password });

    // تخزين الجلسة في Redis
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

// تسجيل الخروج
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};

// Endpoint لمعرفة المستخدم الحالي
exports.me = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json(req.session.user);
};
