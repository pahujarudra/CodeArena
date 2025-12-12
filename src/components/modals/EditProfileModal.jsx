import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";

function EditProfileModal({ open, setOpen }) {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: currentUser?.fullName || "",
    username: currentUser?.username || "",
    avatarUrl: currentUser?.avatarUrl || ""
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
      await updateProfile({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        avatarUrl: form.avatarUrl.trim()
      });

      setOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
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
          <input name="fullName" value={form.fullName} onChange={update} disabled={loading} required />

          <label>Username:</label>
          <input name="username" value={form.username} onChange={update} disabled={loading} required />

          <label>Avatar URL:</label>
          <input type="url" name="avatarUrl" value={form.avatarUrl} onChange={update} disabled={loading} />

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
