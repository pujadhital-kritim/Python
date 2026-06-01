import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  // form state — stores what user types
  const [formData, setFormData] = useState({
    username:  "",
    email:     "",
    phone:     "",
    password:  "",
    password2: "",
  });

  const [error,   setError]   = useState("");   // error message
  const [loading, setLoading] = useState(false); // button loading state

  // runs every time user types in any input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // runs when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page refresh
    setError("");

    // simple frontend check
    if (formData.password !== formData.password2) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate("/");  // go to home after register
    } catch (err) {
      // show error from Django
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us today — it's free!</p>

        {/* show error if any */}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone (optional)</label>
            <input
              style={styles.input}
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              name="password2"
              placeholder="Confirm password"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

// inline styles
const styles = {
  container: {
    minHeight:      "100vh",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    backgroundColor:"#f0f2f5",
  },
  card: {
    backgroundColor: "#fff",
    padding:         "40px",
    borderRadius:    "12px",
    boxShadow:       "0 4px 20px rgba(0,0,0,0.1)",
    width:           "100%",
    maxWidth:        "420px",
  },
  title: {
    margin:     "0 0 6px",
    fontSize:   "26px",
    fontWeight: "700",
    color:      "#1a1a2e",
  },
  subtitle: {
    margin:     "0 0 24px",
    color:      "#666",
    fontSize:   "14px",
  },
  error: {
    backgroundColor: "#ffe0e0",
    color:           "#c0392b",
    padding:         "10px 14px",
    borderRadius:    "8px",
    marginBottom:    "16px",
    fontSize:        "14px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display:      "block",
    marginBottom: "6px",
    fontWeight:   "600",
    fontSize:     "14px",
    color:        "#333",
  },
  input: {
    width:        "100%",
    padding:      "10px 14px",
    borderRadius: "8px",
    border:       "1px solid #ddd",
    fontSize:     "14px",
    outline:      "none",
    boxSizing:    "border-box",
  },
  button: {
    width:           "100%",
    padding:         "12px",
    backgroundColor: "#4f46e5",
    color:           "#fff",
    border:          "none",
    borderRadius:    "8px",
    fontSize:        "16px",
    fontWeight:      "600",
    cursor:          "pointer",
    marginTop:       "8px",
  },
  link: {
    textAlign:  "center",
    marginTop:  "20px",
    fontSize:   "14px",
    color:      "#666",
  },
};

export default Register;