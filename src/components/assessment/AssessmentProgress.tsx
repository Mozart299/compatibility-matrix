// src/components/assessment/AssessmentProgress.tsx
import { Progress } from "@/components/ui/progress";

interface AssessmentProgressProps {
  overallProgress: number;
  className?: string;
}

export function AssessmentProgress({ overallProgress, className = "" }: AssessmentProgressProps) {
  return (
    <div className={`w-full md:w-auto flex items-center gap-2 ${className}`}>
      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Progress:</span>
      <div className="w-full md:w-40 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <span className="text-xs sm:text-sm font-medium">{overallProgress}%</span>
    </div>
  );
}