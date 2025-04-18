import { useEffect, useState } from "react";
import api from "../api";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const res = await api.get("/bookings/my-bookings");
    setBookings(res.data);
  };

  const cancelBooking = async (id) => {
    try {
      await api.delete(`/bookings/cancel/${id}`);
      alert("Booking cancelled");
      fetchBookings();
    } catch (err) {
      alert("Error cancelling: " + err.response.data.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="container">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((b) => (
          <div key={b._id}>
            <p>
              <strong>{b.facilityId?.name}</strong> <br />
              📅 Date: {new Date(b.date).toDateString()} <br />⏰ Slot:{" "}
              {b.slotTime}
            </p>
            <button onClick={() => cancelBooking(b._id)}>Cancel</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Bookings;
