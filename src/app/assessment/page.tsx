"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AssessmentService } from "@/lib/api-services";

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
  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    text: string;
    options: string;
  } | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [responseSubmitting, setResponseSubmitting] = useState(false);
  
  // View state: "dimensions", "questions", "completion"
  const [view, setView] = useState("dimensions");
  
  // Load assessment data
  useEffect(() => {
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
    
    loadAssessments();
  }, []);
  
  // Handle starting an assessment
  const handleStartAssessment = async (dimensionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Start or continue assessment via API
      const assessment = await AssessmentService.startAssessment(dimensionId);
      setActiveAssessment(assessment);
      
      // Set the current question
      setCurrentQuestion(assessment.next_question);
      setCurrentResponse(null);
      
      setView("questions");
      setLoading(false);
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError("Failed to start assessment. Please try again.");
      setLoading(false);
    }
  };
  
  // Handle response submission
  const handleResponseChange = (value: string) => {
    setCurrentResponse(value);
  };
  
  // Handle submitting the current response and moving to next question
  const handleNextQuestion = async () => {
    if (!currentResponse || !activeAssessment || !currentQuestion) return;
    
    try {
      setResponseSubmitting(true);
      
      // Submit response to API
      const result = await AssessmentService.submitResponse(
        activeAssessment.assessment_id,
        currentQuestion.id,
        currentResponse
      );
      
      // Check if assessment is complete
      if (result.status === "completed") {
        setView("completion");
        
        // Refresh assessments list to update progress
        const assessmentData = await AssessmentService.getAssessments();
        setAssessments(assessmentData.assessments);
        setOverallProgress(assessmentData.overall_progress);
      } else if (result.next_question) {
        // Move to next question
        setCurrentQuestion(result.next_question);
        setCurrentResponse(null);
      } else {
        // No more questions, show completion
        setView("completion");
      }
      
      // Update the active assessment with new progress
      setActiveAssessment({
        ...activeAssessment,
        status: result.status,
        progress: result.progress,
        completed_questions: result.completed_questions,
        total_questions: result.total_questions
      });
      
      setResponseSubmitting(false);
    } catch (err) {
      console.error("Error submitting response:", err);
      setError("Failed to submit response. Please try again.");
      setResponseSubmitting(false);
    }
  };
  
  // Handle going back to previous question (not implemented in API, would need to track locally)
  const handlePreviousQuestion = () => {
    // In this version, we don't support going back to previous questions
    // You would need to track the question history locally to implement this
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
      setCurrentQuestion(null);
      setCurrentResponse(null);
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
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Progress:</span>
            <div className="w-full md:w-40 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-medium">{overallProgress}%</span>
          </div>
        </div>

        {view === "dimensions" && (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assessments.map((dimension) => (
              <Card 
                key={dimension.dimension_id} 
                className={dimension.status === "completed" ? "border-green-200" : ""}
              >
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{dimension.dimension_name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{dimension.dimension_description}</CardDescription>
                    </div>
                    {dimension.status === "completed" && (
                      <Badge className="bg-green-500 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {dimension.status === "in_progress" && (
                      <Badge variant="secondary" className="text-xs">In Progress</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Progress</span>
                      <span>
                        {dimension.status === "not_started" ? "0" : dimension.progress}%
                      </span>
                    </div>
                    <Progress
                      value={dimension.status === "not_started" ? 0 : dimension.progress}
                      className={
                        dimension.status === "completed" ? "bg-green-100" : ""
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
                  {dimension.status === "completed" && (
                    <Button variant="outline" className="w-full text-xs sm:text-sm">
                      Review Answers
                    </Button>
                  )}
                  {dimension.status === "in_progress" && (
                    <Button
                      className="w-full text-xs sm:text-sm"
                      onClick={() => handleStartAssessment(dimension.dimension_id)}
                      disabled={loading}
                    >
                      Continue
                    </Button>
                  )}
                  {dimension.status === "not_started" && (
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => handleStartAssessment(dimension.dimension_id)}
                      disabled={loading}
                    >
                      Start Assessment
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {view === "questions" && activeAssessment && currentQuestion && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    {activeAssessment.dimension?.name || "Assessment"}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Question {(activeAssessment.completed_questions ?? 0) + 1} of {activeAssessment.total_questions ?? 0}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBackToDimensions} className="text-xs">
                  Save & Exit
                </Button>
              </div>
              <Progress
                value={(((activeAssessment.completed_questions ?? 0) + 1) / (activeAssessment.total_questions ?? 1)) * 100}
                className="mt-4"
              />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium">{currentQuestion.text}</h3>
                <RadioGroup
                  value={currentResponse ?? undefined}
                  onValueChange={handleResponseChange}
                  className="gap-2 sm:gap-3"
                >
                  {currentQuestion.options && JSON.parse(currentQuestion.options).map((option: { value: string | number; label: string }) => (
                    <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem 
                        value={option.value.toString()} 
                        id={`option-${option.value}`} 
                      />
                      <Label htmlFor={`option-${option.value}`} className="cursor-pointer w-full text-xs sm:text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousQuestion}
                disabled={true} // Disabled as we don't support going back
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={handleNextQuestion}
                disabled={!currentResponse || responseSubmitting}
              >
                {responseSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  (activeAssessment.completed_questions ?? 0) + 1 < (activeAssessment.total_questions ?? 0)
                    ? "Next"
                    : "Complete"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {view === "completion" && activeAssessment && (
          <Card className="max-w-3xl mx-auto text-center">
            <CardHeader className="p-4 sm:p-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {activeAssessment.dimension?.name || "Assessment"} Completed!
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                You've completed this dimension of your compatibility assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm">
                  This information will be used to calculate your compatibility with others.
                  Continue with other assessment dimensions to get even more accurate results.
                </p>
                <div className="py-4 sm:py-6">
                  <Separator />
                </div>
                <p className="font-medium text-sm sm:text-base">Overall Assessment Progress</p>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span>Progress</span>
                  <span>{overallProgress}% Complete</span>
                </div>
                <Progress value={overallProgress} />
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button variant="outline" onClick={handleBackToDimensions} className="w-full sm:w-auto text-xs sm:text-sm">
                View All Dimensions
              </Button>
              <Button onClick={handleBackToDimensions} className="w-full sm:w-auto text-xs sm:text-sm">
                Continue Assessment
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}