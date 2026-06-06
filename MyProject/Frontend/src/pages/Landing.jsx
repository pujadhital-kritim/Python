import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "../styles/Landing.css";
import { useCart } from "../context/CartContext";




const TAGS = ["All", "Food", "Handicraft", "Clothing", "Herbs", "Dairy", "Art", "Pottery", "Jewelry", "Grains", "Honey"];

const FEATURES = [
  { icon: "🌿", title: "100% Local & Fresh",    desc: "Every product is sourced directly from local artisans and farmers across Nepal." },
  { icon: "🚚", title: "Fast Delivery",          desc: "Quick doorstep delivery across Kathmandu Valley and major cities." },
  { icon: "💰", title: "Best Local Prices",      desc: "No middlemen — buy directly from the source at the best prices." },
  { icon: "🤝", title: "Support Local Economy",  desc: "Every purchase supports a local family and strengthens our community." },
];



const SkeletonCard = () => (
  <div className="sk-card">
    <div className="skeleton sk-img" />
    <div className="sk-body">
      <div className="skeleton sk-line sk-line--s" />
      <div className="skeleton sk-line sk-line--m" />
      <div className="skeleton sk-line sk-line--f" />
      <div className="skeleton sk-line sk-line--s" />
    </div>
  </div>
);

const LoginModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal__title">Login Required</div>
      <div className="modal__desc">
        You need to be logged in to add items to cart or place orders.
        It's free and takes less than a minute!
      </div>
      <div className="modal__actions">
        <Link to="/login"    className="modal__btn modal__btn--primary">Login Now</Link>
        <Link to="/register" className="modal__btn modal__btn--outline">Register Free</Link>
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const isOut = product.stock === 0;
  const isLow = !isOut && product.stock <= 5;
  const { addToCart } = useCart();
const [addingId, setAddingId] = useState(null);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // prevent card click
    onAddToCart(product);
  };
  

 

  return (
    <div className="pcard" onClick={handleCardClick}>
      <div className="pcard__badges">
        {isOut  && <span className="pcard__badge pcard__badge--out">Out of Stock</span>}
        {isLow  && <span className="pcard__badge pcard__badge--hot">Only {product.stock} left!</span>}
        {!isOut && !isLow && product.id % 4 === 0 && <span className="pcard__badge pcard__badge--new">New</span>}
      </div>


      {/* Image */}
      <div className="pcard__img-wrap">
        {product.image
          ? <img className="pcard__img" src={product.image.startsWith("http") ? product.image : `http://127.0.0.1:8000${product.image}`} alt={product.name} />
          : <div className="pcard__emoji">{getEmoji(product.tag)}</div>
        }
      </div>

      {/* Body */}
      <div className="pcard__body">
        {product.tag && <div className="pcard__tag">{product.tag}</div>}
        <div className="pcard__name">{product.name}</div>
        <div className="pcard__desc">{product.description || "Authentic local product from Nepal"}</div>

        <div className={`pcard__stock ${isOut ? "pcard__stock--out" : isLow ? "pcard__stock--low" : ""}`}>
          <span className={`pcard__stock-dot ${isOut ? "pcard__stock-dot--out" : isLow ? "pcard__stock-dot--low" : ""}`} />
          {isOut ? "Out of Stock" : isLow ? `Only ${product.stock} left` : "In Stock"}
        </div>

        <div className="pcard__footer">
          <div>
            <span className="pcard__price">Rs. {Number(product.price).toLocaleString()}</span>
            <span className="pcard__price-unit"> /item</span>
          </div>
          <button
            className="pcard__add"
            onClick={handleAddToCart}
            disabled={isOut}
            title={isOut ? "Out of stock" : "Add to cart"}
          >+</button>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const { user }                     = useAuth();
  const navigate                      = useNavigate();
  const [searchParams]                = useSearchParams();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTag, setActiveTag]     = useState("All");
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);

   const { addToCart } = useCart();
