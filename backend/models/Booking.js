const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Add if you ever want to populate user details too
    required: true,
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility",
    required: true,
  },
  slotTime: String,
  date: String,
  status: { type: String, default: "booked" },
});

module.exports = mongoose.model("Booking", bookingSchema);
