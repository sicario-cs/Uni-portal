const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

 
    name: {
      type: String,
      required: true,
      trim: true,
    },

  
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  {
    timestamps: true, 
  }
);

// Indexes
collegeSchema.index({ code: 1 }, { unique: true });
collegeSchema.index({ name: 1 });

module.exports = mongoose.model("College", collegeSchema);
