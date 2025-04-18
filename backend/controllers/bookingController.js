const Booking = require("../models/Booking");
const Facility = require("../models/Facility");

// Book a slot
exports.bookSlot = async (req, res) => {
  const { facilityId } = req.params;
  const { slotTime, date } = req.body;

  try {
    const facility = await Facility.findById(facilityId);
    if (!facility)
      return res.status(404).json({ message: "Facility not found" });

    const slot = facility.slots.find((s) => s.timeRange === slotTime);
    if (!slot) return res.status(400).json({ message: "Invalid slot" });

    const existingBooking = await Booking.findOne({
      userId: req.user.id,

      slotTime,
      date,
    });

    if (existingBooking) {
      return res.status(400).json({
        message:
          "You already have a booking for this time slot on the selected date.",
      });
    }

    if (slot.booked >= slot.capacity) {
      return res.status(400).json({ message: "Slot is full" });
    }

    // Update slot capacity
    slot.booked += 1;
    slot.bookings.push({ userId: req.user.id, date, slotTime });

    await facility.save();

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      facilityId,
      slotTime,
      date,
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate(
      "facilityId",
      "name"
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel booking (24-hour rule)
exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or booking not found" });
    }

    const bookingDateTime = new Date(
      `${booking.date} ${booking.slotTime.split("-")[0]}`
    );
    const now = new Date();

    const timeDiff = (bookingDateTime - now) / (1000 * 60 * 60); // in hours
    if (timeDiff < 24) {
      return res
        .status(400)
        .json({ message: "Cannot cancel within 24 hours of booking time" });
    }

    // Update Facility slot
    const facility = await Facility.findById(booking.facilityId);
    const slot = facility.slots.find((s) => s.timeRange === booking.slotTime);

    if (slot) {
      slot.booked -= 1;
      slot.bookings = slot.bookings.filter(
        (b) => !(b.userId.toString() === req.user.id && b.date === booking.date)
      );
      await facility.save();
    }

    await booking.deleteOne();
    res.json({ message: "Booking canceled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
