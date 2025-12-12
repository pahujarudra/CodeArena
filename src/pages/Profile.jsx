import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "../components/modals/EditProfileModal";
import { DEFAULT_AVATAR_URL } from "../utils/constants";
import { userAPI } from "../utils/api";

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await userAPI.getById(currentUser.userId);
        setUserData(data);
        console.log('Profile data loaded:', data);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  if (!currentUser)
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "100px 20px",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <p style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</p>
        <h2 style={{ 
          fontSize: "2rem", 
          color: "var(--text-primary)",
          marginBottom: "12px",
          fontWeight: "700"
        }}>
          Login Required
        </h2>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "var(--text-secondary)" 
        }}>
          Please log in to view your profile and track your progress
        </p>
      </div>
    );

  if (loading) {
    return (

      <section id="profile" className="page">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading profile...</p>
        </div>
      </section>
    );
  }

  const problemsSolved = userData?.totalSolved || 0;
  const easyProblems = userData?.problems_by_difficulty?.easy || 0;
  const mediumProblems = userData?.problems_by_difficulty?.medium || 0;
  const hardProblems = userData?.problems_by_difficulty?.hard || 0;
  const totalPoints = userData?.rating || 0;
  const totalSubmissions = userData?.totalSubmissions || 0;
  const contestsParticipated = userData?.contests_participated || 0;
  const recentActivities = userData?.recentActivities || [];
  const joinedDate = userData?.createdAt ? new Date(userData.createdAt) : new Date();

  console.log('Profile rendering with:', {
    userData,
    problemsSolved,
    totalSubmissions,
    totalPoints,
    recentActivities
  });

  return (
    <section id="profile" className="page">
      {/* Background decoration */}
      <div style={{
        position: "fixed",
        top: "10%",
        left: "-100px",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(60px)",
        animation: "float 20s ease-in-out infinite"
      }}></div>
      <div style={{
        position: "fixed",
        bottom: "10%",
        right: "-150px",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(60px)",
        animation: "float 25s ease-in-out infinite reverse"
      }}></div>

      <h1>My Profile</h1>

      <div className="grid">
        {/* Profile Info */}
        <div className="grid-child grid-profile">
          <div className="avatar">
            <img
              className="avatar-img"
              alt={`${currentUser.fullName}'s profile picture`}
              src={currentUser.avatarUrl || DEFAULT_AVATAR_URL}
            />
          </div>

          <div className="profile-fullname">{currentUser.fullName}</div>
          <div className="username">@{currentUser.username}</div>
          <div className="email">{currentUser.email}</div>
          
          <div style={{
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            marginTop: "0",
            marginBottom: "0",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>📅</span>
            <span>Member since {joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>

          <button className="edit-profile btn" onClick={() => setEditOpen(true)} style={{ marginTop: "20px" }}>
            ✏️ Edit Profile
          </button>

          <button className="logout-btn btn" onClick={logout}>
            🚪 Logout
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid-child grid-stats">
          <h2>📊 Statistics Overview</h2>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-value">{problemsSolved}</span>
              <span className="stat-label">Problems Solved</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">{totalPoints}</span>
              <span className="stat-label">Total Points</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">{totalSubmissions}</span>
              <span className="stat-label">Submissions</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">{contestsParticipated}</span>
              <span className="stat-label">Contests</span>
            </div>
          </div>
        </div>

        {/* Problem Breakdown by Difficulty */}
        <div className="grid-child" style={{ 
          background: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ 
            marginBottom: '28px',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🎯 Problem Breakdown
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Easy Problems */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontSize: '1.5rem',
                    lineHeight: '1'
                  }}>🟢</span>
                  <span style={{ 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Easy
                  </span>
                </div>
                <span style={{ 
                  color: '#22c55e', 
                  fontWeight: '700',
                  fontSize: '1.3rem',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>{easyProblems}</span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div 
                  style={{ 
                    width: `${problemsSolved > 0 ? Math.min((easyProblems / problemsSolved) * 100, 100) : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px',
                    boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
                  }}
                ></div>
              </div>
            </div>

            {/* Medium Problems */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontSize: '1.5rem',
                    lineHeight: '1'
                  }}>🟡</span>
                  <span style={{ 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Medium
                  </span>
                </div>
                <span style={{ 
                  color: '#f59e0b', 
                  fontWeight: '700',
                  fontSize: '1.3rem',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>{mediumProblems}</span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div 
                  style={{ 
                    width: `${problemsSolved > 0 ? Math.min((mediumProblems / problemsSolved) * 100, 100) : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
                  }}
                ></div>
              </div>
            </div>

            {/* Hard Problems */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontSize: '1.5rem',
                    lineHeight: '1'
                  }}>🔴</span>
                  <span style={{ 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Hard
                  </span>
                </div>
                <span style={{ 
                  color: '#ef4444', 
                  fontWeight: '700',
                  fontSize: '1.3rem',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>{hardProblems}</span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div 
                  style={{ 
                    width: `${problemsSolved > 0 ? Math.min((hardProblems / problemsSolved) * 100, 100) : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
                  }}
                ></div>
              </div>
            </div>

            {/* Total Summary */}
            <div style={{
              marginTop: '8px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <div>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem',
                  marginBottom: '4px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Total Solved
                </div>
                <div style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  Problems Completed
                </div>
              </div>
              <div style={{ 
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1'
              }}>
                {problemsSolved}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid-child" style={{ 
          background: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ 
            marginBottom: '24px',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚡ Recent Activity
          </h2>
          {recentActivities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentActivities.slice(0, 3).map((activity, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--card-bg-alt)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => activity.problemId && navigate(`/problems/${activity.problemId}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {activity.status === 'Accepted' ? '✅' : 
                           activity.type === 'solved_problem' ? '✅' : 
                           activity.type === 'attempted_problem' ? '❌' : '📝'}
                        </span>
                        {activity.problemTitle || activity.description}
                      </div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-secondary)',
                        marginBottom: '8px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        {activity.contestTitle && (
                          <span>📚 {activity.contestTitle}</span>
                        )}
                        {activity.difficulty && (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: activity.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.15)' :
                                       activity.difficulty === 'Medium' ? 'rgba(251, 191, 36, 0.15)' :
                                       'rgba(239, 68, 68, 0.15)',
                            color: activity.difficulty === 'Easy' ? '#22c55e' :
                                   activity.difficulty === 'Medium' ? '#fbbf24' :
                                   '#ef4444'
                          }}>
                            {activity.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: activity.status === 'Accepted' || activity.type === 'solved_problem'
                        ? 'rgba(34, 197, 94, 0.15)' 
                        : activity.type === 'attempted_problem'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(148, 163, 184, 0.15)',
                      color: activity.status === 'Accepted' || activity.type === 'solved_problem' 
                        ? '#22c55e' 
                        : activity.type === 'attempted_problem'
                        ? '#ef4444'
                        : '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {activity.status === 'Accepted' || activity.type === 'solved_problem' ? 'Solved' : 
                       activity.type === 'attempted_problem' ? 'Attempted' : 
                       activity.type}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <span>
                      🎯 {activity.passed_tests}/{activity.total_tests} tests
                    </span>
                    <span>
                      {activity.submitted_at ? 
                        new Date(activity.submitted_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                        : 'Recently'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--card-bg-alt)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                No activity yet. Start solving problems to track your progress! 💪
              </p>
              <button 
                className="btn"
                onClick={() => navigate('/contests')}
                style={{
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  padding: '12px 28px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Start Solving Problems →
              </button>
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          open={editOpen}
          setOpen={setEditOpen}
        />
      )}
    </section>
  );
}

export default Profile;
