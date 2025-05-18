"use client";

import { useState, useEffect } from "react";
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
import { saveCurrentAssessment, getCurrentAssessment, clearCurrentAssessment } from "@/utils/assessment-storage";
import { AssessmentReviewView } from "@/components/assessment/AssessmentReviewView";

interface Dimension {
  dimension_id: string;
  dimension_name: string;
  dimension_description: string;
  status: string;
  progress: number;
  id?: string;
}
interface AssessmentData {
  assessments?: Dimension[];
  overall_progress: number;
}

export default function AssessmentPage() {
  // State and hooks at the top level
  const [viewMode, setViewMode] = useState<'dimensions' | 'assessment' | 'completion' | 'review'>('dimensions');
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: assessmentsData,
    isLoading: isLoadingAssessments,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useAssessments();

  const startAssessment = useStartAssessment({
    onError: (error) => {
      console.error("Assessment start error:", error);
      setErrorMessage("Failed to start assessment. Please try again.");
    }
  });
  const submitResponse = useSubmitResponse({
    onError: (error) => {
      console.error("Response submission error:", error);
      setErrorMessage("Failed to submit response. Please try again.");
    }
  });

  // Construct activeAssessment
  const activeAssessment = activeAssessmentId
    ? submitResponse.data && submitResponse.data.assessment?.id === activeAssessmentId
      ? {
          ...submitResponse.data.assessment,
          next_question: submitResponse.data.next_question,
          completed_questions: submitResponse.data.completed_questions,
          total_questions: submitResponse.data.total_questions
        }
      : startAssessment.data && startAssessment.data.assessment_id === activeAssessmentId
        ? startAssessment.data
        : null
    : null;

  // Log activeAssessment for debugging
  useEffect(() => {
    console.log("activeAssessment constructed:", activeAssessment);
  }, [activeAssessment]);

  // Other hooks
  useEffect(() => {
    if (viewMode === "assessment" && activeAssessmentId) {
      saveCurrentAssessment(activeAssessmentId);
    } else {
      clearCurrentAssessment();
    }
  }, [viewMode, activeAssessmentId]);

  useEffect(() => {
    const savedAssessmentId = getCurrentAssessment();
    if (savedAssessmentId && viewMode === "dimensions") {
      setActiveAssessmentId(savedAssessmentId);
      setViewMode("assessment");
    }
  }, []);

  // Handlers
  const handleStartAssessment = async (dimensionId: string) => {
    try {
      setErrorMessage(null);
      const result = await startAssessment.mutateAsync(dimensionId);
      setActiveAssessmentId(result.assessment_id);
      setViewMode('assessment');
    } catch (error) {
      console.error("Failed to start assessment:", error);
      setErrorMessage("Failed to start assessment. Please try again.");
    }
  };

  const handleSubmitResponse = async (assessmentId: string, questionId: string, value: string) => {
    try {
      setErrorMessage(null);
      const result = await submitResponse.mutateAsync({
        assessmentId,
        questionId,
        value
      });

      console.log("Submit response result:", result);

      if (result.status === "completed") {
        console.log("Assessment completed, transitioning to completion view");
        setViewMode("completion");
        await refetchAssessments();
      } else if (result.next_question) {
        console.log("Next question available:", result.next_question);
      } else {
        console.warn("No next question and not completed, transitioning to completion");
        setViewMode("completion");
      }
    } catch (error) {
      console.error("Failed to submit response:", error);
      setErrorMessage("Failed to submit response. Please try again.");
      throw error;
    }
  };

  const handleBackToDimensions = async () => {
    setViewMode("dimensions");
    setActiveAssessmentId(null);
    setErrorMessage(null);
    await refetchAssessments();
  };

  const handleReviewAssessment = (assessmentId: string) => {
    setActiveAssessmentId(assessmentId);
    setViewMode('review');
    setErrorMessage(null);
  };

  // Early returns after all hooks
  if (isLoadingAssessments && viewMode === "dimensions") {
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

  if (assessmentsError && viewMode === "dimensions") {
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

  const assessments: Dimension[] = assessmentsData?.assessments || [];
  const overallProgress = assessmentsData?.overall_progress || 0;

  return (
    <AppLayout>
      <div className="container py-10">
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {viewMode === 'dimensions' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
                <p className="text-muted-foreground">
                  Complete assessments to improve your compatibility insights
                </p>
              </div>
              <AssessmentProgress
                overallProgress={overallProgress}
                className="mt-4 md:mt-0"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assessments
              .filter((dimension: Dimension) => dimension.dimension_name !== 'Physiological Compatibility')
              .map((dimension: Dimension) => (
                <DimensionCard
                  key={dimension.dimension_id}
                  dimension={dimension}
                  onStartAssessment={handleStartAssessment}
                  onReviewAssessment={handleReviewAssessment}
                  loading={startAssessment.isPending}
                />
              ))}
            </div>
          </>
        )}

        {viewMode === 'assessment' && activeAssessmentId && (
          <QuestionContainer
            activeAssessment={{
              assessment_id: activeAssessmentId,
              ...activeAssessment
            }}
            onBackToDimensions={handleBackToDimensions}
            onSubmitResponse={handleSubmitResponse}
          />
        )}

        {viewMode === 'completion' && (
          <CompletionView
            activeAssessment={activeAssessment || {}}
            overallProgress={overallProgress}
            onBackToDimensions={handleBackToDimensions}
          />
        )}

        {viewMode === 'review' && activeAssessmentId && (
          <AssessmentReviewView
            assessmentId={activeAssessmentId}
            onBack={handleBackToDimensions}
          />
        )}
      </div>
    </AppLayout>
  );
}