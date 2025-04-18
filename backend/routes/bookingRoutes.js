const express = require("express");
const router = express.Router();
const {
  bookSlot,
  getUserBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");

// Book a slot
router.post("/book/:facilityId", protect, bookSlot);

// Get current user’s bookings
router.get("/my-bookings", protect, getUserBookings);

// Cancel a booking
router.delete("/cancel/:bookingId", protect, cancelBooking);

module.exports = router;
