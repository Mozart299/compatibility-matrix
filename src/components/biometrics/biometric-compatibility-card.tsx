import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface BiometricCompatibilityCardProps {
  compatibility: {
    compatibility_score: number | null;
    biometric_type: string;
    compatibility_details?: {
      sdnn_compatibility?: {
        score: number;
        description: string;
      };
      lf_hf_compatibility?: {
        score: number;
        description: string;
      };
      hrv_score_compatibility?: {
        score: number;
        description: string;
      };
    };
    message?: string;
  };
  otherUser: {
    name: string;
    id: string;
    avatar_url?: string;
  };
  className?: string;
}

export default function BiometricCompatibilityCard({
  compatibility,
  otherUser,
  className = ""
}: BiometricCompatibilityCardProps) {
  // Helper function to get compatibility level description
  const getCompatibilityLevel = (score: number) => {
    if (score >= 90) return { level: "Exceptional", color: "bg-green-500 text-white" };
    if (score >= 75) return { level: "Strong", color: "bg-green-400 text-white" };
    if (score >= 60) return { level: "Moderate", color: "bg-yellow-400 text-gray-900" };
    if (score >= 40) return { level: "Mixed", color: "bg-orange-400 text-white" };
    return { level: "Limited", color: "bg-red-500 text-white" };
  };
  
  // For missing data state
  if (!compatibility.compatibility_score) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Physiological Compatibility
          </CardTitle>
          <CardDescription>
            Biometric compatibility with {otherUser.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground/60" />
            <h3 className="text-lg font-medium">No Biometric Data Available</h3>
            <p className="text-sm text-muted-foreground">
              {compatibility.message || 
                `One or both of you need to complete the HRV measurement to see physiological compatibility.`}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/biometrics">Take HRV Measurement</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Get the compatibility level
  const { level, color } = getCompatibilityLevel(compatibility.compatibility_score);
  
  // Get key compatibility details
  const details = compatibility.compatibility_details || {};
  const highestComponent = Object.entries(details)
    .filter(([key]) => key.endsWith('_compatibility'))
    .sort(([, a], [, b]) => (b as any).score - (a as any).score)[0];
  
  const highestComponentName = highestComponent ? 
    highestComponent[0].replace('_compatibility', '').toUpperCase() : 
    '';
  
  const highestComponentDesc = highestComponent ? 
    (highestComponent[1] as any).description : 
    '';

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Physiological Compatibility
            </CardTitle>
            <CardDescription>
              Based on heart rate variability analysis
            </CardDescription>
          </div>
          <Badge className={`${color}`}>
            {compatibility.compatibility_score}% · {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <div className="relative">
          <div className="flex justify-center">
            <div className="relative h-28 w-28">
              <svg className="w-28 h-28">
                <circle
                  className="text-muted-foreground/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="56"
                  cy="56"
                />
                <circle
                  className="text-primary"
                  strokeWidth="8"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * compatibility.compatibility_score) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="56"
                  cy="56"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold">{compatibility.compatibility_score}</span>
                <span className="text-xs text-muted-foreground">Biometric Score</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-medium text-sm">Key Physiological Compatibility</h3>
          <div className="flex gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {highestComponentDesc || 
               "Your autonomic nervous system patterns show promising compatibility that may facilitate emotional co-regulation."}
            </p>
          </div>
        </div>
        
        {compatibility.compatibility_details && (
          <div className="grid grid-cols-3 gap-2 text-center border-t pt-4">
            {details.sdnn_compatibility && (
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">Autonomic Balance</p>
                <p className="font-medium text-sm">{details.sdnn_compatibility.score}%</p>
              </div>
            )}
            {details.lf_hf_compatibility && (
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">Stress Response</p>
                <p className="font-medium text-sm">{details.lf_hf_compatibility.score}%</p>
              </div>
            )}
            {details.hrv_score_compatibility && (
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">Resilience</p>
                <p className="font-medium text-sm">{details.hrv_score_compatibility.score}%</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/biometrics">Update HRV Measurement</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}