import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState({
    username: "", email: "", phone: "", password: "", password2: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.password2) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages);
      } else {
        setError("Something went wrong. Please try again.");
      }
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
            Join the Local<br /><span>Food Community</span>
          </div>
          <p className="auth__desc">
            Create your free account and start exploring hundreds of
            authentic products from your neighborhood.
          </p>
          <div className="auth__features">
            <div className="auth__feature">
              <span className="auth__feature-text">Free to join, no hidden fees</span>
            </div>
            <div className="auth__feature">
              <span className="auth__feature-text">Your data is safe with us</span>
            </div>
            <div className="auth__feature">
              <span className="auth__feature-text">Special offer on first order</span>
            </div>
            <div className="auth__feature">
              <span className="auth__feature-text">Rate & review your purchases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth__right">
        <div className="auth__form-box">
          <div className="auth__form-header">
            <h2 className="auth__form-title">Create Account </h2>
            <p className="auth__form-subtitle">It's free and only takes a minute</p>
          </div>

          {error && (
            <div className="auth__error"><span>⚠️</span> {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth__row">
              <div className="auth__field">
                <label className="auth__label">Username</label>
                <div className="auth__input-wrap">
                  <input
                    className="auth__input"
                    type="text"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="auth__field">
                <label className="auth__label">Phone</label>
                <div className="auth__input-wrap">
                  <input
                    className="auth__input"
                    type="text"
                    name="phone"
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

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

            <div className="auth__row">
              <div className="auth__field">
                <label className="auth__label">Password</label>
                <div className="auth__input-wrap">
                  <input
                    className="auth__input"
                    type="password"
                    name="password"
                    placeholder="Min 8 chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="auth__field">
                <label className="auth__label">Confirm</label>
                <div className="auth__input-wrap">
                  <input
                    className="auth__input"
                    type="password"
                    name="password2"
                    placeholder="Repeat password"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button className="auth__submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create My Account →"}
            </button>
          </form>

          <div className="auth__divider">or</div>

          <p className="auth__footer">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;