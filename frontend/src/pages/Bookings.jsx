import { useEffect, useState } from "react";
import api from "../api";

const BOOKINGS_PER_PAGE = 3;

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my-bookings");
      const sorted = res.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setBookings(sorted);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.delete(`/bookings/cancel/${id}`);
      alert("Booking cancelled");
      fetchBookings();
    } catch (err) {
      alert(
        "Error cancelling: " +
          (err.response?.data?.message || "Something went wrong")
      );
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const bookingDate = new Date(b.date).setHours(0, 0, 0, 0);
    return filter === "upcoming" ? bookingDate >= today : bookingDate < today;
  });

  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const facility = booking.facilityId?.name || "Unknown Facility";
    if (!acc[facility]) acc[facility] = [];
    acc[facility].push(booking);
    return acc;
  }, {});

  const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
  const endIndex = startIndex + BOOKINGS_PER_PAGE;

  const paginatedGroups = Object.entries(groupedBookings).map(
    ([facility, bks]) => {
      return {
        facility,
        bookings: bks.slice(startIndex, endIndex),
        total: bks.length,
      };
    }
  );

  const totalFilteredBookings = filteredBookings.length;
  const totalPages = Math.ceil(totalFilteredBookings / BOOKINGS_PER_PAGE);

  return (
    <div
      className="container"
      style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}
    >
      <h2
        style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}
      >
        📋 My Bookings
      </h2>

      {/* Filter Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => {
            setFilter("upcoming");
            setCurrentPage(1);
          }}
          className={
            filter === "upcoming" ? "btn btn-primary" : "btn btn-light"
          }
        >
          Upcoming
        </button>
        <button
          onClick={() => {
            setFilter("past");
            setCurrentPage(1);
          }}
          className={filter === "past" ? "btn btn-primary" : "btn btn-light"}
        >
          Past
        </button>
      </div>

      {/* Bookings */}
      {totalFilteredBookings === 0 ? (
        <p style={{ textAlign: "center" }}>No {filter} bookings found.</p>
      ) : (
        paginatedGroups.map(({ facility, bookings }) => (
          <div key={facility} style={{ marginBottom: "30px" }}>
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "10px",
                color: "#007bff",
              }}
            >
              🏟️ {facility}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {bookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    flex: "1 1 280px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <p>
                    📅 <strong>Date:</strong> {new Date(b.date).toDateString()}
                  </p>
                  <p>
                    ⏰ <strong>Slot:</strong> {b.slotTime}
                  </p>
                  <button
                    className="btn btn-danger"
                    onClick={() => cancelBooking(b._id)}
                    style={{ marginTop: "10px" }}
                  >
                    Cancel Booking
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{ marginRight: "10px" }}
          >
            Prev
          </button>
          <span style={{ fontWeight: "bold" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ marginLeft: "10px" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
