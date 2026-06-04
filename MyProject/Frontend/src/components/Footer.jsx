import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => (
  <footer className="footer">

    {/* Main grid */}
    <div className="footer__main">

      {/* Brand */}
      <div>
        <Link to="/" className="footer__logo">
          <div className="footer__logo-name">Haat<span>Bazaar</span></div>
        </Link>
        <p className="footer__brand-desc">
          Nepal's trusted marketplace for authentic local products.
          Connecting artisans, farmers, and craftspeople with buyers across the country.
        </p>
        <div className="footer__contact">
          <div className="footer__contact-item"> Kathmandu, Nepal</div>
          <div className="footer__contact-item"> info@haatbazaar.com.np</div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <div className="footer__col-title">Quick Links</div>
        <ul className="footer__links">
          <li><Link to="/"           className="footer__link">Home</Link></li>
          <li><Link to="/#products"  className="footer__link">All Products</Link></li>
          <li><Link to="/orders"     className="footer__link">My Orders</Link></li>
          <li><Link to="/cart"       className="footer__link">My Cart</Link></li>
          <li><Link to="/profile"    className="footer__link">My Profile</Link></li>
        </ul>
      </div>

      {/* Categories */}
      <div>
        <div className="footer__col-title">Categories</div>
        <ul className="footer__links">
          <li><Link to="/?tag=food"       className="footer__link">Local Food</Link></li>
          <li><Link to="/?tag=handicraft" className="footer__link">Handicrafts</Link></li>
          <li><Link to="/?tag=clothing"   className="footer__link">Clothing</Link></li>
          <li><Link to="/?tag=herbs"      className="footer__link">Herbs & Spices</Link></li>
          <li><Link to="/?tag=dairy"      className="footer__link">Dairy</Link></li>
          <li><Link to="/?tag=art"        className="footer__link">Art & Crafts</Link></li>
        </ul>
      </div>

    </div>

    <div className="footer__divider" />

    <div className="footer__bottom">
      <div className="footer__copyright">
        © 2024 <span>HaatBazaar</span> 
      </div>
      <div className="footer__payments">
        <span className="footer__payment-label">We accept:</span>
        <span className="footer__payment-badge">Khalti</span>
        <span className="footer__payment-badge">eSewa</span>
        
      </div>
      <div className="footer__bottom-links">
        <a href="#" className="footer__bottom-link">Privacy</a>
        <a href="#" className="footer__bottom-link">Terms</a>
        <a href="#" className="footer__bottom-link">Returns</a>
      </div>
    </div>

  </footer>
);

export default Footer;