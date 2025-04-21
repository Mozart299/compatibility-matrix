// src/app/assessment/page.tsx (refactored)
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentService } from "@/lib/api-services";
import { DimensionCard } from "@/components/assessment/DimensionCard";
import { QuestionContainer } from "@/components/assessment/QuestionContainer";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { CompletionView } from "@/components/assessment/CompletionView";

export default function AssessmentPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<
    { dimension_id: string; dimension_name: string; dimension_description: string; status: string; progress: number }[]
  >([]);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // State for active assessment
  const [activeAssessment, setActiveAssessment] = useState<{
    assessment_id: string;
    dimension?: { name: string };
    status?: string;
    progress?: number;
    completed_questions?: number;
    total_questions?: number;
    next_question?: { id: string; text: string; options: string };
  } | null>(null);
  
  // View state: "dimensions", "questions", "completion"
  const [view, setView] = useState("dimensions");
  
  // Load assessment data
  useEffect(() => {
    loadAssessments();
  }, []);
  
  async function loadAssessments() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assessment data from API
      const assessmentData = await AssessmentService.getAssessments();
      setAssessments(assessmentData.assessments);
      setOverallProgress(assessmentData.overall_progress);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading assessments:", err);
      setError("Failed to load assessments. Please try again.");
      setLoading(false);
    }
  }
  
  // Handle starting an assessment
  const handleStartAssessment = async (dimensionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Start or continue assessment via API
      const assessment = await AssessmentService.startAssessment(dimensionId);
      setActiveAssessment(assessment);
      
      setView("questions");
      setLoading(false);
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError("Failed to start assessment. Please try again.");
      setLoading(false);
    }
  };
  
  // Handle submitting the current response and moving to next question
  const handleSubmitResponse = async (assessmentId: string, questionId: string, responseValue: string) => {
    try {
      // Submit response to API
      const result = await AssessmentService.submitResponse(
        assessmentId,
        questionId,
        responseValue
      );
      
      // Check if assessment is complete
      if (result.status === "completed") {
        setView("completion");
        
        // Refresh assessments list to update progress
        const assessmentData = await AssessmentService.getAssessments();
        setAssessments(assessmentData.assessments);
        setOverallProgress(assessmentData.overall_progress);
      } else if (result.next_question) {
        // Update the active assessment with new progress and next question
        setActiveAssessment({
          ...activeAssessment!,
          status: result.status,
          progress: result.progress,
          completed_questions: result.completed_questions,
          total_questions: result.total_questions,
          next_question: result.next_question
        });
      } else {
        // No more questions, show completion
        setView("completion");
      }
    } catch (err) {
      console.error("Error submitting response:", err);
      setError("Failed to submit response. Please try again.");
      throw err;
    }
  };
  
  // Handle returning to dimensions view
  const handleBackToDimensions = async () => {
    try {
      // Refresh assessments list to ensure latest data
      const assessmentData = await AssessmentService.getAssessments();
      setAssessments(assessmentData.assessments);
      setOverallProgress(assessmentData.overall_progress);
      
      setView("dimensions");
      setActiveAssessment(null);
    } catch (err) {
      console.error("Error refreshing assessments:", err);
      setView("dimensions");
    }
  };
  
  // Display loading state
  if (loading && !activeAssessment) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading assessments...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Display error state
  if (error && !activeAssessment) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 sm:py-8 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assessment</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Complete the assessment to improve your compatibility results
            </p>
          </div>
          <AssessmentProgress overallProgress={overallProgress} />
        </div>

        {view === "dimensions" && (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assessments.map((dimension) => (
              <DimensionCard
                key={dimension.dimension_id}
                dimension={dimension}
                onStartAssessment={handleStartAssessment}
                loading={loading}
              />
            ))}
          </div>
        )}

        {view === "questions" && activeAssessment && (
          <QuestionContainer
            activeAssessment={activeAssessment}
            onBackToDimensions={handleBackToDimensions}
            onSubmitResponse={handleSubmitResponse}
          />
        )}

        {view === "completion" && activeAssessment && (
          <CompletionView
            activeAssessment={activeAssessment}
            overallProgress={overallProgress}
            onBackToDimensions={handleBackToDimensions}
          />
        )}
      </div>
    </AppLayout>
  );
}