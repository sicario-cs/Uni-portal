// server/src/models/department.model.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    headInstructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      default: null,
    },

    office: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);


departmentSchema.index(
  { collegeId: 1, code: 1 },
  { unique: true }
);
departmentSchema.index({ collegeId: 1 });
departmentSchema.index({ name: 1 });

module.exports = mongoose.model("Department", departmentSchema);
