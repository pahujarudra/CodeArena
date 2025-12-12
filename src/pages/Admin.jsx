import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { contestAPI, problemAPI } from "../utils/api";
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

      // Check if role is admin (from AuthContext)
      if (currentUser.role === 'admin') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      setIsAdmin(false);
      setLoading(false);
    };

    checkAdmin();
  }, [currentUser]);

  // Load contests
  const loadContests = async () => {
    try {
      const list = await contestAPI.getAll();
      
      // Get problem counts for each contest
      const contestsWithCounts = await Promise.all(
        list.map(async (data) => {
          try {
            const problems = await problemAPI.getByContest(data.contestId);
            return {
              id: data.contestId,
              title: data.title,
              description: data.description,
              startTime: new Date(data.startTime),
              endTime: new Date(data.endTime),
              problemCount: problems.length
            };
          } catch (error) {
            console.error(`Error loading problems for contest ${data.contestId}:`, error);
            return {
              id: data.contestId,
              title: data.title,
              description: data.description,
              startTime: new Date(data.startTime),
              endTime: new Date(data.endTime),
              problemCount: 0
            };
          }
        })
      );
      
      contestsWithCounts.sort((a, b) => b.startTime - a.startTime);
      setContests(contestsWithCounts);
    } catch (error) {
      console.error("Error loading contests:", error);
      alert("Failed to load contests");
    }
  };

  // Load problems
  const loadProblems = async (contestId = null) => {
    try {
      let list;
      if (contestId) {
        list = await problemAPI.getByContest(contestId);
      } else {
        list = await problemAPI.getAll();
      }
      
      const processedList = list.map(data => ({
        id: data.problemId,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        points: data.maxScore,
        contestId: data.contestId,
        testCaseCount: 0  // We don't get test cases in the list view
      }));
      
      setProblems(processedList);
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
      await contestAPI.delete(contestId);
      
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
      await problemAPI.delete(problemId);
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

  // Load all problems when switching to problems tab without selected contest
  useEffect(() => {
    if (activeTab === "problems" && !selectedContest) {
      loadProblems();
    }
  }, [activeTab]);

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
      {/* Animated Background */}
      <div className="admin-bg-decoration">
        <div className="admin-orb admin-orb-1"></div>
        <div className="admin-orb admin-orb-2"></div>
        <div className="admin-orb admin-orb-3"></div>
      </div>

      <div className="admin-header">
        <div className="admin-header-icon">⚙️</div>
        <h1>Admin Dashboard</h1>
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
          <span className="tab-icon">📋</span>
          <span className="tab-text">Contests</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === "problems" ? "active" : ""}`}
          onClick={() => setActiveTab("problems")}
        >
          <span className="tab-icon">💻</span>
          <span className="tab-text">Problems</span>
        </button>
      </div>

      {activeTab === "contests" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <div className="toolbar-left">
              <h2>Contest Management</h2>
              <p className="toolbar-subtitle">{contests.length} total contest{contests.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddContest(true)}>
              <span>+</span> Add Contest
            </button>
          </div>

          {contests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No contests yet</h3>
              <p>Create your first contest to get started</p>
              <button className="btn btn-primary" onClick={() => setShowAddContest(true)}>
                <span>+</span> Create Contest
              </button>
            </div>
          ) : (
            <div className="admin-grid">
              {contests.map(contest => (
                <div 
                  key={contest.id} 
                  className="admin-card contest-card"
                  onClick={() => {
                    setSelectedContest(contest.id);
                    setActiveTab("problems");
                  }}
                >
                  <div className="admin-card-header">
                    <h3>{contest.title}</h3>
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContest(contest.id);
                      }}
                      title="Delete Contest"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                  
                  <p className="admin-card-description">{contest.description}</p>
                  
                  <div className="admin-card-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <div className="meta-content">
                        <span className="meta-label">Start:</span>
                        <span className="meta-value">{contest.startTime?.toLocaleString("en-IN", { 
                          dateStyle: "short", 
                          timeStyle: "short" 
                        })}</span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🏁</span>
                      <div className="meta-content">
                        <span className="meta-label">End:</span>
                        <span className="meta-value">{contest.endTime?.toLocaleString("en-IN", { 
                          dateStyle: "short", 
                          timeStyle: "short" 
                        })}</span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📝</span>
                      <div className="meta-content">
                        <span className="meta-label">Problems:</span>
                        <span className="meta-value">{contest.problemCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-overlay">
                    <span>View Problems →</span>
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
            <div className="toolbar-left">
              <h2>Problem Management</h2>
              {selectedContest && (
                <p className="toolbar-subtitle">
                  Contest: {contests.find(c => c.id === selectedContest)?.title || "Unknown"}
                </p>
              )}
              {!selectedContest && (
                <p className="toolbar-subtitle">{problems.length} total problem{problems.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="toolbar-right">
              {selectedContest && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedContest(null);
                    loadProblems();
                  }}
                >
                  Show All
                </button>
              )}
              <select 
                value={selectedContest || ""} 
                onChange={(e) => {
                  const contestId = e.target.value || null;
                  setSelectedContest(contestId);
                  if (!contestId) {
                    loadProblems();
                  }
                }}
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
                <span>+</span> Add Problem
              </button>
            </div>
          </div>

          {problems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💡</div>
              <h3>No problems yet</h3>
              <p>{selectedContest ? "Add problems to this contest" : "Select a contest and add problems"}</p>
              {selectedContest && (
                <button className="btn btn-primary" onClick={() => setShowAddProblem(true)}>
                  <span>+</span> Add Problem
                </button>
              )}
            </div>
          ) : (
            <div className="problems-table-wrapper">
              <div className="problems-table">
                <table>
                  <thead>
                    <tr>
                      <th>Problem Title</th>
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
                        <td>
                          <div className="problem-title-cell">
                            <span className="problem-icon">💻</span>
                            <strong>{problem.title}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="difficulty-badge-admin" style={{ 
                            background: getDifficultyColor(problem.difficulty) + '15',
                            color: getDifficultyColor(problem.difficulty),
                            border: `1px solid ${getDifficultyColor(problem.difficulty)}30`
                          }}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td>
                          <span className="points-badge">{problem.points}</span>
                        </td>
                        <td>{problem.timeLimit}ms</td>
                        <td>
                          <span className="count-badge">{problem.testCaseCount}</span>
                        </td>
                        <td>{problem.submissions || 0}</td>
                        <td>
                          <span style={{ 
                            color: (problem.accepted || 0) > 0 ? '#22c55e' : 'var(--text-secondary)',
                            fontWeight: '600'
                          }}>
                            {problem.accepted || 0}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => deleteProblem(problem.id)}
                            title="Delete Problem"
                          >
                            <span>🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

