import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">

      {/* Left panel */}
      <div className="auth__left">
        <div className="auth__brand">
          <div className="auth__brand-logo">
            <div className="auth__brand-icon">🛒</div>
            <div className="auth__brand-name">Haat<span>Bazaar</span></div>
          </div>
          <div className="auth__tagline">
            Fresh Local Goods,<br /><span>Delivered to You</span>
          </div>
          <p className="auth__desc">
            Discover authentic Nepali products — from farm-fresh food to
            handcrafted art — sourced directly from your community.
          </p>
          <div className="auth__features">
            <div className="auth__feature">
              <span className="auth__feature-text">100% fresh & locally sourced</span>
            </div>
            <div className="auth__feature">
              <span className="auth__feature-text">Support local farmers & vendors</span>
            </div>
            <div className="auth__feature">
              <span className="auth__feature-text">Fast delivery to your doorstep</span>
            </div>
            <div className="auth__feature">
              <span className="auth__feature-text">Best prices, no middlemen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth__right">
        <div className="auth__form-box">
          <div className="auth__form-header">
            <h2 className="auth__form-title">Welcome back </h2>
            <p className="auth__form-subtitle">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="auth__error"><span>⚠️</span> {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label">Email Address</label>
              <div className="auth__input-wrap">
                <input
                  className="auth__input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Password</label>
              <div className="auth__input-wrap">
                <input
                  className="auth__input"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="auth__submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="auth__divider">or</div>

          <p className="auth__footer">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;