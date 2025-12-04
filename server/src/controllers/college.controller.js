const College = require("../models/college.model");
const { setCache, getCache } = require("../utils/cache");

exports.createCollege = async (req, res, next) => {
  try {
    const { code, name, description, status } = req.body;

    if (!code || !name) {
      return res
        .status(400)
        .json({ message: "code و name  requrid" });
    }

    const existing = await College.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "College code already exisit" });
    }
    
    const college = await College.create({
      code,
      name,
      description,
      status,
    });

    res.status(201).json(college);
  } catch (err) {
    next(err);
  }
};


exports.getAllColleges = async (req, res, next) => {
  try {
    const cacheKey = "all_colleges";

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ cached: true, data: cached });
    }

    const colleges = await College.find().sort({ code: 1 });

    await setCache(cacheKey, colleges, 3600); 

    res.json({ cached: false, data: colleges });
  } catch (err) {
    next(err);
  }
};


exports.getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({ message: "College dont exsist" });
    }

    res.json(college);
  } catch (err) {
    next(err);
  }
};


exports.updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    const update = {};
    if (code) update.code = code;
    if (name) update.name = name;
    if (description) update.description = description;
    if (status) update.status = status;

    const college = await College.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!college) {
      return res.status(404).json({ message: "College dont exsist" });
    }

    res.json(college);
  } catch (err) {
    next(err);
  }
};


exports.deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findByIdAndDelete(id);

    if (!college) {
      return res.status(404).json({ message: "College dont exsist" });
    }

    res.json({ message: "deleted sucsesfuly" });
  } catch (err) {
    next(err);
  }
};
