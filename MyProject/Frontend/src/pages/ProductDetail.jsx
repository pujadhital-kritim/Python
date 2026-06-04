import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}/`);
        setProduct(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Product not found.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="pd-state">
          <div className="pd-spinner" />
          <p>Loading product…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="pd-state pd-state--error">
          <span className="pd-state__icon">✕</span>
          <p>{error}</p>
          <button className="pd-btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Support both a single image field OR an images array
  const images = product.images?.length
    ? product.images
    : product.image
    ? [{ image: product.image }]
    : [];

  return (
    <div>
      <Navbar />

      <div className="pd-page">
        {/* ── Back ── */}
        <button className="pd-back" onClick={() => navigate(-1)}>
          <span className="pd-back__arrow">←</span> Back
        </button>

        <div className="pd-grid">
          {/* ── Gallery ── */}
          <section className="pd-gallery">
            <div className="pd-gallery__main">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]?.image || images[activeImg]}
                  alt={product.name}
                  className="pd-gallery__img"
                />
              ) : (
                <div className="pd-gallery__placeholder">No Image</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="pd-gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-gallery__thumb ${
                      i === activeImg ? "pd-gallery__thumb--active" : ""
                    }`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img
                      src={img?.image || img}
                      alt={`${product.name} ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── Info ── */}
          <section className="pd-info">
            {product.tag && <span className="pd-tag">{product.tag}</span>}

            <h1 className="pd-info__name">{product.name}</h1>

            {product.price !== undefined && (
              <p className="pd-info__price">
                Rs.{" "}
                {Number(product.price).toLocaleString("en-NP", {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}

            {product.description && (
              <div className="pd-info__section">
                <h2 className="pd-info__label">Description</h2>
                <p className="pd-info__desc">{product.description}</p>
              </div>
            )}

            {product.stock !== undefined && (
              <div className="pd-info__section">
                <h2 className="pd-info__label">Availability</h2>
                <span
                  className={`pd-stock ${
                    product.stock > 0 ? "pd-stock--in" : "pd-stock--out"
                  }`}
                >
                  {product.stock > 0
                    ? `In Stock (${product.stock} left)`
                    : "Out of Stock"}
                </span>
              </div>
            )}

            <div className="pd-actions">
              <button className="pd-btn pd-btn--primary">Add to Cart</button>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}