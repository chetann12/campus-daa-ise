import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" style={styles.navbar}>
      <h2 style={styles.logo}>🏫 Campus Booking</h2>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          Home
        </Link>

        {user ? (
          <>
            <Link to="/facilities" style={styles.link}>
              Facilities
            </Link>
            <Link to="/bookings" style={styles.link}>
              My Bookings
            </Link>

            {user.role === "admin" && (
              <Link to="/admin" style={styles.link}>
                Admin
              </Link>
            )}

            <span style={styles.welcome}>Hi, {user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#2E2E2E",
    color: "#fff",
    alignItems: "center",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500",
  },
  welcome: {
    color: "#90EE90",
    fontWeight: "bold",
  },
  logoutBtn: {
    padding: "0.4rem 0.8rem",
    backgroundColor: "#F44336",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Navbar;
