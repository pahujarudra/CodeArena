import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function SignupModal({ open, setOpen }) {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

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
      setForm({
        fullName: "",
        username: "",
        email: "",
        password: "",
      });
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (form.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (form.username.length > 50) {
      setError("Username must be less than 50 characters");
      return;
    }

    if (form.fullName.length > 100) {
      setError("Full name must be less than 100 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signup(
        form.email.trim(),
        form.password,
        form.username.trim(),
        form.fullName.trim()
      );

      setOpen(false);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Sign Up</h2>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleSignup}>
          <label>Full Name</label>
          <input 
            name="fullName" 
            value={form.fullName}
            onChange={update} 
            disabled={loading} 
            required 
          />

          <label>Username</label>
          <input 
            name="username" 
            value={form.username}
            onChange={update} 
            disabled={loading} 
            required 
          />

          <label>Email</label>
          <input 
            name="email" 
            type="email"
            value={form.email}
            onChange={update} 
            disabled={loading} 
            required 
          />

          <label>Password</label>
          <input 
            name="password" 
            type="password"
            value={form.password}
            onChange={update} 
            disabled={loading} 
            required 
          />

          <button className="btn submit-form" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

SignupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default SignupModal;
