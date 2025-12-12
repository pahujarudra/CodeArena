import { useState, useEffect } from "react";
import { problemAPI } from "../../utils/api";
import PropTypes from "prop-types";

function AddProblemModal({ open, setOpen, contestId, onProblemAdded }) {
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([{ input: "", output: "", isHidden: false }]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    points: 100,
    timeLimit: 1000,
    memoryLimit: 256,
    constraints: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: ""
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

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isHidden: false }]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const save = async (e) => {
    e.preventDefault();
    
    if (!contestId) {
      alert("Please select a contest first");
      return;
    }

    if (testCases.length === 0) {
      alert("Please add at least one test case");
      return;
    }

    setLoading(true);

    try {
      const problemData = {
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        maxScore: Number(form.points),
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
        contestId,
        testCases: testCases.map(tc => ({
          input: tc.input.trim(),
          expectedOutput: tc.output.trim(),
          isSample: tc.isHidden ? 0 : 1,
          points: 10
        }))
      };

      console.log('Sending problem data:', problemData);
      await problemAPI.create(problemData);
      
      if (onProblemAdded) onProblemAdded();
      setOpen(false);
      
      // Reset form
      setForm({
        title: "",
        description: "",
        difficulty: "Easy",
        points: 100,
        timeLimit: 1000,
        memoryLimit: 256,
        constraints: "",
        inputFormat: "",
        outputFormat: "",
        sampleInput: "",
        sampleOutput: ""
      });
      setTestCases([{ input: "", output: "", isHidden: false }]);
      
      alert("Problem added successfully!");
    } catch (err) {
      console.error("Error adding problem:", err);
      alert(err.message || "Failed to add problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={() => setOpen(false)}>
      <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>&times;</span>
        <h2>Add New Problem</h2>

        <form onSubmit={save} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Problem Title *</label>
              <input name="title" value={form.title} onChange={update} disabled={loading} required />
            </div>

            <div className="form-group">
              <label>Difficulty *</label>
              <select name="difficulty" value={form.difficulty} onChange={update} disabled={loading}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Points *</label>
              <input type="number" name="points" value={form.points} onChange={update} disabled={loading} required min="0" />
            </div>
          </div>

          <div className="form-group">
            <label>Problem Description *</label>
            <textarea name="description" value={form.description} onChange={update} disabled={loading} required rows="4" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Time Limit (ms) *</label>
              <input type="number" name="timeLimit" value={form.timeLimit} onChange={update} disabled={loading} required min="100" />
            </div>

            <div className="form-group">
              <label>Memory Limit (MB) *</label>
              <input type="number" name="memoryLimit" value={form.memoryLimit} onChange={update} disabled={loading} required min="1" />
            </div>
          </div>

          <div className="form-group">
            <label>Constraints</label>
            <textarea name="constraints" value={form.constraints} onChange={update} disabled={loading} rows="2" placeholder="e.g., 1 ≤ N ≤ 10^5" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Input Format</label>
              <textarea name="inputFormat" value={form.inputFormat} onChange={update} disabled={loading} rows="2" />
            </div>

            <div className="form-group">
              <label>Output Format</label>
              <textarea name="outputFormat" value={form.outputFormat} onChange={update} disabled={loading} rows="2" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sample Input</label>
              <textarea name="sampleInput" value={form.sampleInput} onChange={update} disabled={loading} rows="3" />
            </div>

            <div className="form-group">
              <label>Sample Output</label>
              <textarea name="sampleOutput" value={form.sampleOutput} onChange={update} disabled={loading} rows="3" />
            </div>
          </div>

          <div className="form-group">
            <label>Test Cases *</label>
            <div className="test-cases-container">
              {testCases.map((tc, index) => (
                <div key={index} className="test-case-item">
                  <div className="test-case-header">
                    <span>Test Case {index + 1}</span>
                    <div className="test-case-actions">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={tc.isHidden}
                          onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                          disabled={loading}
                        />
                        Hidden
                      </label>
                      {testCases.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeTestCase(index)} 
                          className="btn-remove"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="test-case-fields">
                    <textarea
                      placeholder="Input"
                      value={tc.input}
                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      disabled={loading}
                      required
                      rows="2"
                    />
                    <textarea
                      placeholder="Expected Output"
                      value={tc.output}
                      onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                      disabled={loading}
                      required
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addTestCase} className="btn btn-secondary" disabled={loading}>
              + Add Test Case
            </button>
          </div>

          <button className="btn submit-form" type="submit" disabled={loading}>
            {loading ? "Adding Problem..." : "Add Problem"}
          </button>
        </form>
      </div>
    </div>
  );
}

AddProblemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  contestId: PropTypes.string,
  onProblemAdded: PropTypes.func
};

export default AddProblemModal;
