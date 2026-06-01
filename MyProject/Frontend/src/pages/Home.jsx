import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👋 Hello, {user?.username}!</h2>
        <p style={styles.info}>Email : {user?.email}</p>
        <p style={styles.info}>Phone : {user?.phone || "Not provided"}</p>
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
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
    textAlign:       "center",
  },
  title: {
    fontSize:   "24px",
    fontWeight: "700",
    color:      "#1a1a2e",
    marginBottom:"16px",
  },
  info: {
    fontSize:     "15px",
    color:        "#555",
    marginBottom: "10px",
  },
  button: {
    marginTop:       "20px",
    padding:         "12px 30px",
    backgroundColor: "#e74c3c",
    color:           "#fff",
    border:          "none",
    borderRadius:    "8px",
    fontSize:        "15px",
    fontWeight:      "600",
    cursor:          "pointer",
  },
};

export default Home;