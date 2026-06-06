import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user }              = useAuth();
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  //  Fetch Cart 
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await API.get("/cart/");
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  //  Add item to cart  called from Landing page when user clicks +
  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await API.post("/cart/add/", {
        product_id: productId,
        quantity:   quantity,
      });
      setCart(res.data.cart);  
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add to cart.";
      return { success: false, message: msg };
    }
  };

  //  Update quantity 
  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await API.put(`/cart/update/${itemId}/`, { quantity });
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update.";
      return { success: false, message: msg };
    }
  };

  // ── Remove single item 
  const removeItem = async (itemId) => {
    try {
      const res = await API.delete(`/cart/remove/${itemId}/`);
      setCart(res.data.cart);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: "Failed to remove item." };
    }
  };

  const clearCart = async () => {
    try {
      await API.delete("/cart/clear/");
      setCart((prev) => ({
        ...prev,
        items:      [],
        total:      0,
        item_count: 0,
      }));
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  // cartCount is used in Navbar 
  const cartCount = cart?.item_count || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartCount,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);