const Instructor = require("../models/instructor.model");
const User = require("../models/user.model");
const neo4jService = require("../services/neo4j.service");

exports.createInstructor = async (req, res, next) => {
  try {
    const { userId, department, title, office, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.role !== "instructor") {
      return res
        .status(400)
        .json({ message: "User role must be instructor" });
    }

    const existing = await Instructor.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Instructor already created for this user" });
    }

    const instructor = await Instructor.create({
      userId,
      department,
      title,
      office,
      phone,
    });
 
    await neo4jService.createInstructorNode(
      instructor._id.toString(),
      instructor.userId.fullName
    );
    
    res.status(201).json(instructor);
  } catch (err) {
    next(err);
  }
};

exports.getAllInstructors = async (req, res, next) => {
  try {
    const instructors = await Instructor.find()
      .populate("userId") 
      .sort({ department: 1 });

    res.json(instructors);
  } catch (err) {
    next(err);
  }
};

exports.getInstructorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id).populate("userId");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.json(instructor);
  } catch (err) {
    next(err);
  }
};

exports.updateInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = ["departmentId", "title", "office", "phone", "status"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "Provide at least one field to update" });
    }

    const instructor = await Instructor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.json(instructor);
  } catch (err) {
    next(err);
  }
};
;