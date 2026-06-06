import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import { useCart } from "../context/CartContext";

const Navbar = ({ onSearch }) => {
  const { user, logout }         = useAuth();
  const navigate                  = useNavigate();
  const [dropdown, setDropdown]   = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const dropdownRef               = useRef(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdown(false);
    await logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  return (
    <header>
      {/* Top strip */}
      <div className="topstrip">
        <div className="topstrip__msg">
          <span>🚚</span>
          Free delivery on orders above Rs. 500 · Authentic local products
        </div>
        <div className="topstrip__links">
          <a href="#" className="topstrip__link">Sell on Haat Bazaar</a>
          <a href="#" className="topstrip__link">Help</a>
          <a href="#" className="topstrip__link">Track Order</a>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">Haat<span>Bazaar</span></span>
        </Link>

        <form className="navbar__search" onSubmit={handleSearch}>
          <input
            className="navbar__search-input"
            type="text"
            placeholder="Search local products, handicrafts, food..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button className="navbar__search-btn" type="submit">
             Search
          </button>
        </form>

        <div className="navbar__right">
          {user ? (
            <>
             <Link to="/cart" className="navbar__icon-btn">
  <span className="navbar__icon-btn-icon">🛒</span>
  <span className="navbar__icon-btn-label">Cart</span>
  {/* shows count only when cart has items */}
  {cartCount > 0 && (
    <span className="navbar__badge">{cartCount}</span>
  )}
</Link>

              <Link to="/orders" className="navbar__icon-btn">
                <span className="navbar__icon-btn-icon">📦</span>
                <span className="navbar__icon-btn-label">Orders</span>
              </Link>

              {/* User dropdown */}
              <div
                className="navbar__user"
                ref={dropdownRef}
                onClick={() => setDropdown(!dropdown)}
              >
                <div className="navbar__user-avatar">
                  {user.username?.charAt(0)}
                </div>
                <span className="navbar__user-label">
                  {user.username?.split(" ")[0]}
                </span>

                {dropdown && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__dropdown-name">{user.username}</div>
                      <div className="navbar__dropdown-email">{user.email}</div>
                    </div>
                    <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropdown(false)}>
                       My Profile
                    </Link>
                    <Link to="/orders" className="navbar__dropdown-item" onClick={() => setDropdown(false)}>
                       My Orders
                    </Link>
                    <Link to="/cart" className="navbar__dropdown-item" onClick={() => setDropdown(false)}>
                       My Cart
                    </Link>
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                       Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="navbar__auth-btn navbar__auth-btn--outline">Login</button>
              </Link>
              <Link to="/register">
                <button className="navbar__auth-btn navbar__auth-btn--solid">Register</button>
              </Link>
            </>
          )}
        </div>
      </nav>

     
    </header>
  );
};

export default Navbar;