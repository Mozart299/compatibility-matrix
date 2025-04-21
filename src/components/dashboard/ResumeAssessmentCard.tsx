// src/components/dashboard/ResumeAssessmentCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentAssessment } from "@/utils/assessment-storage";

export function ResumeAssessmentCard() {
  const [hasInProgressAssessment, setHasInProgressAssessment] = useState(false);
  
  useEffect(() => {
    const savedAssessment = getCurrentAssessment();
    setHasInProgressAssessment(!!savedAssessment);
    
    // Check for changes when window gets focus
    const handleFocus = () => {
      const currentSaved = getCurrentAssessment();
      setHasInProgressAssessment(!!currentSaved);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  if (!hasInProgressAssessment) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Resume Assessment</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          You have an in-progress assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Continue where you left off to improve your compatibility insights.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href="/assessment">
            <PlayCircle className="mr-2 h-4 w-4" />
            Continue Assessment
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}