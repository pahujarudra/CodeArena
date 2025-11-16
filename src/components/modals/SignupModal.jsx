import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { VALIDATION, INITIAL_USER_STATS } from "../../utils/constants";
import { formatAuthError } from "../../utils/errorHandling";

function SignupModal({ open, setOpen }) {
  const { setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
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

  if (!open) return null;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const signup = async (e) => {
    e.preventDefault();

    // Basic validation
    if (form.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      alert(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`);
      return;
    }

    if (form.username.length < VALIDATION.MIN_USERNAME_LENGTH) {
      alert(`Username must be at least ${VALIDATION.MIN_USERNAME_LENGTH} characters long`);
      return;
    }

    if (form.username.length > VALIDATION.MAX_USERNAME_LENGTH) {
      alert(`Username must be less than ${VALIDATION.MAX_USERNAME_LENGTH} characters`);
      return;
    }

    if (form.fullname.length > VALIDATION.MAX_FULLNAME_LENGTH) {
      alert(`Full name must be less than ${VALIDATION.MAX_FULLNAME_LENGTH} characters`);
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const ref = doc(db, "users", res.user.uid);
      const userData = {
        fullname: form.fullname.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        photoURL: "",
        createdAt: serverTimestamp(),
        ...INITIAL_USER_STATS
      };

      await setDoc(ref, userData);

      setCurrentUser({
        uid: res.user.uid,
        ...userData
      });

      setOpen(false);
    } catch (err) {
      console.error("Signup error:", err);
      alert(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Sign Up</h2>

        <form onSubmit={signup}>
          <label>Full Name</label>
          <input name="fullname" onChange={update} disabled={loading} required />

          <label>Username</label>
          <input name="username" onChange={update} disabled={loading} required />

          <label>Email</label>
          <input name="email" type="email" onChange={update} disabled={loading} required />

          <label>Password</label>
          <input name="password" type="password" onChange={update} disabled={loading} required />

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
