const mongoose = require("mongoose");
const slotSchema = new mongoose.Schema({
  timeRange: String,
  capacity: Number,
  bookings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: String,
    },
  ],
});

const facilitySchema = new mongoose.Schema({
  name: String,
  description: String,
  slots: [slotSchema],
});
module.exports = mongoose.model("Facility", facilitySchema);
