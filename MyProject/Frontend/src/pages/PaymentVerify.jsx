import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API    from "../api/axios";

const PaymentVerify = () => {
  const [searchParams]            = useSearchParams();
  const navigate                   = useNavigate();
  const [status,  setStatus]       = useState("verifying"); // verifying, success, failed
  const [message, setMessage]      = useState("");
  const [orderId, setOrderId]      = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    // Khalti sends these in URL after payment
    // Example: /payment/verify/?pidx=xxx&status=Completed&purchase_order_id=1
    const pidx             = searchParams.get("pidx");
    const khaltiStatus     = searchParams.get("status");
    const purchaseOrderId  = searchParams.get("purchase_order_id");

    // If no pidx in URL → something went wrong
    if (!pidx) {
      setStatus("failed");
      setMessage("Invalid payment. No payment ID found.");
      return;
    }

    // If Khalti already says failed/cancelled in URL
    if (khaltiStatus === "User canceled") {
      setStatus("failed");
      setMessage("Payment was cancelled by user.");
      return;
    }

    try {
      // Send pidx to Django to verify with Khalti server
      const res = await API.post("/payment/verify/", { pidx });

      if (res.data.success) {
        // Payment verified successfully
        setStatus("success");
        setMessage(res.data.message);
        setOrderId(res.data.order_id);
      } else {
        setStatus("failed");
        setMessage(res.data.message || "Payment verification failed.");
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Something went wrong.";
      setStatus("failed");
      setMessage(errMsg);
    }
  };

  // ── Verifying State ── (shown while calling API)
  if (status === "verifying") {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.spinnerWrap}>
              <div style={styles.spinner} />
            </div>
            <div style={styles.title}>Verifying Payment...</div>
            <div style={styles.sub}>
              Please wait while we confirm your payment with Khalti.
              Do not close this page.
            </div>
          </div>
        </div>
        <Footer />
        <style>{spinnerCSS}</style>
      </div>
    );
  }

  // ── Success State ──
  if (status === "success") {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ ...styles.iconCircle, background: "#e8f5e9", border: "3px solid #2e7d32" }}>
              ✅
            </div>
            <div style={{ ...styles.title, color: "#1b5e20" }}>
              Payment Successful! 🎉
            </div>
            <div style={styles.sub}>
              Your payment has been verified and your order is confirmed.
              Thank you for shopping local!
            </div>

            {/* Order details box */}
            <div style={styles.detailBox}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Order ID</span>
                <span style={styles.detailVal}>#{orderId}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Payment</span>
                <span style={{ ...styles.detailVal, color: "#5C2D91" }}>
                  💜 Khalti
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status</span>
                <span style={{
                  background: "#e8f5e9", color: "#2e7d32",
                  padding: "3px 12px", borderRadius: 999,
                  fontSize: 12, fontWeight: 700,
                }}>
                  ✅ Confirmed
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button
                style={styles.btnPrimary}
                onClick={() => navigate("/orders")}
              >
                📦 View My Orders
              </button>
              <Link to="/" style={styles.btnOutline}>
                🛍️ Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Failed State ──
  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...styles.iconCircle, background: "#ffebee", border: "3px solid #e53935" }}>
            ❌
          </div>
          <div style={{ ...styles.title, color: "#c62828" }}>
            Payment Failed!
          </div>
          <div style={styles.sub}>
            {message || "Your payment could not be verified. Please try again."}
          </div>

          <div style={styles.detailBox}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Reason</span>
              <span style={{ ...styles.detailVal, color: "#c62828" }}>
                {message}
              </span>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.btnPrimary}
              onClick={() => navigate("/orders")}
            >
              📦 View My Orders
            </button>
            <Link to="/" style={styles.btnOutline}>
              🛍️ Try Again
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

/* ── Inline Styles ── */
const styles = {
  container: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "var(--bg)",
  },
  card: {
    background: "white",
    borderRadius: 20,
    padding: "48px 40px",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
    border: "1px solid #e0e0e0",
  },
  spinnerWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },
  spinner: {
    width: 52,
    height: 52,
    border: "4px solid #e0e0e0",
    borderTopColor: "#2e7d32",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  iconCircle: {
    width: 80, height: 80,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 36,
    margin: "0 auto 20px",
  },
  title: {
    fontFamily: "var(--font-display, serif)",
    fontSize: 26,
    fontWeight: 800,
    color: "#111",
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: "#888",
    lineHeight: 1.7,
    marginBottom: 24,
  },
  detailBox: {
    background: "#f1f8f1",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
    textAlign: "left",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e0e0e0",
    fontSize: 13.5,
  },
  detailLabel: { color: "#888" },
  detailVal:   { fontWeight: 700, color: "#111" },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  btnPrimary: {
    width: "100%",
    padding: "13px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnOutline: {
    width: "100%",
    padding: "12px",
    background: "white",
    color: "#444",
    border: "1.5px solid #e0e0e0",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
};

const spinnerCSS = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default PaymentVerify;