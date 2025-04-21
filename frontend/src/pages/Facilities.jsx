import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import api from "../api";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilities = async () => {
      const res = await api.get("/facilities");
      setFacilities(res.data);
    };
    fetchFacilities();
  }, []);

  const handleBooking = async (facilityId, slotTime) => {
    try {
      const formattedDate = selectedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format

      await api.post(`/bookings/book/${facilityId}`, {
        slotTime,
        date: formattedDate,
      });

      alert("Slot booked successfully!");
      navigate("/bookings"); // Navigate to Booking.js after successful booking

      // Update local state to simulate updated booking
      setFacilities((prevFacilities) =>
        prevFacilities.map((facility) => {
          if (facility._id !== facilityId) return facility;

          return {
            ...facility,
            slots: facility.slots.map((slot) => {
              if (slot.timeRange !== slotTime) return slot;

              return {
                ...slot,
                bookings: [...slot.bookings, { date: formattedDate }],
              };
            }),
          };
        })
      );
    } catch (err) {
      console.error(err);
      alert(
        "Booking failed: " + (err.response?.data?.message || "Unknown error")
      );
    }
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 1);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);
    return date < minDate || date > maxDate;
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container">
      <h2>Book a Facility</h2>

      <label>Select Facility: </label>
      <select
        value={selectedFacility?._id || ""}
        onChange={(e) => {
          const facility = facilities.find((f) => f._id === e.target.value);
          setSelectedFacility(facility);
          setSelectedDate(null);
          setSelectedSlot("");
        }}
      >
        <option value="">-- Select Facility --</option>
        {facilities.map((facility) => (
          <option key={facility._id} value={facility._id}>
            {facility.name}
          </option>
        ))}
      </select>
      <label>
        <input type="checkbox" name="allowAlternate" /> Book alternate classroom
        if full
      </label>
      {selectedFacility && (
        <div style={{ marginTop: "1rem" }}>
          <label>Select Date: </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setSelectedSlot("");
            }}
            filterDate={(date) => !isDateDisabled(date)}
            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
            dateFormat="yyyy-MM-dd"
            placeholderText="Choose a date (Next 7 days only)"
          />
        </div>
      )}

      {selectedFacility && selectedDate && (
        <div style={{ marginTop: "2rem" }}>
          <h3>
            Slots for {selectedFacility.name} on{" "}
            {formatDisplayDate(selectedDate)}
          </h3>
          <label>Select Time Slot: </label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="">-- Select Time Slot --</option>
            {selectedFacility.slots.map((slot) => {
              const dateStr = selectedDate.toLocaleDateString("en-CA");
              const bookingsOnDate = slot.bookings.filter(
                (b) => b.date === dateStr
              ).length;
              const remaining = slot.capacity - bookingsOnDate;

              return (
                <option
                  key={slot.timeRange}
                  value={remaining > 0 ? slot.timeRange : ""}
                  disabled={remaining <= 0}
                >
                  {slot.timeRange} — Remaining: {remaining}
                </option>
              );
            })}
          </select>

          <br />
          <br />
          <button
            onClick={() => handleBooking(selectedFacility._id, selectedSlot)}
            disabled={!selectedSlot}
          >
            Book Slot
          </button>
        </div>
      )}
    </div>
  );
};

export default Facilities;
