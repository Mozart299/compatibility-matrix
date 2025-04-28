
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";
import { QuestionFactory } from "./questions/QuestionFactory";

interface QuestionContainerProps {
  activeAssessment: {
    assessment_id: string;
    dimension?: { name: string };
    status?: string;
    progress?: number;
    completed_questions?: number;
    total_questions?: number;
    next_question?: { id: string; text: string; options: string; type?: string };
  };
  onBackToDimensions: () => void;
  onSubmitResponse: (assessmentId: string, questionId: string, response: string) => Promise<void>;
}

export function QuestionContainer({ 
  activeAssessment, 
  onBackToDimensions,
  onSubmitResponse
}: QuestionContainerProps) {
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [responseSubmitting, setResponseSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isResponseValid, setIsResponseValid] = useState(false);
  
  const currentQuestion = activeAssessment.next_question;
  
  if (!currentQuestion) {
    return null;
  }
  
  const handleResponseChange = (value: string) => {
    setCurrentResponse(value);
    setShowValidation(false);
  };
  
  const handleValidChange = (isValid: boolean) => {
    setIsResponseValid(isValid);
  };
  
  const handleNextQuestion = async () => {
    // First, show validation if not already showing
    if (!showValidation) {
      setShowValidation(true);
      
      // Check if response is valid before proceeding
      if (!isResponseValid) {
        return;
      }
    }
    
    // Additional validation check before proceeding
    if (!currentResponse || !activeAssessment || !currentQuestion || !isResponseValid) {
      return;
    }
    
    try {
      setResponseSubmitting(true);
      
      // Submit the response and wait for completion
      await onSubmitResponse(
        activeAssessment.assessment_id,
        currentQuestion.id,
        currentResponse
      );
      
      // Reset state after successful submission
      setCurrentResponse(null);
      setShowValidation(false);
      
    } catch (err) {
      console.error("Error submitting response:", err);
    } finally {
      setResponseSubmitting(false);
    }
  };

  return (
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
          <Button variant="ghost" size="sm" onClick={onBackToDimensions} className="text-xs">
            Save & Exit
          </Button>
        </div>
        <Progress
          value={(((activeAssessment.completed_questions ?? 0) + 1) / (activeAssessment.total_questions ?? 1)) * 100}
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-4">
        <QuestionFactory
          question={currentQuestion}
          value={currentResponse}
          onChange={handleResponseChange}
          onValidChange={handleValidChange}
          disabled={responseSubmitting}
          showValidation={showValidation}
        />
      </CardContent>
      <CardFooter className="p-4 sm:p-6 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}} // Previous question functionality not implemented
          disabled={true}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={handleNextQuestion}
          disabled={responseSubmitting}
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
  );
}