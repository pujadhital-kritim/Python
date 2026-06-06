import { useState }            from "react";
import { Link, useNavigate }   from "react-router-dom";
import Navbar                  from "../components/Navbar";
import Footer                  from "../components/Footer";
import { useCart }             from "../context/CartContext";
import "../styles/Cart.css";


const Toast = ({ msg, type }) => (
  <div className={`cart-toast ${type === "error" ? "cart-toast--error" : ""}`}>
    <span>{type === "error" ? "❌" : "✅"}</span> {msg}
  </div>
);

/* Single Cart Item Component  */
const CartItem = ({ item, onUpdate, onRemove }) => {
  const [updating, setUpdating] = useState(false);

  
  const handleDecrease = async () => {
    setUpdating(true);
    if (item.quantity === 1) {
      await onRemove(item.id);
    } else {
      await onUpdate(item.id, item.quantity - 1);
    }
    setUpdating(false);
  };

  const handleIncrease = async () => {
    setUpdating(true);
    await onUpdate(item.id, item.quantity + 1);
    setUpdating(false);
  };

  const handleRemove = async () => {
    setUpdating(true);
    await onRemove(item.id);
    setUpdating(false);
  };

  const isLowStock = item.product_stock <= 5;

  return (
    <div className="cart-item">

      

      {/* Info */}
      <div className="cart-item__info">
        <div className="cart-item__name">{item.product_name}</div>
        <div className="cart-item__price-unit">
          <strong>Rs. {Number(item.product_price).toLocaleString()}</strong> per item
        </div>

        {/* Low stock warning */}
        {isLowStock && (
          <div className="cart-item__stock-warn">
            ⚠️ Only {item.product_stock} left in stock!
          </div>
        )}

        {/* Quantity controls */}
        <div className="cart-item__qty">
          <button
            className="cart-item__qty-btn"
            onClick={handleDecrease}
            disabled={updating}
            title={item.quantity === 1 ? "Remove item" : "Decrease"}
          >−</button>

          <span className="cart-item__qty-val">
            {updating ? "..." : item.quantity}
          </span>

          <button
            className="cart-item__qty-btn"
            onClick={handleIncrease}
            disabled={updating || item.quantity >= item.product_stock}
            title="Increase quantity"
          >+</button>
        </div>
      </div>

      {/* Subtotal + Remove */}
      <div className="cart-item__right">
        <div className="cart-item__subtotal">
          Rs. {Number(item.subtotal).toLocaleString()}
        </div>
        <button
          className="cart-item__remove"
          onClick={handleRemove}
          disabled={updating}
          title="Remove from cart"
        >Remove</button>
      </div>
    </div>
  );
};

/* ── Order Summary Component ── */
const OrderSummary = ({ cart, onCheckout }) => {
  const [promo, setPromo] = useState("");

  const subtotal = cart?.total    || 0;
  const delivery = subtotal >= 500 ? 0 : 50;  // free delivery above Rs.500
  const total    = subtotal + delivery;

  return (
    <div className="order-summary">
      <div className="order-summary__header">
        <div className="order-summary__title"> Order Summary</div>
      </div>

      <div className="order-summary__body">
        <div className="summary-row">
          <span className="summary-row__label">
            Subtotal ({cart?.item_count || 0} items)
          </span>
          <span className="summary-row__val">
            Rs. {subtotal.toLocaleString()}
          </span>
        </div>

        <div className="summary-row">
          <span className="summary-row__label">Delivery Fee</span>
          <span className={`summary-row__val ${delivery === 0 ? "summary-row__val--green" : ""}`}>
            {delivery === 0 ? "FREE " : `Rs. ${delivery}`}
          </span>
        </div>

        {/* Free delivery hint */}
        {delivery > 0 && (
          <div className="summary-row">
            <span style={{ fontSize: "12px", color: "var(--primary)" }}>
               Add Rs. {500 - subtotal} more for free delivery!
            </span>
          </div>
        )}

        <div className="summary-divider" />

        <div className="summary-total">
          <span className="summary-total__label">Total</span>
          <span className="summary-total__val">
            Rs. {total.toLocaleString()}
          </span>
        </div>

        {/* Checkout button */}
        <button
          className="checkout-btn"
          onClick={onCheckout}
          disabled={!cart?.items?.length}
        >
           Proceed to Checkout
        </button>

        {/* Continue shopping */}
        <Link to="/" className="continue-btn">
           Continue Shopping
        </Link>

        {/* Promo code */}
        <div className="promo-box">
          <div className="promo-box__label">Have a Promo Code?</div>
          <div className="promo-box__row">
            <input
              className="promo-box__input"
              placeholder="Enter code"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
            <button className="promo-box__btn">Apply</button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="safe-badges">
          <div className="safe-badge"> Secure</div>
          <div className="safe-badge"> Easy Returns</div>
          <div className="safe-badge"> Verified</div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Cart Page ── */
const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (itemId, quantity) => {
    const result = await updateQuantity(itemId, quantity);
    if (!result.success) showToast(result.message, "error");
  };

  const handleRemove = async (itemId) => {
    const result = await removeItem(itemId);
    if (result.success) {
      showToast("Item removed from cart");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all items from cart?")) return;
    await clearCart();
    showToast("Cart cleared!");
  };

  const handleCheckout = () => {
    navigate("/checkout");  // Phase 4
  };

  return (
    <div className="cart-page">
      <Navbar />

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="cart-page__header">
        <div className="cart-page__header-icon">🛒</div>
        <div>
          <div className="cart-page__header-title">My Cart</div>
          <div className="cart-page__header-sub">
            {cart?.item_count
              ? `${cart.item_count} item${cart.item_count > 1 ? "s" : ""} in your cart`
              : "Your cart is empty"}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="cart-steps">
        <div className="cart-step cart-step--active">
          <div className="cart-step__num">1</div>
          <div className="cart-step__label">Cart</div>
        </div>
        <div className="cart-step">
          <div className="cart-step__num">2</div>
          <div className="cart-step__label">Checkout</div>
        </div>
        <div className="cart-step">
          <div className="cart-step__num">3</div>
          <div className="cart-step__label">Payment</div>
        </div>
        <div className="cart-step">
          <div className="cart-step__num">4</div>
          <div className="cart-step__label">Confirmation</div>
        </div>
      </div>

      {/* Body */}
      <div className="cart-body">

        {/* Left — Items */}
        <div className="cart-items-panel">
          <div className="cart-items-panel__header">
            <div className="cart-items-panel__title">
               Cart Items
              {cart?.items?.length > 0 && (
                <span className="cart-items-panel__count">
                  {cart.items.length}
                </span>
              )}
            </div>
            {cart?.items?.length > 0 && (
              <button
                className="cart-items-panel__clear"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="cart-loading">
              <div className="cart-spinner" />
              <span>Loading your cart...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && (!cart?.items || cart.items.length === 0) && (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <div className="cart-empty__title">Your cart is empty!</div>
              <div className="cart-empty__sub">
                Explore our local products and find something you love!
              </div>
              <Link to="/" className="cart-empty__btn">
                 Start Shopping
              </Link>
            </div>
          )}

          {/* Items */}
          {!loading && cart?.items?.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Right  Summary */}
        <OrderSummary cart={cart} onCheckout={handleCheckout} />
      </div>

      <Footer />
    </div>
  );
};

export default Cart;