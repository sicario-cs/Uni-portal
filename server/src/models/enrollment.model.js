const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {

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
    
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      default: null,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },

 
    status: {
      type: String,
      enum: ["enrolled", "dropped", "completed"],
      default: "enrolled",
    },


    finalGrade: {
      letter: { type: String, default: null }, 
      numeric: { type: Number, default: null }, 
    },
    stats: {
        totalPoints: { type: Number, default: 0 },    
        maxPoints: { type: Number, default: 0 },      
      }
  },
  
  {
    timestamps: true, 
  }
);


enrollmentSchema.index(
  { studentId: 1, courseId: 1, semester: 1 },
  { unique: true }
);
enrollmentSchema.index({ studentId: 1, semester: 1 });
enrollmentSchema.index({ courseId: 1, semester: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