const [addingId, setAddingId] = useState(null);
const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [activeTag, search]);

  const showToast = (message, type = "success") => {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 2500);
};

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) setActiveTag(tag.charAt(0).toUpperCase() + tag.slice(1));
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/products/?";
      if (search)                           url += `search=${search}&`;
      if (activeTag && activeTag !== "All") url += `tag=${activeTag}&`;
      const res = await API.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
  // not logged in → show login modal
  if (!user) {
    setShowModal(true);
    return;
  }

  setAddingId(product.id);

  // call CartContext function
  const result = await addToCart(product.id, 1);

  if (result.success) {
    showToast(`"${product.name}" added to cart! 🛒`);
  } else {
    showToast(result.message, "error");
  }

  setAddingId(null);
};

  const handleSearch = (val) => setSearch(val);


 
  return (
    <div>
      <Navbar onSearch={handleSearch} />

      {showModal && <LoginModal onClose={() => setShowModal(false)} />}

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">🌿 100% Local · 100% Authentic</div>
          <h1 className="hero__title">
            Your Local <span>Haat</span><br />Now Online
          </h1>
          <p className="hero__subtitle">
            Shop authentic Nepali products directly from local farmers,
            artisans, and home producers. From food to handicrafts —
            everything local, everything real.
          </p>
          <div className="hero__actions">
            <a href="#products" className="hero__btn hero__btn--primary">
               Shop Now
            </a>
            {!user && (
              <Link to="/register" className="hero__btn hero__btn--outline">
                Join Free →
              </Link>
            )}
          </div>
          <div className="hero__trust">
            <div className="hero__trust-item">Verified Sellers</div>
            <div className="hero__trust-item">Secure Payments</div>
            <div className="hero__trust-item"> Easy Returns</div>
          </div>
        </div>

        <div className="hero__right">
          <div className="hero__stat-card">
            <div className="hero__stat-icon">🛍️</div>
            <div className="hero__stat-num">{products.length || "500"}+</div>
            <div className="hero__stat-label">Local Products</div>
          </div>
          <div className="hero__stat-card">
            <div className="hero__stat-icon">🤝</div>
            <div className="hero__stat-num">120+</div>
            <div className="hero__stat-label">Local Sellers</div>
          </div>
          <div className="hero__stat-card">
            <div className="hero__stat-icon">⭐</div>
            <div className="hero__stat-num">4.8</div>
            <div className="hero__stat-label">Avg. Rating</div>
          </div>
        </div>
      </section>

       {toast && (
  <div className={`toast toast--${toast.type}`}>
    {toast.message}
  </div>
)}

      {/* ── Products ── */}
      <section className="section section--grey" id="products">
        <div className="section__header">
          <div>
            <h2 className="section__title">Fresh <span>Local Products</span></h2>
            <p className="section__sub">
              {user
                ? `Welcome back, ${user.username}! Here's what's available today.`
                : "Browse our products — login to add to cart & order"}
            </p>
          </div>
          {!user && (
            <Link to="/login" className="section__link">
              Login to Order →
            </Link>
          )}
        </div>

        {/* Tag filter pills */}
        <div className="tag-pills">
          {TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-pill ${activeTag === tag ? "tag-pill--active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="products-grid">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No products found</div>
            <div className="empty-state__sub">Try a different tag or search</div>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section className="section section--white">
        <div className="section__header">
          <div>
            <h2 className="section__title">Why <span>Haat Bazaar?</span></h2>
            <p className="section__sub">What makes us different from the rest</p>
          </div>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!user && (
        <div className="cta-banner">
          <div className="cta-banner__content">
            <div className="cta-banner__title">Ready to Shop Local? </div>
            <div className="cta-banner__sub">
              Join thousands of Nepalis supporting local — create your free account today.
            </div>
          </div>
          <div className="cta-banner__actions">
            <Link to="/register" className="cta-btn cta-btn--white">Create Free Account</Link>
            <Link to="/login"    className="cta-btn cta-btn--outline">Login</Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Landing;