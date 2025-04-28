"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DimensionCard } from "@/components/assessment/DimensionCard";
import { QuestionContainer } from "@/components/assessment/QuestionContainer";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { CompletionView } from "@/components/assessment/CompletionView";
import {
  useAssessments,
  useStartAssessment,
  useSubmitResponse
} from "@/hooks/useAssessments";
import { useEffect } from "react";
import { saveCurrentAssessment, getCurrentAssessment, clearCurrentAssessment } from "@/utils/assessment-storage";

export default function AssessmentPage() {
  // State for view management
  const [view, setView] = useState<"dimensions" | "questions" | "completion">("dimensions");
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  // Fetch assessments data
  const {
    data: assessmentsData,
    isLoading: isLoadingAssessments,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useAssessments();

  // Mutations
  const startAssessment = useStartAssessment();
  const submitResponse = useSubmitResponse();

  // Extract data
  const assessments = assessmentsData?.assessments || [];
  const overallProgress = assessmentsData?.overall_progress || 0;

  // Handle starting an assessment
  const handleStartAssessment = async (dimensionId: string) => {
    try {
      const result = await startAssessment.mutateAsync(dimensionId);
      setActiveAssessmentId(result.assessment_id);
      setView("questions");
    } catch (error) {
      console.error("Failed to start assessment:", error);
    }
  };

  // Handle submitting a response
  const handleSubmitResponse = async (assessmentId: string, questionId: string, value: string) => {
    try {
      const result = await submitResponse.mutateAsync({
        assessmentId,
        questionId,
        value
      });

      if (result.status === "completed") {
        setView("completion");
        await refetchAssessments();
      } else if (!result.next_question) {
        setView("completion");
      }
    } catch (error) {
      console.error("Failed to submit response:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (view === "questions" && activeAssessmentId) {
      saveCurrentAssessment(activeAssessmentId);
    } else if (view !== "questions") {
      clearCurrentAssessment();
    }
  }, [view, activeAssessmentId]);

  // Check for resumed assessment on initial load
  useEffect(() => {
    const savedAssessmentId = getCurrentAssessment();
    if (savedAssessmentId && view === "dimensions") {
      setActiveAssessmentId(savedAssessmentId);
      setView("questions");
    }
  }, []);

  // Handle returning to dimensions view
  const handleBackToDimensions = async () => {
    setView("dimensions");
    setActiveAssessmentId(null);
    await refetchAssessments();
  };

  // Loading state
  if (isLoadingAssessments && view === "dimensions") {
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

  // Error state
  if (assessmentsError && view === "dimensions") {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load assessments. Please try again.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button onClick={() => refetchAssessments()}>
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get the active assessment data
  const activeAssessment = activeAssessmentId
    ? startAssessment.data && startAssessment.data.assessment_id === activeAssessmentId
      ? startAssessment.data
      : submitResponse.data && submitResponse.data.assessment?.id === activeAssessmentId
        ? submitResponse.data
        : null
    : null;

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
            {assessments.map((dimension: any) => (
              <DimensionCard
                key={dimension.dimension_id}
                dimension={dimension}
                onStartAssessment={handleStartAssessment}
                loading={startAssessment.isPending}
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