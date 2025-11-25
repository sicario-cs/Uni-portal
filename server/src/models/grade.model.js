const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    term: {
      type: String, 
      required: true,
      trim: true,
    },

    assessmentType: {
      type: String, 
      required: true,
      trim: true,
    },

    title: {
      type: String, 
      required: true,
      trim: true,
    },

    points: {
      type: Number,
      required: true,
      min: 0,
    },

    maxPoints: {
      type: Number,
      required: true,
      min: 0,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
gradeSchema.index({ enrollmentId: 1 });
gradeSchema.index({ studentId: 1, courseId: 1, term: 1 });
gradeSchema.index({ courseId: 1, term: 1, assessmentType: 1 });
gradeSchema.index({ submittedBy: 1, term: 1 });

module.exports = mongoose.model("Grade", gradeSchema);