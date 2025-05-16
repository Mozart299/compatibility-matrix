import { axiosInstance } from "./auth-service";

export const AssessmentService = {
  // Get all assessments for the user
  getAssessments: async () => {
    try {
      const response = await axiosInstance.get("/assessments");
      return response.data;
    } catch (error) {
      console.error("Error fetching assessments:", error);
      throw error;
    }
  },

  // Get assessment dimensions
  getDimensions: async () => {
    try {
      const response = await axiosInstance.get("/assessments/dimensions");
      return response.data.dimensions;
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      throw error;
    }
  },

  // Start an assessment for a dimension
  startAssessment: async (dimensionId: string) => {
    try {
      const response = await axiosInstance.post("/assessments/start", {
        dimension_id: dimensionId,
      });
      return response.data;
    } catch (error) {
      console.error("Error starting assessment:", error);
      throw error;
    }
  },

  // Get assessment details
  getAssessment: async (assessmentId: string) => {
    try {
      const response = await axiosInstance.get(`/assessments/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assessment details:", error);
      throw error;
    }
  },

  // Submit a response for a question
  submitResponse: async (
    assessmentId: string,
    questionId: string,
    value: any
  ) => {
    try {
      const response = await axiosInstance.post("/assessments/responses", {
        assessment_id: assessmentId,
        question_id: questionId,
        value: value,
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting response:", error);
      throw error;
    }
  },

  // Get questions for a dimension
  getQuestions: async (dimensionId: string) => {
    try {
      const response = await axiosInstance.get(
        `/assessments/questions/${dimensionId}`
      );
      return response.data.questions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  // Get overall assessment progress
  getProgress: async () => {
    try {
      const response = await axiosInstance.get("/assessments/progress");
      return response.data;
    } catch (error) {
      console.error("Error fetching progress:", error);
      throw error;
    }
  },
};

export const CompatibilityService = {
  // Get compatibility matrix
  getMatrix: async (dimensionId?: string | null, minScore?: number | null) => {
    try {
      let url = "/compatibility/matrix";
      const params = new URLSearchParams();

      if (dimensionId) params.append("dimension_id", dimensionId);
      if (minScore !== null && minScore !== undefined)
        params.append("min_score", minScore.toString());

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching compatibility matrix:", error);
      throw error;
    }
  },

  // Get compatibility with specific user
  getCompatibility: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/compatibility/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching compatibility with user:", error);
      throw error;
    }
  },

  // Get detailed compatibility report
  getDetailedReport: async (userId: string) => {
    try {
      const response = await axiosInstance.get(
        `/compatibility/report/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching detailed compatibility report:", error);
      throw error;
    }
  },

  getBiometricCompatibility: async (userId: string) => {
    try {
      const response = await axiosInstance.get(
        `/biometrics/compatibility/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching biometric compatibility:", error);
      throw error;
    }
  },
};

// Enhanced Connections API Services
export const ConnectionsService = {
  // Get all connections for the user with optional status filter
  getConnections: async (status?: string) => {
    try {
      let url = "/connections";
      if (status) {
        url += `?status=${status}`;
      }
      const response = await axiosInstance.get(url);

      // Return the full data structure with connections array
      return response.data;
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw {
        message: "Failed to load connections. Please try again.",
        originalError: error,
      };
    }
  },

  // Send a connection request
  sendConnectionRequest: async (userId: string) => {
    try {
      const response = await axiosInstance.post("/connections/request", {
        user_id: userId,
      });
      return response.data;
    } catch (error: any) {
      // Handle specific error responses from the API
      const errorDetail =
        error.response?.data?.detail || "Failed to send connection request";
      console.error("Error sending connection request:", error);
      throw {
        message: errorDetail,
        originalError: error,
      };
    }
  },

  // Respond to a connection request (accept or decline)
  respondToConnectionRequest: async (
    connectionId: string,
    action: "accept" | "decline"
  ) => {
    try {
      const response = await axiosInstance.post(
        `/connections/${connectionId}/respond`,
        {
          action,
        }
      );
      return response.data;
    } catch (error: any) {
      // Handle specific error responses
      const errorDetail =
        error.response?.data?.detail ||
        `Failed to ${action} connection request`;
      console.error(`Error ${action}ing connection request:`, error);
      throw {
        message: errorDetail,
        originalError: error,
      };
    }
  },

  // Remove a connection or cancel a request
  removeConnection: async (connectionId: string) => {
    try {
      const response = await axiosInstance.delete(
        `/connections/${connectionId}`
      );
      return response.data;
    } catch (error: any) {
      // Handle specific error responses
      const errorDetail =
        error.response?.data?.detail || "Failed to remove connection";
      console.error("Error removing connection:", error);
      throw {
        message: errorDetail,
        originalError: error,
      };
    }
  },

  // Get suggested connections with optional parameters
  getSuggestedConnections: async (limit?: number, minScore?: number) => {
    try {
      let url = "/connections/suggested";
      const params = new URLSearchParams();

      if (limit) params.append("limit", limit.toString());
      if (minScore !== undefined)
        params.append("min_score", minScore.toString());

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: any) {
      // Handle specific error responses
      const errorDetail =
        error.response?.data?.detail || "Failed to fetch suggested connections";
      console.error("Error fetching suggested connections:", error);
      throw {
        message: errorDetail,
        originalError: error,
      };
    }
  },
};

// 5. Add a BiometricsService to src/lib/api-services.ts
export const BiometricsService = {
  // Get current user's HRV measurement
  getHrvData: async () => {
    try {
      const response = await axiosInstance.get("/biometrics/hrv");
      return response.data;
    } catch (error) {
      console.error("Error fetching HRV data:", error);
      throw error;
    }
  },

  // Save HRV measurement
  saveHrvMeasurement: async (data: any) => {
    try {
      const response = await axiosInstance.post("/biometrics/hrv", data);
      return response.data;
    } catch (error) {
      console.error("Error saving HRV measurement:", error);
      throw error;
    }
  },
};
