import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import PropTypes from "prop-types";
import { formatFirestoreError } from "../../utils/errorHandling";

function AddContestModal({ open, setOpen, onContestAdded }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: ""
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
      // Parse dates and times
      const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
      const endDateTime = new Date(`${form.endDate}T${form.endTime}`);

      // Validation
      if (endDateTime <= startDateTime) {
        alert("End time must be after start time");
        setLoading(false);
        return;
      }

      const contestData = {
        title: form.title.trim(),
        description: form.description.trim(),
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        createdAt: Timestamp.now(),
        problemCount: 0
      };

      await addDoc(collection(db, "contests"), contestData);
      
      if (onContestAdded) onContestAdded();
      setOpen(false);
      
      // Reset form
      setForm({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
      });
      
      alert("Contest added successfully!");
    } catch (err) {
      console.error("Error adding contest:", err);
      alert(formatFirestoreError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Add New Contest</h2>

        <form onSubmit={save}>
          <label>Contest Title *</label>
          <input 
            type="text"
            name="title" 
            value={form.title} 
            onChange={update} 
            disabled={loading} 
            required 
          />

          <label>Description *</label>
          <textarea name="description" value={form.description} onChange={update} disabled={loading} required rows="3" />

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={update} disabled={loading} required />
            </div>

            <div className="form-group">
              <label>Start Time *</label>
              <input type="time" name="startTime" value={form.startTime} onChange={update} disabled={loading} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" name="endDate" value={form.endDate} onChange={update} disabled={loading} required />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input type="time" name="endTime" value={form.endTime} onChange={update} disabled={loading} required />
            </div>
          </div>

          <button className="btn submit-form" type="submit" disabled={loading}>
            {loading ? "Adding Contest..." : "Add Contest"}
          </button>
        </form>
      </div>
    </div>
  );
}

AddContestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  onContestAdded: PropTypes.func
};

export default AddContestModal;
