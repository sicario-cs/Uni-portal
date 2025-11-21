const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
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

    creditHours: {
      type: Number,
      default: 3,
      min: 0,
      max: 3,
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null,
      },

    description: {
      type: String,
      default: null,
      trim: true,
    },

    // العلاقات الحقيقية بنسويها في Neo4j لاحقًا
    prerequisites: {
      type: [String], 
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);


courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ department: 1 });
courseSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
