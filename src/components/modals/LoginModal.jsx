import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { formatAuthError } from "../../utils/errorHandling";

function LoginModal({ open, setOpen }) {
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  if (!open) return null;

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      const ref = doc(db, "users", res.user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setCurrentUser({ uid: res.user.uid, ...snap.data() });
        setOpen(false);
      } else {
        throw new Error("User data not found");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Login</h2>

        <form onSubmit={login}>
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
