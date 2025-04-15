"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

// Define the type for a dimension
interface Dimension {
  id: string;
  name: string;
  description: string;
  status: string;
  questions: number;
  completed: number;
}

// Mock assessment data
const mockAssessmentData = {
  dimensions: [
    {
      id: "personality",
      name: "Personality Traits",
      description: "Questions about your personality characteristics and tendencies",
      status: "completed",
      questions: 15,
      completed: 15,
    },
    {
      id: "values",
      name: "Values & Beliefs",
      description: "Questions about your core principles and belief systems",
      status: "in_progress",
      questions: 20,
      completed: 8,
    },
    {
      id: "interests",
      name: "Interests & Activities",
      description: "Questions about your hobbies and preferred activities",
      status: "not_started",
      questions: 18,
      completed: 0,
    },
    {
      id: "communication",
      name: "Communication Styles",
      description: "Questions about how you express yourself and resolve conflicts",
      status: "not_started",
      questions: 12,
      completed: 0,
    },
    {
      id: "goals",
      name: "Life Goals & Priorities",
      description: "Questions about your long-term aspirations and current priorities",
      status: "not_started",
      questions: 15,
      completed: 0,
    },
    {
      id: "emotional",
      name: "Emotional Intelligence",
      description: "Questions about your ability to understand and manage emotions",
      status: "not_started",
      questions: 10,
      completed: 0,
    },
    {
      id: "lifestyle",
      name: "Lifestyle Preferences",
      description: "Questions about your daily habits and living preferences",
      status: "not_started",
      questions: 12,
      completed: 0,
    },
  ],
  currentDimension: "values",
  currentQuestions: [
    {
      id: 1,
      text: "How important is it to you that others share your political views?",
      options: [
        { value: "1", label: "Not important at all - I prefer diverse viewpoints" },
        { value: "2", label: "Somewhat unimportant - I'm open to different views" },
        { value: "3", label: "Neutral - It depends on the specific views" },
        { value: "4", label: "Somewhat important - I prefer some alignment" },
        { value: "5", label: "Very important - I strongly prefer alignment" },
      ],
    },
    {
      id: 2,
      text: "When making ethical decisions, how much do you rely on established rules versus personal judgment?",
      options: [
        { value: "1", label: "Always follow established rules and norms" },
        { value: "2", label: "Usually follow rules with occasional exceptions" },
        { value: "3", label: "Balance between rules and personal judgment" },
        { value: "4", label: "Usually trust my own judgment with consideration of rules" },
        { value: "5", label: "Always prioritize personal judgment over established rules" },
      ],
    },
    {
      id: 3,
      text: "How important is religious or spiritual practice in your daily life?",
      options: [
        { value: "1", label: "Not at all important - I'm not religious/spiritual" },
        { value: "2", label: "Slightly important - I have some beliefs but rarely practice" },
        { value: "3", label: "Moderately important - I practice occasionally" },
        { value: "4", label: "Very important - I practice regularly" },
        { value: "5", label: "Extremely important - It guides most of my decisions" },
      ],
    },
  ],
};

// Calculate overall progress
const calculateOverallProgress = (dimensions: Dimension[]) => {
  const totalQuestions = dimensions.reduce((sum, dim) => sum + dim.questions, 0);
  const completedQuestions = dimensions.reduce((sum, dim) => sum + dim.completed, 0);
  return Math.round((completedQuestions / totalQuestions) * 100);
};

export default function AssessmentPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [view, setView] = useState("dimensions"); // dimensions, questions, completion

  const overallProgress = calculateOverallProgress(mockAssessmentData.dimensions);
  const currentDimension = mockAssessmentData.dimensions.find(
    (d) => d.id === mockAssessmentData.currentDimension
  );
  const currentQuestion = mockAssessmentData.currentQuestions[currentQuestionIndex];

  const handleResponseChange = (value: string) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockAssessmentData.currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setView("completion");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleStartAssessment = () => {
    setView("questions");
    setCurrentQuestionIndex(0);
  };

  const handleBackToDimensions = () => {
    setView("dimensions");
  };

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
            {mockAssessmentData.dimensions.map((dimension) => (
              <Card key={dimension.id} className={dimension.status === "completed" ? "border-green-200" : ""}>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{dimension.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{dimension.description}</CardDescription>
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
                        {dimension.completed}/{dimension.questions} Questions
                      </span>
                    </div>
                    <Progress
                      value={(dimension.completed / dimension.questions) * 100}
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
                      onClick={handleStartAssessment}
                    >
                      Continue
                    </Button>
                  )}
                  {dimension.status === "not_started" && (
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm"
                      disabled
                    >
                      Start Assessment
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {view === "questions" && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base sm:text-lg">{currentDimension?.name || "Unknown Dimension"}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Question {currentQuestionIndex + 1} of {mockAssessmentData.currentQuestions.length}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBackToDimensions} className="text-xs">
                  Save & Exit
                </Button>
              </div>
              <Progress
                value={((currentQuestionIndex + 1) / mockAssessmentData.currentQuestions.length) * 100}
                className="mt-4"
              />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-medium">{currentQuestion.text}</h3>
                <RadioGroup
                  value={responses[currentQuestion.id]}
                  onValueChange={handleResponseChange}
                  className="gap-2 sm:gap-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value={option.value} id={`option-${option.value}`} />
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
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={handleNextQuestion}
                disabled={!responses[currentQuestion.id]}
              >
                {currentQuestionIndex < mockAssessmentData.currentQuestions.length - 1
                  ? "Next"
                  : "Complete"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {view === "completion" && (
          <Card className="max-w-3xl mx-auto text-center">
            <CardHeader className="p-4 sm:p-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Values & Beliefs Assessment Completed!</CardTitle>
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