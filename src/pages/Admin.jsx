import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import AddContestModal from "../components/modals/AddContestModal";
import AddProblemModal from "../components/modals/AddProblemModal";

function Admin() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("contests");
  
  // Modals
  const [showAddContest, setShowAddContest] = useState(false);
  const [showAddProblem, setShowAddProblem] = useState(false);
  
  // Data
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  
  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if isAdmin is already in currentUser (from AuthContext)
      if (currentUser.isAdmin === true) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Fallback: check Firestore directly
      try {
        const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", currentUser.uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setIsAdmin(userData.isAdmin === true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [currentUser]);

  // Load contests
  const loadContests = async () => {
    try {
      const snap = await getDocs(collection(db, "contests"));
      const list = [];
      
      // Get all contests first
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        
        // Count actual problems for this contest
        const problemsQuery = query(
          collection(db, "problems"), 
          where("contestId", "==", docSnap.id)
        );
        const problemsSnap = await getDocs(problemsQuery);
        const actualProblemCount = problemsSnap.size;
        
        list.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          problemCount: actualProblemCount
        });
      }
      
      list.sort((a, b) => b.startTime - a.startTime);
      setContests(list);
    } catch (error) {
      console.error("Error loading contests:", error);
      alert("Failed to load contests");
    }
  };

  // Load problems
  const loadProblems = async (contestId = null) => {
    try {
      let q = collection(db, "problems");
      if (contestId) {
        q = query(collection(db, "problems"), where("contestId", "==", contestId));
      }
      
      const snap = await getDocs(q);
      const list = [];
      
      snap.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          ...data,
          testCaseCount: data.testCases?.length || 0
        });
      });
      
      setProblems(list);
    } catch (error) {
      console.error("Error loading problems:", error);
      alert("Failed to load problems");
    }
  };

  // Delete contest
  const deleteContest = async (contestId) => {
    if (!confirm("Are you sure you want to delete this contest? This will also delete all associated problems.")) {
      return;
    }

    try {
      // Delete associated problems
      const problemsSnap = await getDocs(query(collection(db, "problems"), where("contestId", "==", contestId)));
      const deletePromises = problemsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete contest
      await deleteDoc(doc(db, "contests", contestId));
      
      alert("Contest and associated problems deleted successfully");
      loadContests();
      if (selectedContest === contestId) {
        setSelectedContest(null);
        setProblems([]);
      }
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete contest");
    }
  };

  // Delete problem
  const deleteProblem = async (problemId) => {
    if (!confirm("Are you sure you want to delete this problem?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "problems", problemId));
      alert("Problem deleted successfully");
      loadProblems(selectedContest);
      loadContests(); // Refresh contest list to update problem count
    } catch (error) {
      console.error("Error deleting problem:", error);
      alert("Failed to delete problem");
    }
  };

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      loadContests();
    }
  }, [isAdmin]);

  // Load problems when contest is selected
  useEffect(() => {
    if (selectedContest) {
      loadProblems(selectedContest);
    }
  }, [selectedContest]);

  if (loading) {
    return (
      <section id="admin" className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <span className="spinner"></span>
          <p style={{ marginTop: "20px", color: "var(--text-secondary)" }}>Verifying access...</p>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section id="admin" className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1>🔒 Access Denied</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "20px" }}>
            Please login to access the admin panel.
          </p>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section id="admin" className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1>🚫 Unauthorized Access</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "20px" }}>
            You don't have permission to access this page.
          </p>
        </div>
      </section>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return "#22c55e";
      case "Medium": return "#f59e0b";
      case "Hard": return "#ef4444";
      default: return "var(--text-secondary)";
    }
  };

  return (
    <section id="admin" className="page admin-page">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage contests, problems, and platform content</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === "contests" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("contests");
            setSelectedContest(null);
          }}
        >
          📋 Contests
        </button>
        <button 
          className={`tab-btn ${activeTab === "problems" ? "active" : ""}`}
          onClick={() => setActiveTab("problems")}
        >
          💻 Problems
        </button>
      </div>

      {activeTab === "contests" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <h2>Contest Management</h2>
            <button className="btn btn-primary" onClick={() => setShowAddContest(true)}>
              + Add Contest
            </button>
          </div>

          {contests.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: "3rem" }}>📝</p>
              <h3>No contests yet</h3>
              <p>Create your first contest to get started</p>
            </div>
          ) : (
            <div className="admin-grid">
              {contests.map(contest => (
                <div 
                  key={contest.id} 
                  className="admin-card"
                  onClick={() => {
                    setSelectedContest(contest.id);
                    setActiveTab("problems");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-card-header">
                    <h3>{contest.title}</h3>
                    <div className="admin-card-actions">
                      <button 
                        className="btn-icon btn-danger" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteContest(contest.id);
                        }}
                        title="Delete Contest"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <p className="admin-card-description">{contest.description}</p>
                  
                  <div className="admin-card-meta">
                    <div>
                      <span><strong>Start:</strong></span>
                      <span>{contest.startTime?.toLocaleString("en-IN", { 
                        dateStyle: "short", 
                        timeStyle: "short" 
                      })}</span>
                    </div>
                    <div>
                      <span><strong>End:</strong></span>
                      <span>{contest.endTime?.toLocaleString("en-IN", { 
                        dateStyle: "short", 
                        timeStyle: "short" 
                      })}</span>
                    </div>
                    <div>
                      <span><strong>Problems:</strong></span>
                      <span>{contest.problemCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "problems" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <div>
              <h2>Problem Management</h2>
              {selectedContest && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
                  Filtering by: {contests.find(c => c.id === selectedContest)?.title || "Unknown Contest"}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selectedContest && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedContest(null);
                    loadProblems();
                  }}
                >
                  Show All Problems
                </button>
              )}
              <select 
                value={selectedContest || ""} 
                onChange={(e) => setSelectedContest(e.target.value || null)}
                className="contest-filter"
              >
                <option value="">All Contests</option>
                {contests.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddProblem(true)}
                disabled={!selectedContest}
                title={!selectedContest ? "Please select a contest first" : ""}
              >
                + Add Problem
              </button>
            </div>
          </div>

          {problems.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: "3rem" }}>💡</p>
              <h3>No problems yet</h3>
              <p>{selectedContest ? "Add problems to this contest" : "Select a contest and add problems"}</p>
            </div>
          ) : (
            <div className="problems-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Points</th>
                    <th>Time Limit</th>
                    <th>Test Cases</th>
                    <th>Submissions</th>
                    <th>Accepted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map(problem => (
                    <tr key={problem.id}>
                      <td><strong>{problem.title}</strong></td>
                      <td>
                        <span style={{ 
                          color: getDifficultyColor(problem.difficulty),
                          fontWeight: "600"
                        }}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td>{problem.points}</td>
                      <td>{problem.timeLimit}ms</td>
                      <td>{problem.testCaseCount}</td>
                      <td>{problem.submissions || 0}</td>
                      <td>{problem.accepted || 0}</td>
                      <td>
                        <button 
                          className="btn-icon btn-danger"
                          onClick={() => deleteProblem(problem.id)}
                          title="Delete Problem"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AddContestModal 
        open={showAddContest} 
        setOpen={setShowAddContest}
        onContestAdded={loadContests}
      />
      
      <AddProblemModal 
        open={showAddProblem} 
        setOpen={setShowAddProblem}
        contestId={selectedContest}
        onProblemAdded={() => {
          loadProblems(selectedContest);
          loadContests(); // Refresh to update problem count
        }}
      />
    </section>
  );
}

export default Admin;

