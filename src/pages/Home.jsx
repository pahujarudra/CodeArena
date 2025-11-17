import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

// Animated Counter Component
function AnimatedCounter({ target, duration = 2000, suffix = "", formatK = false }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const runAnimation = () => {
      let startTime;
      let animationFrame;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
        const current = Math.floor(easeOutQuart * target);
        
        setCount(current);

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return animationFrame;
    };

    // Run first animation
    runAnimation();

    // Repeat animation every 5 seconds
    const interval = setInterval(() => {
      setCount(0);
      setTimeout(() => runAnimation(), 100);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [hasAnimated, target, duration]);

  const formatNumber = (num) => {
    if (formatK && num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div ref={counterRef} className="stat-number">
      {formatNumber(count)}{suffix}
    </div>
  );
}

AnimatedCounter.propTypes = {
  target: PropTypes.number.isRequired,
  duration: PropTypes.number,
  suffix: PropTypes.string,
  formatK: PropTypes.bool
};

function Home({ setSignupOpen }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeContest, setActiveContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const loadActiveContest = async () => {
    try {
      setLoading(true);
      console.log("Loading active contests from Firestore...");
      const snap = await getDocs(collection(db, "contests"));
      console.log("Home - Contests snapshot received. Empty?", snap.empty, "Size:", snap.size);
      
      const now = new Date();
      let active = null;

      snap.forEach(doc => {
        const data = doc.data();
        const start = data.startTime?.toDate();
        const end = data.endTime?.toDate();

        if (start && end && start <= now && end >= now) {
          active = {
            id: doc.id,
            title: data.title,
            description: data.description,
            start,
            end
          };
        }
      });

      console.log("Active contest found:", active);
      setActiveContest(active);
      setLoading(false);
    } catch (error) {
      console.error("Error loading contests:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveContest();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!activeContest || !activeContest.end) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = activeContest.end.getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeContest]);

  return (
    <section id="home" className="page">
      {/* Animated Background with Gradient Orbs */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden"
      }}>
        {/* Animated gradient orbs - more visible */}
        <div style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 40%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 25s ease-in-out infinite, pulse 4s ease-in-out infinite",
          filter: "blur(60px)"
        }}></div>
        <div style={{
          position: "absolute",
          top: "50%",
          right: "5%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 20s ease-in-out infinite reverse, pulse 5s ease-in-out infinite",
          filter: "blur(60px)"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "15%",
          left: "20%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.10) 0%, rgba(168, 85, 247, 0.03) 40%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 22s ease-in-out infinite, pulse 6s ease-in-out infinite",
          filter: "blur(60px)"
        }}></div>
        
        {/* Animated rings */}
        <div style={{
          position: "absolute",
          top: "30%",
          right: "15%",
          width: "300px",
          height: "300px",
          border: "2px solid rgba(99, 102, 241, 0.15)",
          borderRadius: "50%",
          animation: "spin 30s linear infinite, float 15s ease-in-out infinite"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "25%",
          right: "30%",
          width: "200px",
          height: "200px",
          border: "2px solid rgba(139, 92, 246, 0.15)",
          borderRadius: "50%",
          animation: "spin 25s linear infinite reverse, float 18s ease-in-out infinite"
        }}></div>
        
        {/* Floating particles - more visible */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 8 + 12}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ 
        textAlign: "center",
        paddingTop: "80px",
        marginBottom: "100px"
      }}>
        <h1 className="hero-title">Welcome to CodeArena</h1>
        <p className="hero-subtitle">Challenge yourself with competitive programming contests, improve your skills, and compete with developers worldwide.</p>
        
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          justifyContent: "center",
          marginTop: "48px",
          flexWrap: "wrap"
        }}>
          <button 
            className="btn hero-btn-primary" 
            onClick={() => {
              if (currentUser) {
                navigate("/contests");
              } else {
                setSignupOpen(true);
              }
            }}
          >
            Get Started →
          </button>
          <button 
            className="btn hero-btn-secondary" 
            onClick={() => navigate("/contests")}
          >
            View Contests
          </button>
        </div>
      </div>

      {/* Features Grid - Revamped */}
      <div className="features-grid">
        <div className="feature-card-home">
          <div className="feature-icon">🏆</div>
          <h3>Competitive Contests</h3>
          <p>Join live coding contests and compete with programmers globally in real-time challenges</p>
          <div className="feature-badge">Popular</div>
        </div>
        <div className="feature-card-home">
          <div className="feature-icon">📚</div>
          <h3>Practice Problems</h3>
          <p>Solve thousands of coding challenges across all difficulty levels and master algorithms</p>
          <div className="feature-badge">Essential</div>
        </div>
        <div className="feature-card-home">
          <div className="feature-icon">📊</div>
          <h3>Track Progress</h3>
          <p>Monitor your performance with detailed analytics and watch your skills grow over time</p>
          <div className="feature-badge">Pro</div>
        </div>
      </div>

      {/* Statistics Section - Modernized */}
      <div className="stats-section">
        <div className="stats-background-icon">⚔️</div>
        
        <h2 className="stats-title">Join Our Growing Community</h2>
        
        <div className="stats-grid">
          <div className="stat-item">
            <AnimatedCounter target={10000} duration={3500} suffix="+" formatK={true} />
            <div className="stat-label">Active Coders</div>
            <div className="stat-icon">👨‍💻</div>
          </div>
          
          <div className="stat-item">
            <AnimatedCounter target={500} duration={3500} suffix="+" formatK={false} />
            <div className="stat-label">Contests Hosted</div>
            <div className="stat-icon">🎯</div>
          </div>
          
          <div className="stat-item">
            <AnimatedCounter target={50000} duration={3500} suffix="+" formatK={true} />
            <div className="stat-label">Problems Solved</div>
            <div className="stat-icon">✅</div>
          </div>
          
          <div className="stat-item">
            <AnimatedCounter target={100} duration={3500} suffix="+" formatK={false} />
            <div className="stat-label">Countries</div>
            <div className="stat-icon">🌍</div>
          </div>
        </div>
      </div>

      {/* Active Contest Section */}
      <div className="active-contest-section">
        <h2 className="section-title">🔥 Active Contests</h2>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading active contests...</p>
          </div>
        ) : !activeContest ? (
          <div className="no-contest-card">
            <div className="no-contest-icon">🎯</div>
            <p className="no-contest-text">No active contests right now. Check back soon or browse upcoming contests!</p>
            <button 
              className="btn explore-btn" 
              onClick={() => navigate("/contests")}
            >
              Explore All Contests →
            </button>
          </div>
        ) : (
          <div className="active-contest-card">
            <div className="contest-badge-live">● LIVE NOW</div>
            <h3>{activeContest.title}</h3>
            <p className="contest-description">{activeContest.description}</p>
            
            {/* Countdown Timer */}
            <div className="countdown-timer">
              <div className="countdown-label">⏰ Contest Ends In:</div>
              <div className="countdown-boxes">
                <div className="countdown-box">
                  <div className="countdown-number">{String(countdown.days).padStart(2, '0')}</div>
                  <div className="countdown-unit">Days</div>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-box">
                  <div className="countdown-number">{String(countdown.hours).padStart(2, '0')}</div>
                  <div className="countdown-unit">Hours</div>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-box">
                  <div className="countdown-number">{String(countdown.minutes).padStart(2, '0')}</div>
                  <div className="countdown-unit">Minutes</div>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-box">
                  <div className="countdown-number">{String(countdown.seconds).padStart(2, '0')}</div>
                  <div className="countdown-unit">Seconds</div>
                </div>
              </div>
            </div>

            <div className="contest-times">
              <div className="time-item">
                <span className="time-label">Started:</span>
                <span className="time-value">{activeContest.start.toLocaleString("en-IN")}</span>
              </div>
              <div className="time-item">
                <span className="time-label">Ends:</span>
                <span className="time-value">{activeContest.end.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button 
              className="btn join-contest-btn" 
              onClick={() => navigate("/contests")}
            >
              Join Now →
            </button>
          </div>
        )}
      </div>

      {/* Why Choose CodeArena - Interactive Cards */}
      <div className="why-section">
        <h2 className="section-title-main">Why Choose CodeArena?</h2>
        
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">💻</div>
            <h3>Multi-language Support</h3>
            <p>Code in your preferred language - Java, Python, C++, or JavaScript</p>
            <div className="why-hover-effect"></div>
          </div>
          
          <div className="why-card">
            <div className="why-icon">🎯</div>
            <h3>Difficulty Levels</h3>
            <p>From beginner to expert, find challenges that match your skill level and help you grow</p>
            <div className="why-hover-effect"></div>
          </div>
          
          <div className="why-card">
            <div className="why-icon">�</div>
            <h3>Detailed Solutions</h3>
            <p>Learn from comprehensive explanations and multiple approaches to each problem</p>
            <div className="why-hover-effect"></div>
          </div>
          
          <div className="why-card">
            <div className="why-icon">🌐</div>
            <h3>Global Community</h3>
            <p>Connect with coders worldwide, share knowledge, and learn together</p>
            <div className="why-hover-effect"></div>
          </div>
          
          <div className="why-card">
            <div className="why-icon">⏱️</div>
            <h3>Time-Limited Challenges</h3>
            <p>Test your skills under pressure with exciting timed contests and competitions</p>
            <div className="why-hover-effect"></div>
          </div>
          
          <div className="why-card">
            <div className="why-icon">📈</div>
            <h3>Performance Analytics</h3>
            <p>Track your progress with detailed stats and insights about your coding journey</p>
            <div className="why-hover-effect"></div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-glow"></div>
        <div className="cta-icon-bg">🚀</div>
        
        <h2 className="cta-title">Ready to Start Your Journey?</h2>
        <p className="cta-subtitle">
          Join thousands of developers who are already improving their skills through competitive programming
        </p>
        <button 
          className="btn cta-button" 
          onClick={() => {
            if (currentUser) {
              navigate("/contests");
            } else {
              setSignupOpen(true);
            }
          }}
        >
          <span>Start Coding Now</span>
          <span className="cta-arrow">→</span>
        </button>
      </div>
    </section>
  );
}

Home.propTypes = {
  setSignupOpen: PropTypes.func
};

export default Home;
