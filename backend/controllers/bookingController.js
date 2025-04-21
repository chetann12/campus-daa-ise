const Booking = require("../models/Booking");
const Facility = require("../models/Facility");
const User = require("../models/User");
const ClassroomGraph = require("../models/ClassroomGraph");
const { dijkstra } = require("../utils/graph");

const PRIORITY_MAP = {
  faculty: 3,
  student: 1,
};

// 0/1 Knapsack to select best users based on priority
function knapsackBooking(requests, capacity) {
  const n = requests.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const val = requests[i - 1].value;
    for (let w = 1; w <= capacity; w++) {
      if (1 <= w) {
        dp[i][w] = Math.max(val + dp[i - 1][w - 1], dp[i - 1][w]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let w = capacity;
  const selected = [];
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(requests[i - 1]);
      w -= 1;
    }
  }

  return selected;
}

// Book a slot
exports.bookSlot = async (req, res) => {
  const { facilityId } = req.params;
  const { slotTime, date, allowAlternate } = req.body; // ⭐ Add allowAlternate from frontend

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

    const user = await User.findById(req.user.id);
    const rolePriority = PRIORITY_MAP[user.role] || 1;

    // If slot is full
    if (slot.booked >= slot.capacity) {
      const allBookings = await Booking.find({
        facilityId,
        slotTime,
        date,
      }).populate("userId");

      const allRequests = allBookings.map((b) => ({
        id: b._id.toString(),
        userId: b.userId._id.toString(),
        value: PRIORITY_MAP[b.userId.role] || 1,
      }));

      allRequests.push({
        id: "current",
        userId: req.user.id,
        value: rolePriority,
      });

      const accepted = knapsackBooking(allRequests, slot.capacity);
      const isAccepted = accepted.some((r) => r.id === "current");

      if (!isAccepted) {
        // ⭐ Check for alternate classroom if allowed and classroom_*
        if (allowAlternate && facility.name.startsWith("classroom_")) {
          const graphDoc = await ClassroomGraph.findOne();
          if (!graphDoc) {
            return res
              .status(500)
              .json({ message: "Classroom graph not found" });
          }

          const graph = graphDoc.graph;
          const distances = dijkstra(graph, facility.name);
          const sorted = Object.entries(distances)
            .sort((a, b) => a[1] - b[1])
            .map(([name]) => name);

          const allClassrooms = await Facility.find({
            name: { $regex: /^classroom_/ },
          });

          for (let name of sorted) {
            if (name === facility.name) continue;

            const alt = allClassrooms.find((f) => f.name === name);
            const altSlot = alt?.slots.find((s) => s.timeRange === slotTime);

            if (altSlot && altSlot.booked < altSlot.capacity) {
              altSlot.booked += 1;
              altSlot.bookings.push({ userId: req.user.id, date, slotTime });
              await alt.save();

              const booking = await Booking.create({
                userId: req.user.id,
                facilityId: alt._id,
                slotTime,
                date,
              });

              return res.status(201).json({
                message: `Original classroom full. Booked alternate: ${alt.name}`,
                booking,
              });
            }
          }

          return res.status(400).json({
            message:
              "Slot full and no alternate classrooms available at this time.",
          });
        }

        return res.status(400).json({
          message:
            "Slot full. Your booking was not prioritized for this time slot.",
        });
      }
    }

    // Proceed with booking
    slot.booked += 1;
    slot.bookings.push({ userId: req.user.id, date, slotTime });
    await facility.save();

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
