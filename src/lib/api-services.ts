import { axiosInstance } from "./auth-service";

// Assessment API Services
export const AssessmentService = {
  // Get all assessments for the user
  getAssessments: async () => {
    try {
      const response = await axiosInstance.get('/assessments');
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  // Get assessment dimensions
  getDimensions: async () => {
    try {
      const response = await axiosInstance.get('/assessments/dimensions');
      return response.data.dimensions;
    } catch (error) {
      console.error('Error fetching dimensions:', error);
      throw error;
    }
  },

  // Start an assessment for a dimension
  startAssessment: async (dimensionId: string) => {
    try {
      const response = await axiosInstance.post('/assessments/start', {
        dimension_id: dimensionId
      });
      return response.data;
    } catch (error) {
      console.error('Error starting assessment:', error);
      throw error;
    }
  },

  // Get assessment details
  getAssessment: async (assessmentId: string) => {
    try {
      const response = await axiosInstance.get(`/assessments/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment details:', error);
      throw error;
    }
  },

  // Submit a response for a question
  submitResponse: async (assessmentId: string, questionId: string, value: any) => {
    try {
      const response = await axiosInstance.post('/assessments/responses', {
        assessment_id: assessmentId,
        question_id: questionId,
        value: value
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  },

  // Get questions for a dimension
  getQuestions: async (dimensionId:string) => {
    try {
      const response = await axiosInstance.get(`/assessments/questions/${dimensionId}`);
      return response.data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  // Get overall assessment progress
  getProgress: async () => {
    try {
      const response = await axiosInstance.get('/assessments/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  }
};

// Compatibility API Services
export const CompatibilityService = {
  // Get compatibility matrix
  getMatrix: async (dimensionId?: string | null, threshold?: number | null, minScore = null) => {
    try {
      let url = '/compatibility/matrix';
      const params = new URLSearchParams();
      
      if (dimensionId) params.append('dimension_id', dimensionId);
      if (minScore) params.append('min_score', minScore);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching compatibility matrix:', error);
      throw error;
    }
  },

  // Get compatibility with specific user
  getCompatibility: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/compatibility/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching compatibility with user:', error);
      throw error;
    }
  },

  // Get detailed compatibility report
  getDetailedReport: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/compatibility/report/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed compatibility report:', error);
      throw error;
    }
  }
};