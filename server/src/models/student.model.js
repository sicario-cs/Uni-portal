const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
      default: null,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    gpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "graduated"],
      default: "active",
    },
  },
  {
    timestamps: true, 
  }
);

studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ userId: 1 }, { unique: true });
studentSchema.index({ major: 1, level: 1 });

module.exports = mongoose.model("Student", studentSchema);