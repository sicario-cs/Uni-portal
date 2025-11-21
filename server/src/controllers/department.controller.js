const Department = require("../models/department.model");
const College = require("../models/college.model");


exports.createDepartment = async (req, res, next) => {
  try {
    const { collegeId, code, name, headInstructorId, office, phone, status } =
      req.body;

    if (!collegeId || !code || !name) {
      return res
        .status(400)
        .json({ message: "collegeId و code و name مطلوبة" });
    }

  
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(400).json({ message: "College dont exsist" });
    }

    const existing = await Department.findOne({
      collegeId,
      code: code.toUpperCase(),
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "code already in use" });
    }

    const department = await Department.create({
      collegeId,
      code,
      name,
      headInstructorId,
      office,
      phone,
      status,
    });

    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate("collegeId")
      .populate("headInstructorId")
      .sort({ code: 1 });

    res.json(departments);
  } catch (err) {
    next(err);
  }
};


exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate("collegeId")
      .populate("headInstructorId");

    if (!department) {
      return res.status(404).json({ message: "Department dont exsist" });
    }

    res.json(department);
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentsByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;

    const departments = await Department.find({ collegeId })
      .populate("headInstructorId")
      .sort({ code: 1 });

    res.json(departments);
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, headInstructorId, office, phone, status } = req.body;

    const update = {};
    if (code) update.code = code;
    if (name) update.name = name;
    if (headInstructorId) update.headInstructorId = headInstructorId;
    if (office) update.office = office;
    if (phone) update.phone = phone;
    if (status) update.status = status;

    const department = await Department.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!department) {
      return res.status(404).json({ message: "Department dont exsist" });
    }

    res.json(department);
  } catch (err) {
    next(err);
  }
};


exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department dont exsist" });
    }

    res.json({ message: "dep deleted sucsessfuly" });
  } catch (err) {
    next(err);
  }
};
