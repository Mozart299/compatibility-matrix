
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionFactory } from "./questions/QuestionFactory";
import { useAssessment } from "@/hooks/useAssessments";
import { Skeleton } from "@/components/ui/skeleton";

interface AssessmentReviewViewProps {
  assessmentId: string;
  onBack: () => void;
}

export function AssessmentReviewView({ assessmentId, onBack }: AssessmentReviewViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Fetch assessment data
  const { data, isLoading, isError } = useAssessment(assessmentId);
  
  const answeredQuestions = data?.answered_questions || [];
  const dimension = data?.dimension || {};
  
  // Handle navigation between questions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < answeredQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };
  
  // If loading, show a skeleton UI
  if (isLoading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2 w-full mt-4" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-4">
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
        <CardFooter className="p-4 sm:p-6 flex justify-between">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  // If error or no questions found
  if (isError || !answeredQuestions.length) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Review Assessment</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isError ? "Error loading assessment" : "No answers to review"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {isError 
              ? "There was a problem loading this assessment. Please try again."
              : "There are no answered questions to review for this assessment."
            }
          </p>
          <Button onClick={onBack}>Back to Assessments</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Get current question to display
  const currentQuestion = answeredQuestions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const totalQuestions = answeredQuestions.length;
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Review: {dimension.name || "Assessment"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Question {questionNumber} of {totalQuestions}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
            Back to Assessments
          </Button>
        </div>
        <Progress
          value={(questionNumber / totalQuestions) * 100}
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-4">
        {currentQuestion && (
          <div className="space-y-4">
            <QuestionFactory
              question={{
                id: currentQuestion.id,
                text: currentQuestion.text,
                type: currentQuestion.type,
                options: currentQuestion.options
              }}
              value={currentQuestion.response?.value?.toString() ?? null}
              onChange={() => {}} // Read-only
              disabled={true}
              showValidation={false}
            />
            
            <div className="pt-4 border-t">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Your answer:</span>
                <span className="text-sm">{formatResponse(currentQuestion)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 sm:p-6 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex-1 text-center text-sm text-muted-foreground">
          {questionNumber} of {totalQuestions}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === answeredQuestions.length - 1}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to format the response value based on question type
function formatResponse(question: any): string {
  const response = question.response;
  const type = question.type;
  const options = typeof question.options === 'string' 
    ? JSON.parse(question.options) 
    : question.options;
  
  if (!response || response.value === undefined || response.value === null) {
    return "No response";
  }
  
  // For multiple choice or likert scale, show the label
  if ((type === 'multiple_choice' || type === 'likert_scale') && Array.isArray(options)) {
    const selectedOption = options.find(opt => 
      opt.value.toString() === response.value.toString()
    );
    return selectedOption ? selectedOption.label : response.value.toString();
  }
  
  // For open ended or unknown types, just return the value
  return response.value.toString();
}