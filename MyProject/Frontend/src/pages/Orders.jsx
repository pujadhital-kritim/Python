import { useState, useEffect } from "react";
import { Link }                from "react-router-dom";
import Navbar                  from "../components/Navbar";
import Footer                  from "../components/Footer";
import API                     from "../api/axios";
import "../styles/Orders.css";



const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-NP", {
    year: "numeric", month: "short", day: "numeric",
  });
};

// Status config  color and icon for each status
const STATUS_CONFIG = {
  pending:   { label: "Pending", cls: "order-status--pending"   },
  confirmed: { label: "Confirmed", cls: "order-status--confirmed" },
  shipped:   { label: "Shipped", cls: "order-status--shipped"   },
  delivered: { label: "Delivered", cls: "order-status--delivered" },
  cancelled: { label: "Cancelled", cls: "order-status--cancelled" },
};

// Tracking steps in order
const TRACKING_STEPS = [
  { key: "pending",   icon: "📝", label: "Order Placed"  },
  { key: "confirmed", icon: "✅", label: "Confirmed"     },
  { key: "shipped",   icon: "🚚", label: "Shipped"       },
  { key: "delivered", icon: "📦", label: "Delivered"     },
];

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

const OrderDetailModal = ({ order, onClose, onCancel }) => {
  const statusIdx  = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="order-detail-overlay" onClick={onClose}>
      <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="order-detail-modal__header">
          <div className="order-detail-modal__title">
            Order #{order.id}
          </div>
          <button className="order-detail-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="order-detail-modal__body">

          {/* Order Tracking */}
          {!isCancelled && (
            <div className="order-detail-section">
              <div className="order-detail-section__title"> Order Tracking</div>
              <div className="order-tracking">
                {TRACKING_STEPS.map((step, idx) => {
                  const isDone   = idx < statusIdx;
                  const isActive = idx === statusIdx;
                  return (
                    <div
                      key={step.key}
                      className={`tracking-step ${isDone ? "tracking-step--done" : ""} ${isActive ? "tracking-step--active" : ""}`}
                    >
                      <div className="tracking-step__icon">{step.icon}</div>
                      <div className="tracking-step__label">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled banner */}
          {isCancelled && (
            <div style={{
              background: "#ffebee", border: "1px solid #ffcdd2",
              borderRadius: 8, padding: "12px 16px",
              color: "#c62828", fontSize: 14, fontWeight: 600,
              marginBottom: 20, display: "flex", gap: 8,
            }}>
               This order has been cancelled
            </div>
          )}

          {/* Products */}
          <div className="order-detail-section">
            <div className="order-detail-section__title">🛍️ Items Ordered</div>
            {order.items?.map((item) => (
              <div key={item.id} className="order-detail-item">
                <div className="order-detail-item__img">
                  {item.product_image
                    ? <img src={`http://127.0.0.1:8000${item.product_image}`} alt={item.product_name} />
                    : " "
                  }
                </div>
                <div className="order-detail-item__info">
                  <div className="order-detail-item__name">{item.product_name}</div>
                  <div className="order-detail-item__qty">
                    {item.quantity} × Rs. {Number(item.price).toLocaleString()}
                  </div>
                </div>
                <div className="order-detail-item__price">
                  Rs. {Number(item.subtotal).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="order-detail-section">
            <div className="order-detail-section__title"> Delivery Address</div>
            <div className="address-box">
              <strong>{order.full_name}</strong> · {order.phone}<br />
              {order.address}, {order.city}
            </div>
          </div>

          {/* Price Summary */}
          <div className="order-detail-section">
            <div className="order-detail-section__title"> Price Summary</div>
            <div className="modal-price-row">
              <span className="modal-price-row__label">Subtotal</span>
              <span className="modal-price-row__val">
                Rs. {Number(order.total_price).toLocaleString()}
              </span>
            </div>
            <div className="modal-price-row">
              <span className="modal-price-row__label">Delivery Fee</span>
              <span className="modal-price-row__val">
                {Number(order.delivery_fee) === 0
                  ? "FREE"
                  : `Rs. ${Number(order.delivery_fee).toLocaleString()}`
                }
              </span>
            </div>
            <div className="modal-price-row modal-price-total">
              <span className="modal-price-row__label">Grand Total</span>
              <span className="modal-price-row__val">
                Rs. {Number(order.grand_total).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cancel button — only for pending orders */}
          {order.status === "pending" && (
            <button
              className="order-btn order-btn--danger"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              onClick={() => onCancel(order.id)}
            >
               Cancel This Order
            </button>
          )}

        </div>
      </div>
    </div>
  );
};


const OrderCard = ({ order, onViewDetail, onCancel }) => {
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="order-card">

      {/* Header */}
      <div className="order-card__header">
        <div className="order-card__header-left">
          <div>
            <div className="order-card__id">Order #{order.id}</div>
            <div className="order-card__date">
              Placed on {formatDate(order.created_at)}
            </div>
          </div>
        </div>
        <div className="order-card__header-right">
          {/* Payment badge */}
          <span className={`order-payment order-payment--${order.payment_method}`}>
            {order.payment_method === "khalti" ? " Khalti" : "eSewa"}
          </span>
          {/* Status badge */}
          <span className={`order-status ${statusCfg.cls}`}>
            <span className="order-status__dot" />
            {statusCfg.icon} {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Body — product chips */}
      <div className="order-card__body">
        <div className="order-card__products">
          {order.items?.slice(0, 3).map((item) => (
            <div key={item.id} className="order-card__product-chip">
              {item.product_name} × {item.quantity}
            </div>
          ))}
          {order.items?.length > 3 && (
            <div className="order-card__product-chip order-card__more-chip">
              +{order.items.length - 3} more
            </div>
          )}
        </div>

        {/* Info row */}
        <div className="order-card__info">
          <div className="order-card__info-item">
             <span>{order.items?.length} item{order.items?.length > 1 ? "s" : ""}</span>
          </div>
          <div className="order-card__info-item">
             <strong>{order.city}</strong>
          </div>
          <div className="order-card__info-item">
             <strong style={{ textTransform: "capitalize" }}>{order.payment_method}</strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="order-card__footer">
        <div className="order-card__total">
          <span className="order-card__total-label">Total:</span>
          <span className="order-card__total-val">
            Rs. {Number(order.grand_total).toLocaleString()}
          </span>
        </div>

        <div className="order-card__actions">
          {/* Cancel — only for pending */}
          {order.status === "pending" && (
            <button
              className="order-btn order-btn--danger"
              onClick={() => onCancel(order.id)}
            >
               Cancel
            </button>
          )}
          {/* View details */}
          <button
            className="order-btn order-btn--primary"
            onClick={() => onViewDetail(order)}
          >
            View Details →
          </button>
        </div>
      </div>

    </div>
  );
};


//    MAIN ORDERS PAGE

const Orders = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("all");
  const [selectedOrder,setSelectedOrder]= useState(null);  // for modal

  // Fetch all my orders on load
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.post(`/orders/${orderId}/cancel/`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel order.");
    }
  };

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const countByStatus = (status) =>
    orders.filter((o) => o.status === status).length;

  const TABS = [
    { key: "all",       label: "All Orders",  count: orders.length },
    { key: "pending",   label: "Pending",     count: countByStatus("pending")   },
    { key: "confirmed", label: "Confirmed",   count: countByStatus("confirmed") },
    { key: "shipped",   label: "Shipped",     count: countByStatus("shipped")   },
    { key: "delivered", label: "Delivered",   count: countByStatus("delivered") },
    { key: "cancelled", label: "Cancelled",   count: countByStatus("cancelled") },
  ];

  return (
    <div className="orders-page">
      <Navbar />

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={handleCancel}
        />
      )}

      {/* Header */}
      <div className="orders-page__header">
        <div className="orders-page__header-left">
          <div>
            <div className="orders-page__header-title">My Orders</div>
            <div className="orders-page__header-sub">
              Track and manage all your orders
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="orders-body">

        {/* Filter Tabs */}
        <div className="orders-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`orders-tab ${activeTab === tab.key ? "orders-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="orders-tab__count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="orders-loading">
            <div className="orders-spinner" />
            <span>Loading your orders...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredOrders.length === 0 && (
          <div className="orders-empty">
            <div className="orders-empty__title">
              {activeTab === "all"
                ? "No orders yet!"
                : `No ${activeTab} orders`}
            </div>
            <div className="orders-empty__sub">
              {activeTab === "all"
                ? "You haven't placed any orders yet. Start shopping!"
                : `You have no orders with status "${activeTab}"`}
            </div>
            {activeTab === "all" && (
              <Link to="/" className="orders-empty__btn">
                 Start Shopping
              </Link>
            )}
          </div>
        )}

        {/* Orders list */}
        {!loading && filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetail={setSelectedOrder}
            onCancel={handleCancel}
          />
        ))}

      </div>

      <Footer />
    </div>
  );
};

export default Orders;