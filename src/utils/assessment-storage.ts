// src/utils/assessment-storage.ts
const CURRENT_ASSESSMENT_KEY = 'current-assessment';

export function saveCurrentAssessment(assessmentId: string) {
  localStorage.setItem(CURRENT_ASSESSMENT_KEY, assessmentId);
}

export function getCurrentAssessment(): string | null {
  return localStorage.getItem(CURRENT_ASSESSMENT_KEY);
}

export function clearCurrentAssessment() {
  localStorage.removeItem(CURRENT_ASSESSMENT_KEY);
}