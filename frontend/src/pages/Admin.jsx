import { useEffect, useState } from "react";
import api from "../api";

const Admin = () => {
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", slots: "" });

  const fetchFacilities = async () => {
    const res = await api.get("/facilities");
    setFacilities(res.data);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addFacility = async (e) => {
    e.preventDefault();
    const slots = form.slots.split(",").map((s) => ({
      time: s.trim(),
      capacity: 10,
      booked: 0,
    }));

    try {
      await api.post("/facilities", {
        name: form.name,
        description: form.description,
        slots,
      });
      alert("Facility added!");
      setForm({ name: "", description: "", slots: "" });
      fetchFacilities();
    } catch (err) {
      alert("Error adding facility: " + err.response.data.message);
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <form onSubmit={addFacility}>
        <input
          name="name"
          placeholder="Facility Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="slots"
          placeholder="Comma-separated slots (e.g. 9-12,1-3)"
          value={form.slots}
          onChange={handleChange}
        />
        <button type="submit">Add Facility</button>
      </form>

      <h3>All Facilities</h3>
      {facilities.map((f) => (
        <div key={f._id}>
          <strong>{f.name}</strong>: {f.description}
          <ul>
            {f.slots.map((s) => (
              <li key={s.time}>
                {s.time} (Capacity: {s.capacity})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Admin;
