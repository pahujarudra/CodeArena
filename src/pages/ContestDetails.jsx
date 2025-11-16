import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

function ContestDetails() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const loadContestDetails = async () => {
      try {
        setLoading(true);
        
        // Load contest
        const contestDoc = await getDoc(doc(db, "contests", contestId));
        if (!contestDoc.exists()) {
          alert("Contest not found");
          navigate("/contests");
          return;
        }

        const contestData = contestDoc.data();
        const start = contestData.startTime?.toDate();
        const end = contestData.endTime?.toDate();
        const now = new Date();

        const status =
          now < start ? "upcoming" :
          now >= start && now <= end ? "active" :
          "ended";

        setContest({
          id: contestDoc.id,
          title: contestData.title,
          description: contestData.description,
          start,
          end,
          status
        });

        // Load problems
        const problemsQuery = query(
          collection(db, "problems"),
          where("contestId", "==", contestId)
        );
        const problemsSnap = await getDocs(problemsQuery);
        
        const problemsList = [];
        problemsSnap.forEach(docSnap => {
          const data = docSnap.data();
          problemsList.push({
            id: docSnap.id,
            title: data.title,
            difficulty: data.difficulty,
            points: data.points,
            totalSubmissions: data.totalSubmissions || 0,
            acceptedSubmissions: data.acceptedSubmissions || 0,
            status: 'unsolved' // TODO: Fetch user's status
          });
        });

        problemsList.sort((a, b) => a.points - b.points);
        setProblems(problemsList);
        
      } catch (error) {
        console.error("Error loading contest details:", error);
        alert("Failed to load contest details");
      } finally {
        setLoading(false);
      }
    };

    loadContestDetails();
  }, [contestId, navigate]);

  const getStatusBadge = (status) => {
    const badges = {
      active: { emoji: "🔴", text: "LIVE", color: "#ef4444" },
      upcoming: { emoji: "⏰", text: "UPCOMING", color: "#f59e0b" },
      ended: { emoji: "✓", text: "ENDED", color: "#6b7280" }
    };
    return badges[status] || badges.ended;
  };

  const getDifficultyClass = (difficulty) => {
    return difficulty?.toLowerCase() || 'medium';
  };

  if (loading) {
    return (
      <section id="contest-details">
        <div className="container">
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div className="loader"></div>
            <p style={{ marginTop: "20px", color: "var(--text-secondary)" }}>Loading contest...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!contest) {
    return (
      <section id="contest-details">
        <div className="container">
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h2>Contest not found</h2>
            <button className="btn btn-primary" onClick={() => navigate("/contests")}>
              Go back to Contests
            </button>
          </div>
        </div>
      </section>
    );
  }

  const badge = getStatusBadge(contest.status);

  return (
    <section id="contest-details">
      <div className="container">
        <button className="btn-back" onClick={() => navigate("/contests")}>
          ← Back to Contests
        </button>

        <div className="contest-header-card">
          <div className="contest-header-top">
            <h1 className="contest-title-main">{contest.title}</h1>
            <span 
              className="status-badge-large"
              style={{ background: badge.color }}
            >
              {badge.emoji} {badge.text}
            </span>
          </div>

          <p className="contest-description">{contest.description}</p>

          <div className="contest-timing">
            <div className="timing-item">
              <span className="timing-label">Start:</span>
              <span className="timing-value">
                {contest.start.toLocaleString('en-US', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </span>
            </div>
            <div className="timing-item">
              <span className="timing-label">End:</span>
              <span className="timing-value">
                {contest.end.toLocaleString('en-US', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </span>
            </div>
            <div className="timing-item">
              <span className="timing-label">Duration:</span>
              <span className="timing-value">
                {Math.round((contest.end - contest.start) / (1000 * 60 * 60))} hours
              </span>
            </div>
          </div>
        </div>

        <div className="problems-section">
          <h2 className="section-title">Problems ({problems.length})</h2>

          {problems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No problems added to this contest yet</p>
            </div>
          ) : (
            <div className="problems-list-container">
              {problems.map((problem, index) => (
                <div key={problem.id} className="problem-list-item">
                  <div className="problem-list-left">
                    <span className={`status-icon ${problem.status}`}>
                      {problem.status === 'solved' ? '✓' : 
                       problem.status === 'attempted' ? '○' : ''}
                    </span>
                    <span className="problem-number">{index + 1}</span>
                    <div className="problem-list-info">
                      <h3>{problem.title}</h3>
                      <div className="problem-meta">
                        <span className={`difficulty-tag ${getDifficultyClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="points-tag">+{problem.points} pts</span>
                        <span className="acceptance-tag">
                          {problem.totalSubmissions > 0 
                            ? `${Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100)}%`
                            : '0%'} acceptance
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn-solve"
                    onClick={() => navigate(`/problems/${problem.id}`)}
                  >
                    Solve →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContestDetails;
