const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, match: /@spit\.ac\.in$/ },
  password: String,
  role: {
    type: String,
    enum: ["student", "faculty", "admin"],
    default: "student",
  },
});
module.exports = mongoose.model("User", userSchema);
