import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contests from "./pages/Contests";
import ContestDetails from "./pages/ContestDetails";
import ProblemSolver from "./pages/ProblemSolver";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { useAuth } from "./context/AuthContext";
import PropTypes from "prop-types";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <>
      <Navbar signupOpen={signupOpen} setSignupOpen={setSignupOpen} />

      <Routes>
        <Route path="/" element={<Home setSignupOpen={setSignupOpen} />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:contestId" element={<ContestDetails />} />
        <Route path="/problems/:problemId" element={<ProblemSolver />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
