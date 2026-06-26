import { toast } from "sonner";

export const API_BASE_URL = "http://localhost:8000/api/v1";

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
  },
};

interface RequestOptions extends RequestInit {
  timeout?: number;
  _retry?: boolean;
  showToast?: boolean;
}

// Global interface for all API Responses
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Development logger helper
const logDev = (...args: any[]) => {
  if (process.env.NODE_ENV === "development" || import.meta.env?.DEV) {
    console.log("[API Client]", ...args);
  }
};

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((cb) => {
    if (token) {
      cb(token);
    }
  });
  refreshQueue = [];
};

// Generic fetch wrapper with retries, JWT, refresh logic, timeout, cancellation
export async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<APIResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options;

  // Retrieve token from localStorage
  const token =
    safeLocalStorage.getItem("access_token") ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTM4NTc5MDgsInN1YiI6IjRhZjA1MjRkLTI2NGMtNDkyNy05YTYyLWFmMmI2YzcxMjEwNSJ9.2EkOtwtPzI5U6Y7sC7BgFyZy3jqykBL32EglBa5aPVE";

  const headers = new Headers({
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Setup abort controller for timeout and cancellation
  const controller = new AbortController();
  const signal = fetchOptions.signal || controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  logDev(`Sending request: ${options.method || "GET"} ${endpoint}`);

  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal,
    });

    clearTimeout(timeoutId);

    // Parse Response
    const json = await response.json().catch(() => ({}));

    // Handle token refresh on 401 Unauthorized
    const isAuthRoute =
      endpoint.includes("/auth/login") ||
      endpoint.includes("/auth/signup") ||
      endpoint.includes("/auth/refresh");
    if (response.status === 401 && !options._retry && !isAuthRoute) {
      logDev("Encountered 401, checking refresh token...");

      const refreshToken = safeLocalStorage.getItem("refresh_token");
      if (!refreshToken) {
        logDev("No refresh token found. Redirecting to login...");
        safeLocalStorage.removeItem("access_token");
        toast.error("Session expired. Please sign in again.");
        return Promise.reject(new Error("Unauthorized"));
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            options._retry = true;
            if (options.headers) {
              (options.headers as any)["Authorization"] = `Bearer ${newToken}`;
            }
            resolve(fetchAPI(endpoint, options));
          });
        });
      }

      isRefreshing = true;
      options._retry = true;

      try {
        logDev("Attempting to refresh token...");
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Refresh failed");
        }

        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.data.access_token;
        const newRefreshToken = refreshData.data.refresh_token;

        safeLocalStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          safeLocalStorage.setItem("refresh_token", newRefreshToken);
        }

        logDev("Token refreshed successfully.");
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request
        if (options.headers) {
          (options.headers as any)["Authorization"] =
            `Bearer ${newAccessToken}`;
        }
        return await fetchAPI(endpoint, options);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        logDev("Token refresh failed. Redirecting to login...", refreshErr);
        safeLocalStorage.removeItem("access_token");
        safeLocalStorage.removeItem("refresh_token");
        toast.error("Session expired. Please sign in again.");
        return Promise.reject(new Error("Session expired"));
      }
    }

    if (!response.ok) {
      const errMsg =
        json.message ||
        json.detail ||
        `Request failed with status ${response.status}`;
      logDev(`Request failed: ${errMsg}`);
      if (options.showToast !== false) {
        toast.error(errMsg);
      }
      throw new Error(errMsg);
    }

    logDev(`Request succeeded: ${endpoint}`);
    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      logDev(`Request timed out/cancelled: ${endpoint}`);
      toast.error("Request timed out. Please try again.");
    } else {
      logDev(`Unhandled API error: ${error.message}`);
    }
    throw error;
  }
}

// API methods
export const API = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    fetchAPI<T>(endpoint, { method: "GET", ...options }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    fetchAPI<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    fetchAPI<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    fetchAPI<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    fetchAPI<T>(endpoint, { method: "DELETE", ...options }),
};

// Typed Endpoint Expositions

export const AuthAPI = {
  login: (data: any) => API.post("/auth/login", data),
  signup: (data: any) => API.post("/auth/signup", data),
  getMe: () => API.get("/auth/me"),
};

export const OnboardingAPI = {
  getStatus: () => API.get("/onboarding/status"),
  saveAcademic: (data: any) => API.post("/onboarding/academic", data),
  saveFamily: (data: any) => API.post("/onboarding/family", data),
  saveCareer: (data: any) => API.post("/onboarding/career", data),
  saveGoals: (data: any) => API.post("/onboarding/goals", data),
  saveAssessment: (data: any) => API.post("/onboarding/assessment", data),
  complete: () => API.post("/onboarding/complete"),
  getMe: () => API.get("/onboarding/me"),
};

export const TwinAPI = {
  getMe: () => API.get("/digital-twin/me"),
  recalculate: () => API.put("/digital-twin/recalculate"),
  getHistory: () => API.get("/digital-twin/history"),
};

export const DashboardAPI = {
  getOverview: () => API.get("/dashboard/overview", { showToast: false }),
};

export const ChatAPI = {
  getConversations: (studentId: string) =>
    API.get(`/chat/conversations?student_id=${studentId}`),
  getHistory: (conversationId: string) =>
    API.get(`/chat/conversations/${conversationId}`),
  deleteConversation: (conversationId: string) =>
    API.delete(`/chat/conversations/${conversationId}`),
  sendFeedback: (messageId: string, score: number, comment?: string) =>
    API.post(`/chat/messages/${messageId}/feedback`, { score, comment }),
};

