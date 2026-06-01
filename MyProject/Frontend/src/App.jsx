import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Home     from "./pages/Home";

// Protected Route — redirects to login if not logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Public Route — redirects to home if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Navigate to="/" /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes — only for non logged in users */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes — only for logged in users */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;