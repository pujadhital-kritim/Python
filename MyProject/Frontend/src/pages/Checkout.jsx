import { useState }          from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar                from "../components/Navbar";
import Footer                from "../components/Footer";
import { useCart }           from "../context/CartContext";
import { useAuth }           from "../context/AuthContext";
import API                   from "../api/axios";
import "../styles/Checkout.css";


const OrderSuccess = ({ order, onViewOrders }) => (
  <div className="order-success">
    <div className="order-success__card">


      <div className="order-success__title">Order Placed!</div>
      <div className="order-success__sub">
        Thank you for shopping local! Your order has been placed
        successfully and is being processed.
      </div>

      {/* Order details */}
      <div className="order-success__details">
        <div className="order-success__detail-row">
          <span className="order-success__detail-label">Order ID</span>
          <span className="order-success__detail-val">#{order.id}</span>
        </div>
        <div className="order-success__detail-row">
          <span className="order-success__detail-label">Total Amount</span>
          <span className="order-success__detail-val">
            Rs. {Number(order.grand_total).toLocaleString()}
          </span>
        </div>
        <div className="order-success__detail-row">
          <span className="order-success__detail-label">Payment</span>
          <span className="order-success__detail-val" style={{ textTransform: "capitalize" }}>
            {order.payment_method === "khalti" ? "Khalti" : " eSewa"}
          </span>
        </div>
        <div className="order-success__detail-row">
          <span className="order-success__detail-label">Deliver to</span>
          <span className="order-success__detail-val">{order.city}</span>
        </div>
        <div className="order-success__detail-row">
          <span className="order-success__detail-label">Status</span>
          <span className="order-success__status"> Pending</span>
        </div>
      </div>

      {/* Actions */}
      <div className="order-success__actions">
        <button
          className="order-success__btn order-success__btn--primary"
          onClick={onViewOrders}
        >
           View My Orders
        </button>
        <Link to="/" className="order-success__btn order-success__btn--outline">
           Continue Shopping
        </Link>
      </div>

    </div>
  </div>
);

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user }             = useAuth();
  const navigate             = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    full_name:      user?.username || "",
    phone:          user?.phone    || "",
    address:        "",
    city:           "",
    payment_method: "khalti",  
  });

  const [errors,         setErrors]         = useState({});
  const [loading,        setLoading]        = useState(false);
  const [placedOrder,    setPlacedOrder]    = useState(null);  
  const [serverError,    setServerError]    = useState("");

  // Calculate totals
  const subtotal    = cart?.total || 0;
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const grandTotal  = subtotal + deliveryFee;

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Simple frontend validation
  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.phone.trim())     newErrors.phone     = "Phone number is required";
    if (formData.phone.length < 10) newErrors.phone     = "Enter valid phone number";
    if (!formData.address.trim())   newErrors.address   = "Address is required";
    if (!formData.city.trim())      newErrors.city      = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handlePlaceOrder = async () => {
  //  Validate form
  if (!validate()) return;

  if (!cart?.items?.length) {
    setServerError("Your cart is empty!");
    return;
  }

  setLoading(true);
  setServerError("");

  try {
    //  Place the order first
    const orderRes = await API.post("/orders/place/", formData);
    const order    = orderRes.data.order;

    // Clear cart state
    await clearCart();

    //  Initiate Khalti payment with the order id
    const paymentRes = await API.post("/payment/initiate/", {
      order_id: order.id,
    });

    //  Redirect to Khalti payment page Khalti gives us a payment_url  we redirect user there
    const paymentUrl = paymentRes.data.payment_url;
    window.location.href = paymentUrl;

  } catch (err) {
    const data = err.response?.data;
    if (data?.error) {
      setServerError(data.error);
    } else {
      setServerError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }
};

  if (placedOrder) {
    return (
      <div>
        <Navbar />
        <OrderSuccess
          order={placedOrder}
          onViewOrders={() => navigate("/orders")}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      {/* Header */}
      <div className="checkout-page__header">
        <div className="checkout-page__header-icon">🛍️</div>
        <div>
          <div className="checkout-page__header-title">Checkout</div>
          <div className="checkout-page__header-sub">
            Complete your order details below
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="checkout-steps">
        <div className="checkout-step checkout-step--done">
          <div className="checkout-step__num">✓</div>
          <div className="checkout-step__label">Cart</div>
        </div>
        <div className="checkout-step checkout-step--active">
          <div className="checkout-step__num">2</div>
          <div className="checkout-step__label">Checkout</div>
        </div>
        <div className="checkout-step">
          <div className="checkout-step__num">3</div>
          <div className="checkout-step__label">Payment</div>
        </div>
        <div className="checkout-step">
          <div className="checkout-step__num">4</div>
          <div className="checkout-step__label">Confirmation</div>
        </div>
      </div>

      {/* Body */}
      <div className="checkout-body">

        {/* Left — Forms */}
        <div className="checkout-form-panel">

          {/* Server error */}
          {serverError && (
            <div style={{
              background: "#ffebee", border: "1px solid #ffcdd2",
              borderLeft: "4px solid #e53935",
              padding: "12px 16px", borderRadius: 8,
              fontSize: 13.5, color: "#c62828",
              display: "flex", alignItems: "center", gap: 8
            }}>
               {serverError}
            </div>
          )}

          {/* Delivery Info */}
          <div className="checkout-card">
            <div className="checkout-card__header">
              <span className="checkout-card__header-title">Delivery Information</span>
            </div>
            <div className="checkout-card__body">

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Full Name *</label>
                  <input
                    className={`form-input ${errors.full_name ? "form-input--error" : ""}`}
                    type="text"
                    name="full_name"
                    placeholder="Your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                  {errors.full_name && (
                    <span className="form-error">⚠️ {errors.full_name}</span>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">Phone Number *</label>
                  <input
                    className={`form-input ${errors.phone ? "form-input--error" : ""}`}
                    type="text"
                    name="phone"
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <span className="form-error">⚠️ {errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-row form-row--full">
                <div className="form-field">
                  <label className="form-label">Full Address *</label>
                  <input
                    className={`form-input ${errors.address ? "form-input--error" : ""}`}
                    type="text"
                    name="address"
                    placeholder="Street, Tole, Ward No."
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {errors.address && (
                    <span className="form-error">⚠️ {errors.address}</span>
                  )}
                </div>
              </div>

              <div className="form-row form-row--full">
                <div className="form-field">
                  <label className="form-label">City *</label>
                  <input
                    className={`form-input ${errors.city ? "form-input--error" : ""}`}
                    type="text"
                    name="city"
                    placeholder="Kathmandu, Pokhara, Lalitpur..."
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && (
                    <span className="form-error">⚠️ {errors.city}</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-card">
            <div className="checkout-card__header">
              <span className="checkout-card__header-title">Payment Method</span>
            </div>
            <div className="checkout-card__body">
              <div className="payment-methods">

                {/* Khalti */}
                <div
                  className={`payment-method ${formData.payment_method === "khalti" ? "payment-method--active" : ""}`}
                  onClick={() => setFormData({ ...formData, payment_method: "khalti" })}
                >
                  <div className="payment-method__radio">
                    {formData.payment_method === "khalti" && (
                      <div className="payment-method__radio-dot" />
                    )}
                  </div>
                  
                  <div className="payment-method__info">
                    <div className="payment-method__name">Khalti</div>
                    <div className="payment-method__desc">
                      Pay securely with Khalti digital wallet
                    </div>
                  </div>
                  <span className="payment-method__badge">Popular</span>
                </div>

                {/* eSewa */}
                <div
                  className={`payment-method ${formData.payment_method === "esewa" ? "payment-method--active" : ""}`}
                  onClick={() => setFormData({ ...formData, payment_method: "esewa" })}
                >
                  <div className="payment-method__radio">
                    {formData.payment_method === "esewa" && (
                      <div className="payment-method__radio-dot" />
                    )}
                  </div>
                  
                  <div className="payment-method__info">
                    <div className="payment-method__name">eSewa</div>
                    <div className="payment-method__desc">
                      Pay securely with eSewa digital wallet
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Right — Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary__header">
            <div className="checkout-summary__title">Order Summary</div>
          </div>
          <div className="checkout-summary__body">

            {/* Cart items preview */}
            <div className="checkout-summary__items">
              {cart?.items?.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div className="checkout-summary-item__info">
                    <div className="checkout-summary-item__name">{item.product_name}</div>
                    <div className="checkout-summary-item__qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="checkout-summary-item__price">
                    Rs. {Number(item.subtotal).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="checkout-price-row">
              <span className="checkout-price-row__label">
                Subtotal ({cart?.item_count || 0} items)
              </span>
              <span className="checkout-price-row__val">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="checkout-price-row">
              <span className="checkout-price-row__label">Delivery Fee</span>
              <span className={`checkout-price-row__val ${deliveryFee === 0 ? "checkout-price-row__val--green" : ""}`}>
                {deliveryFee === 0 ? "FREE " : `Rs. ${deliveryFee}`}
              </span>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-total">
              <span className="checkout-total__label">Grand Total</span>
              <span className="checkout-total__val">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>

           <button
  className="place-order-btn"
  onClick={handlePlaceOrder}
  disabled={loading || !cart?.items?.length}
>
  {loading
    ? "Processing..."
    : `Pay with ${formData.payment_method === "khalti" ? " Khalti" : "eSewa"} · Rs. ${grandTotal.toLocaleString()}`
  }
</button>

            {/* Back to cart */}
            <Link to="/cart" className="back-to-cart-btn">
              ← Back to Cart
            </Link>

          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Checkout;