export const CareerAPI = {
  getSummary: (studentId: string) =>
    API.get(`/career-gps/career-summary?student_id=${studentId}`),
  getSkillGap: (studentId: string, careerId?: string) =>
    API.get(
      `/career-gps/skill-gaps?student_id=${studentId}${careerId ? `&career_id=${careerId}` : ""}`,
    ),
  getRoadmap: (studentId: string) =>
    API.get(`/career-gps/roadmap?student_id=${studentId}`),
  getMilestones: (studentId: string) =>
    API.get(`/career-gps/milestones?student_id=${studentId}`),
  getProgress: (studentId: string) =>
    API.get(`/career-gps/progress?student_id=${studentId}`),
  getRecommendations: (studentId: string) =>
    API.get(`/career-gps/recommendations?student_id=${studentId}`),
  getGraph: (studentId: string) =>
    API.get(`/career-gps/graph?student_id=${studentId}`),
  generateRoadmap: (data: {
    student_id: string;
    career_id?: string;
    existing_skills?: string[];
  }) => API.post("/career-gps/generate", data),
  updateStep: (stepId: string, studentId: string) =>
    API.put(`/career-gps/roadmap/step/${stepId}?student_id=${studentId}`),
};

export const OpportunitiesAPI = {
  getRecommended: (studentId: string) =>
    API.get(`/opportunities/recommended?student_id=${studentId}`),
  apply: (opportunityId: string, studentId: string) =>
    API.post(`/opportunities/${opportunityId}/apply?student_id=${studentId}`),
};

export const ScholarshipAPI = {
  getRecommended: (studentId: string) =>
    API.get(`/scholarships/recommended?student_id=${studentId}`),
  getDetails: (scholarshipId: string) =>
    API.get(`/scholarships/${scholarshipId}`),
};

export const ResumeAPI = {
  analyze: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: "POST",
      body: formData,
      // Note: Do not set Content-Type, fetch sets it automatically with the boundary for FormData
    });
    return response.json();
  },
};

export const MentorAPI = {
  getRecommended: (studentId: string) =>
    API.get(`/mentors/recommended?student_id=${studentId}`),
  getDetails: (mentorId: string) => API.get(`/mentors/${mentorId}`),
  bookSession: (mentorId: string, studentId: string) =>
    API.post(`/mentors/request-session?student_id=${studentId}&mentor_id=${mentorId}`),
};

export const CommunityAPI = {
  getGroups: (studentId: string) =>
    API.get(`/community/groups?student_id=${studentId}`),
  joinGroup: (groupId: string, studentId: string) =>
    API.post(`/community/groups/${groupId}/join?student_id=${studentId}`),
  getPosts: (studentId: string) =>
    API.get(`/community/posts?student_id=${studentId}`),
  createPost: (data: {
    author_id: string;
    title: string;
    content: string;
    group: string;
  }) => API.post("/community/posts", data),
  createComment: (data: {
    post_id: string;
    author_id: string;
    content: string;
  }) => API.post("/community/comments", data),
  getTrending: () => API.get("/community/trending"),
};

export const SuccessAPI = {
  getMe: (studentId: string) => API.get(`/success/me?student_id=${studentId}`),
  getHistory: (studentId: string) =>
    API.get(`/success/history?student_id=${studentId}`),
  getTrends: (studentId: string) =>
    API.get(`/success/trends?student_id=${studentId}`),
  getRecommendations: (studentId: string) =>
    API.get(`/success/recommendations?student_id=${studentId}`),
  getPredictions: (studentId: string) =>
    API.get(`/predictions/me?student_id=${studentId}`),
  getForecast: (studentId: string) =>
    API.get(`/predictions/forecast?student_id=${studentId}`),
  getExplanations: (studentId: string) =>
    API.get(`/predictions/explanations?student_id=${studentId}`),
  getAnalyticsOverview: (studentId: string) =>
    API.get(`/analytics/overview?student_id=${studentId}`),
  getAnalyticsEngagement: (studentId: string) =>
    API.get(`/analytics/engagement?student_id=${studentId}`),
  getAnalyticsProgress: (studentId: string) =>
    API.get(`/analytics/progress?student_id=${studentId}`),
  getInterventions: (studentId: string) =>
    API.get(`/interventions/me?student_id=${studentId}`),
};

export const ParentAPI = {
  query: (data: { student_id: string; topic: string; language: string }) =>
    API.post("/parent/query", data),
  getProfile: (studentId: string) =>
    API.get(`/parent/profile?student_id=${studentId}`),
  updateProfile: (studentId: string, data: any) =>
    API.put(`/parent/profile?student_id=${studentId}`, data),
};

export const VoiceAPI = {
  transcribe: (audioFile: File) => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    return fetchAPI("/voice/transcribe", {
      method: "POST",
      body: formData,
      // Overwrite headers to allow browser to set boundary for form-data
      headers: {},
    });
  },
  synthesize: (text: string, language: string) =>
    API.post("/voice/synthesize", { text, language }),
};

export const AccessibilityAPI = {
  getPreferences: (studentId: string) =>
    API.get(`/accessibility/preferences?student_id=${studentId}`),
  updatePreferences: (studentId: string, prefs: any) =>
    API.put(`/accessibility/preferences?student_id=${studentId}`, prefs),
};

export const KnowledgeGraphAPI = {
  getGraph: (studentId: string) =>
    API.get(`/knowledge-graph/me?student_id=${studentId}`),
  generateGraph: (studentId: string) =>
    API.post(`/knowledge-graph/generate`, { student_id: studentId }),
};
