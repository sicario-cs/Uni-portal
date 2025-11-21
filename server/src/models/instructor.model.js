const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null,
      },

    title: {
      type: String,
      trim: true,
      default: null, 
    },

    office: {
      type: String,
      trim: true,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
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

// Indexes
instructorSchema.index({ userId: 1 }, { unique: true });
instructorSchema.index({ department: 1 });
instructorSchema.index({ status: 1 });

module.exports = mongoose.model("Instructor", instructorSchema);