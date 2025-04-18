const Facility = require("../models/Facility");

// Get all facilities with available slots
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Add new facility
exports.addFacility = async (req, res) => {
  const { name, description, slots } = req.body;
  try {
    const newFacility = await Facility.create({ name, description, slots });
    res.status(201).json(newFacility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update a slot’s capacity
exports.updateSlot = async (req, res) => {
  const { facilityId, slotTime } = req.params;
  const { newCapacity } = req.body;

  try {
    const facility = await Facility.findById(facilityId);
    const slot = facility.slots.find((s) => s.timeRange === slotTime);

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.capacity = newCapacity;
    await facility.save();

    res.json({ message: "Slot updated", facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
