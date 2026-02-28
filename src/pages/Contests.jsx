import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function Contests() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadContests = async () => {
    try {
      setLoading(true);
      console.log("Loading contests from Firestore...");
      const snap = await getDocs(collection(db, "contests"));
      console.log("Contests snapshot received. Empty?", snap.empty, "Size:", snap.size);
      
      const now = new Date();
      let list = [];

      snap.forEach(docSnap => {
        const data = docSnap.data();
        console.log("Contest data:", docSnap.id, data);
        
        const start = data.startTime?.toDate();
        const end = data.endTime?.toDate();

        if (!start || !end) {
          console.warn("Skipping contest with invalid dates:", docSnap.id);
          return;
        }

        const status =
          now < start ? "upcoming" :
          now >= start && now <= end ? "active" :
          "ended";

        list.push({
          id: docSnap.id,
          title: data.title || "Untitled Contest",
          description: data.description || "",
          start,
          end,
          status
        });
      });

      console.log("Loaded contests:", list.length, list);

      // sort by status priority then time
      const priority = { active: 1, upcoming: 2, ended: 3 };

      list.sort((a, b) => {
        if (priority[a.status] !== priority[b.status]) {
          return priority[a.status] - priority[b.status];
        }
        return a.start - b.start;
      });

      setContests(list);
      setLoading(false);
    } catch (error) {
      console.error("Error loading contests:", error);
      alert("Failed to load contests. Please check console for details.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (filter === "all") setFiltered(contests);
    else setFiltered(contests.filter(c => c.status === filter));
  }, [filter, contests]);

  const getStatusEmoji = (status) => {
    switch(status) {
      case "active": return "🟢";
      case "upcoming": return "🟡";
      case "ended": return "⚪";
      default: return "";
    }
  };

  return (
    <section id="contests" className="page">
      {/* Background decoration - Consistent Purple Theme */}
      <div style={{
        position: "fixed",
        top: "0",
        right: "-100px",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(60px)",
        animation: "float 22s ease-in-out infinite"
      }}></div>
      <div style={{
        position: "fixed",
        bottom: "10%",
        left: "-150px",
        width: "450px",
        height: "450px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(60px)",
        animation: "float 18s ease-in-out infinite reverse"
      }}></div>

      <div className="current-contests">
        <h1>All Contests</h1>

        <select
          id="contests-selector"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Contests</option>
          <option value="upcoming">⏰ Upcoming</option>
          <option value="active">🔴 Active</option>
          <option value="ended">✅ Ended</option>
        </select>
      </div>

      <div id="contests-box">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            <span className="spinner"></span> Loading contests...
          </p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "4rem", marginBottom: "16px" }}>🔍</p>
            <p style={{ fontSize: "1.3rem", color: "var(--text-primary)", fontWeight: "600", marginBottom: "8px" }}>
              No contests found
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
              {filter === "all" ? "Check back later for upcoming contests!" : `No ${filter} contests available right now.`}
            </p>
          </div>
        ) : (
          filtered.map(c => (
            <div 
              className={`contest-card ${c.status}`} 
              key={c.id}
              onClick={() => navigate(`/contests/${c.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="contest-card-info">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h3 style={{ margin: 0 }}>{c.title}</h3>
                  <span style={{
                    fontSize: "1.2rem",
                    animation: c.status === "active" ? "pulse 2s ease-in-out infinite" : "none"
                  }}>
                    {getStatusEmoji(c.status)}
                  </span>
                </div>
                <p>{c.description}</p>

                <p className="time-para">
                  <strong>Start:</strong> {c.start.toLocaleString("en-IN", { 
                    dateStyle: "medium", 
                    timeStyle: "short" 
                  })}
                </p>
                <p className="time-para">
                  <strong>End:</strong> {c.end.toLocaleString("en-IN", { 
                    dateStyle: "medium", 
                    timeStyle: "short" 
                  })}
                </p>
              </div>

              <div className="contest-card-time">
                <p>{c.status.toUpperCase()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Contests;
