import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./modals/LoginModal";
import SignupModal from "./modals/SignupModal";
import { DEFAULT_AVATAR_URL } from "../utils/constants";
import PropTypes from "prop-types";

function Navbar({ signupOpen, setSignupOpen }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // modal states
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* Title */}
        <div className="nav-title" onClick={() => navigate("/")} style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ 
            fontSize: "1.8rem", 
            display: "inline-block",
            transition: "transform 0.3s ease"
          }} className="nav-icon">⚔️</span>
          <span>CodeArena</span>
        </div>

        {/* Main Navigation */}
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/contests" className="nav-link">Contests</Link>

          {currentUser && (
            <>
              <Link to="/profile" className="nav-link">Profile</Link>
              {currentUser.isAdmin && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
            </>
          )}
        </div>

        {/* User Section */}
        <div className="nav-user-section">
          {!currentUser && (
            <div className="auth-buttons">
              <button className="btn" onClick={() => setLoginOpen(true)}>Login</button>
              <button className="btn" onClick={() => setSignupOpen(true)}>Sign Up</button>
            </div>
          )}

          {currentUser && (
            <div className="user-profile" onClick={() => navigate("/profile")}>
              <div className="user-avatar">
                <img
                  src={currentUser.photoURL || DEFAULT_AVATAR_URL}
                  alt={`${currentUser.fullname}'s avatar`}
                  className="avatar-img"
                />
              </div>

              <span className="nav-fullname">{currentUser.fullname}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
      <SignupModal open={signupOpen} setOpen={setSignupOpen} />
    </>
  );
}

Navbar.propTypes = {
  signupOpen: PropTypes.bool,
  setSignupOpen: PropTypes.func
};

export default Navbar;
