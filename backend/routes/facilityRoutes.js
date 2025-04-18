const express = require("express");
const router = express.Router();
const {
  getFacilities,
  addFacility,
  updateSlot,
} = require("../controllers/facilityController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Public: View all facilities with available slots
router.get("/", protect, getFacilities);

// Admin: Add new facility
router.post("/add", protect, adminOnly, addFacility);

// Admin: Update a facility's slot (e.g., change capacity)
router.put(
  "/update-slot/:facilityId/:slotTime",
  protect,
  adminOnly,
  updateSlot
);

module.exports = router;
