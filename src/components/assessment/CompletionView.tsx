// src/components/assessment/CompletionView.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface CompletionViewProps {
  activeAssessment: {
    dimension?: { name: string };
  };
  overallProgress: number;
  onBackToDimensions: () => void;
}

export function CompletionView({ activeAssessment, overallProgress, onBackToDimensions }: CompletionViewProps) {
  return (
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
        <Button variant="outline" onClick={onBackToDimensions} className="w-full sm:w-auto text-xs sm:text-sm">
          View All Dimensions
        </Button>
        <Button onClick={onBackToDimensions} className="w-full sm:w-auto text-xs sm:text-sm">
          Continue Assessment
        </Button>
      </CardFooter>
    </Card>
  );
}