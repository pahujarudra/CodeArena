import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function LoginModal({ open, setOpen }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, setOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      setOpen(false);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Login</h2>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email:</label>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
            required 
          />

          <label>Password:</label>
          <input type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 disabled={loading}
                 required />

          <button className="btn login-form" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default LoginModal;
