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
import { AssessmentReviewView } from "@/components/assessment/AssessmentReviewView";

// Define interfaces for type safety
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
  // State for view management
  const [viewMode, setViewMode] = useState<'dimensions' | 'assessment' | 'completion' | 'review'>('dimensions');
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  // Fetch assessments data
  const {
    data: assessmentsData,
    isLoading: isLoadingAssessments,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useAssessments();

  // Mutations
  const startAssessment = useStartAssessment({
    onError: (error) => console.error("Assessment start error:", error)
  });
  const submitResponse = useSubmitResponse({
    onError: (error) => console.error("Response submission error:", error)
  });

  // Extract data with type safety
  const assessments: Dimension[] = assessmentsData?.assessments || [];
  const overallProgress = assessmentsData?.overall_progress || 0;

  // Handle starting an assessment
  const handleStartAssessment = async (dimensionId: string) => {
    try {
      const result = await startAssessment.mutateAsync(dimensionId);
      setActiveAssessmentId(result.assessment_id);
      setViewMode('assessment');
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
        setViewMode("completion");
        await refetchAssessments();
      } else if (!result.next_question) {
        setViewMode("completion");
      }
    } catch (error) {
      console.error("Failed to submit response:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (viewMode === "assessment" && activeAssessmentId) {
      saveCurrentAssessment(activeAssessmentId);
    } else if (viewMode !== "assessment") {
      clearCurrentAssessment();
    }
  }, [viewMode, activeAssessmentId]);

  // Check for resumed assessment on initial load
  useEffect(() => {
    const savedAssessmentId = getCurrentAssessment();
    if (savedAssessmentId && viewMode === "dimensions") {
      setActiveAssessmentId(savedAssessmentId);
      setViewMode("assessment");
    }
  }, []);

  // Handle returning to dimensions view
  const handleBackToDimensions = async () => {
    setViewMode("dimensions");
    setActiveAssessmentId(null);
    await refetchAssessments();
  };

  // Handle reviewing an assessment
  const handleReviewAssessment = (assessmentId: string) => {
    setActiveAssessmentId(assessmentId);
    setViewMode('review');
  };

  // Loading state
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

  // Error state
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

  // Get the active assessment data
  const activeAssessment = activeAssessmentId
    ? startAssessment.data && startAssessment.data.assessment_id === activeAssessmentId
      ? startAssessment.data
      : submitResponse.data && submitResponse.data.assessment?.id === activeAssessmentId
        ? submitResponse.data.assessment
        : null
    : null;

  return (
    <AppLayout>
      <div className="container py-10">
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
                overallProgress={assessmentsData?.overall_progress || 0}
                className="mt-4 md:mt-0"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assessmentsData?.assessments?.map((dimension: Dimension) => (
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
            overallProgress={assessmentsData?.overall_progress || 0}
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