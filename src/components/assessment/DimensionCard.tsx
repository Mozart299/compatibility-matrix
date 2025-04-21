// src/components/assessment/DimensionCard.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface DimensionCardProps {
  dimension: {
    dimension_id: string;
    dimension_name: string;
    dimension_description: string;
    status: string;
    progress: number;
  };
  onStartAssessment: (dimensionId: string) => void;
  loading: boolean;
}

export function DimensionCard({ dimension, onStartAssessment, loading }: DimensionCardProps) {
  return (
    <Card className={dimension.status === "completed" ? "border-green-200" : ""}>
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
            onClick={() => onStartAssessment(dimension.dimension_id)}
            disabled={loading}
          >
            Continue
          </Button>
        )}
        {dimension.status === "not_started" && (
          <Button
            variant="outline"
            className="w-full text-xs sm:text-sm"
            onClick={() => onStartAssessment(dimension.dimension_id)}
            disabled={loading}
          >
            Start Assessment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}