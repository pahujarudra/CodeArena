import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("token"));

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            "Authorization": `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setCurrentUser(userData);
                        setToken(storedToken);
                    } else {
                        // Token invalid or expired
                        localStorage.removeItem("token");
                        setToken(null);
                        setCurrentUser(null);
                    }
                } catch (error) {
                    console.error("Auth check error:", error);
                    localStorage.removeItem("token");
                    setToken(null);
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Signup function
    const signup = async (email, password, username, fullName) => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password, username, fullName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            // Store token and user data
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setCurrentUser(data.user);

            return data.user;
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Store token and user data
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setCurrentUser(data.user);

            return data.user;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            setToken(null);
            setCurrentUser(null);
        }
    };

    // Update user profile
    const updateProfile = async (updates) => {
        try {
            const response = await fetch(`${API_URL}/users/${currentUser.userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Update failed");
            }

            setCurrentUser(data.user);
            return data.user;
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        setCurrentUser,
        token,
        signup,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === "admin"
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
