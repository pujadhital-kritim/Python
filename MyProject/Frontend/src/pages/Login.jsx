import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({
    email:    "",
    password: "",
  });

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/");  // go to home after login
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) {
        setError(data.error);
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
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight:       "100vh",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "#f0f2f5",
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
    textAlign: "center",
    marginTop: "20px",
    fontSize:  "14px",
    color:     "#666",
  },
};

export default Login;