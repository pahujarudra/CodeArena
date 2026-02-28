import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";
import { formatFirestoreError } from "../../utils/errorHandling";

function EditProfileModal({ open, setOpen }) {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullname: currentUser?.fullname || "",
    username: currentUser?.username || "",
    photoURL: currentUser?.photoURL || ""
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

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ref = doc(db, "users", currentUser.uid);

      await updateDoc(ref, {
        fullname: form.fullname.trim(),
        username: form.username.trim(),
        photoURL: form.photoURL.trim()
      });

      setCurrentUser({
        ...currentUser,
        fullname: form.fullname.trim(),
        username: form.username.trim(),
        photoURL: form.photoURL.trim()
      });

      setOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(formatFirestoreError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Edit Profile</h2>

        <form onSubmit={save}>
          <label>Full Name:</label>
          <input name="fullname" value={form.fullname} onChange={update} disabled={loading} required />

          <label>Username:</label>
          <input name="username" value={form.username} onChange={update} disabled={loading} required />

          <label>Photo URL:</label>
          <input type="url" name="photoURL" value={form.photoURL} onChange={update} disabled={loading} />

          <button className="btn submit-form" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

EditProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default EditProfileModal;
