// API utility for making requests to the backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
        } catch (e) {
            // If JSON parsing fails, use the status text
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    
    try {
        const data = await response.json();
        return data;
    } catch (e) {
        throw new Error('Failed to parse response JSON');
    }
};

// ========== Contest APIs ==========
export const contestAPI = {
    getAll: async (status = null) => {
        const url = status 
            ? `${API_URL}/contests?status=${status}` 
            : `${API_URL}/contests`;
        const response = await fetch(url);
        const data = await handleResponse(response);
        // Backend returns {contests: [...], total: n}, we need just the array
        return data.contests || data;
    },

    getById: async (contestId) => {
        const response = await fetch(`${API_URL}/contests/${contestId}`);
        const data = await handleResponse(response);
        // Backend returns {contest: {...}}, we need just the object
        return data.contest || data;
    },

    create: async (contestData) => {
        const response = await fetch(`${API_URL}/contests`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(contestData)
        });
        return handleResponse(response);
    },

    join: async (contestId) => {
        const response = await fetch(`${API_URL}/contests/${contestId}/join`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getLeaderboard: async (contestId) => {
        const response = await fetch(`${API_URL}/contests/${contestId}/leaderboard`);
        return handleResponse(response);
    },

    delete: async (contestId) => {
        const response = await fetch(`${API_URL}/contests/${contestId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// ========== Problem APIs ==========
export const problemAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.difficulty) params.append("difficulty", filters.difficulty);
        if (filters.contestId) params.append("contestId", filters.contestId);
        
        const url = `${API_URL}/problems${params.toString() ? `?${params}` : ""}`;
        const response = await fetch(url);
        const data = await handleResponse(response);
        // Backend returns {problems: [...]}, we need just the array
        return data.problems || data;
    },

    getById: async (problemId) => {
        const response = await fetch(`${API_URL}/problems/${problemId}`);
        const data = await handleResponse(response);
        // Backend returns {problem: {...}, testCases: [...]}, handle both formats
        return data.problem || data;
    },

    getByContest: async (contestId) => {
        const response = await fetch(`${API_URL}/problems?contestId=${contestId}`);
        const data = await handleResponse(response);
        return data.problems || data;
    },

    create: async (problemData) => {
        const response = await fetch(`${API_URL}/problems`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(problemData)
        });
        return handleResponse(response);
    },

    update: async (problemId, updates) => {
        const response = await fetch(`${API_URL}/problems/${problemId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },

    delete: async (problemId) => {
        const response = await fetch(`${API_URL}/problems/${problemId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    addTestCase: async (problemId, testCaseData) => {
        const response = await fetch(`${API_URL}/problems/${problemId}/test-cases`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(testCaseData)
        });
        return handleResponse(response);
    },

    getTestCases: async (problemId) => {
        const response = await fetch(`${API_URL}/problems/${problemId}/test-cases`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    deleteTestCase: async (problemId, testCaseId) => {
        const response = await fetch(`${API_URL}/problems/${problemId}/test-cases/${testCaseId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// ========== Submission APIs ==========
export const submissionAPI = {
    submit: async (submissionData) => {
        const response = await fetch(`${API_URL}/submissions`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(submissionData)
        });
        return handleResponse(response);
    },

    getById: async (submissionId) => {
        const response = await fetch(`${API_URL}/submissions/${submissionId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getStatus: async (submissionId) => {
        const response = await fetch(`${API_URL}/submissions/${submissionId}/status`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.userId) params.append("userId", filters.userId);
        if (filters.problemId) params.append("problemId", filters.problemId);
        if (filters.status) params.append("status", filters.status);
        
        const url = `${API_URL}/submissions${params.toString() ? `?${params}` : ""}`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// ========== User APIs ==========
export const userAPI = {
    getById: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`);
        return handleResponse(response);
    },

    update: async (userId, updates) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        return handleResponse(response);
    },

    getSubmissions: async (userId, limit = 50, offset = 0) => {
        const response = await fetch(`${API_URL}/users/${userId}/submissions?limit=${limit}&offset=${offset}`);
        return handleResponse(response);
    },

    getStats: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}/stats`);
        return handleResponse(response);
    },

    getAll: async (sortBy = "rating", limit = 100, offset = 0) => {
        const response = await fetch(`${API_URL}/users?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
        return handleResponse(response);
    }
};

export default {
    contestAPI,
    problemAPI,
    submissionAPI,
    userAPI
};
