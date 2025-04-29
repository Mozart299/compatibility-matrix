'use client';
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeAssessmentCard } from "@/components/dashboard/ResumeAssessmentCard";
import { Loader, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompatibilityService, AssessmentService } from "@/lib/api-services";
import Link from "next/link";
import { useAssessments, useAssessmentProgress } from "@/hooks/useAssessments";
import { CompatibilityCard } from "@/components/compatibility/compatibility-card";

export default function Dashboard() {
  // States for data loading status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for top connections data
  const [topConnections, setTopConnections] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [dimensionScores, setDimensionScores] = useState<any[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  
  // Use the assessment hooks
  const { data: assessmentsData, isLoading: assessmentsLoading, error: assessmentsError } = useAssessments();
  const { data: progressData, isLoading: progressLoading, error: progressError } = useAssessmentProgress();
  
  // Load compatibility data on component mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Get compatibility matrix for overall scores
        const matrixData = await CompatibilityService.getMatrix();
        
        // Find current user in matrix
        const currentUserEntry = matrixData.matrix.find((user: any) => 
          user.name === "You" || user.scores.some((score: any) => score.score === 100)
        );
        
        if (currentUserEntry) {
          // Extract top connections (excluding self)
          const connections = currentUserEntry.scores
            .filter((score: any) => score.score !== 100 && score.score !== null)
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .slice(0, 3);
          
          setTopConnections(connections);
        }
        
        // Calculate average overall score
        if (currentUserEntry && currentUserEntry.scores.length > 0) {
          const validScores = currentUserEntry.scores.filter(
            (score: any) => score.score !== null && score.score !== 100 // exclude self-comparison
          );
          
          if (validScores.length > 0) {
            const averageScore = Math.round(
              validScores.reduce((sum: number, score: any) => sum + score.score, 0) / validScores.length
            );
            setOverallScore(averageScore);
          }
        }
        
        // Get dimension breakdown
        // Simplify dimension analysis - group scores by dimension across all connections
        const allDimensionScores: any = {};
        
        if (currentUserEntry) {
          currentUserEntry.scores.forEach((connection: any) => {
            if (connection.dimension_scores && connection.score !== 100) { // exclude self
              connection.dimension_scores.forEach((dim: any) => {
                if (!allDimensionScores[dim.dimension_id]) {
                  allDimensionScores[dim.dimension_id] = {
                    scores: [],
                    name: dim.name || dim.dimension_id
                  };
                }
                allDimensionScores[dim.dimension_id].scores.push(dim.score);
              });
            }
          });
        }
        
        // Calculate average score for each dimension
        const dimensionBreakdown = Object.entries(allDimensionScores).map(([id, data]: [string, any]) => {
          const avgScore = Math.round(
            data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length
          );
          return {
            id,
            name: data.name,
            score: avgScore
          };
        });
        
        // Sort by score (highest first)
        dimensionBreakdown.sort((a, b) => b.score - a.score);
        setDimensionScores(dimensionBreakdown);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);
  
  // Extract recent assessments from assessmentsData when it's available
  useEffect(() => {
    if (assessmentsData && !assessmentsLoading) {
      // Transform assessments data into the format we need
      const assessments = assessmentsData.assessments || [];
      
      const formattedAssessments = assessments
        .filter((assessment: any) => assessment.status !== "not_started")
        .map((assessment: any) => ({
          id: assessment.id || assessment.dimension_id,
          name: assessment.dimension_name,
          status: assessment.status,
          progress: assessment.progress,
          updated_at: assessment.updated_at,
          completedAt: assessment.status === "completed" ? assessment.updated_at : null
        }))
        .sort((a: any, b: any) => {
          // Sort by updated_at date (most recent first)
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3); // Take only the 3 most recent
      
      setRecentAssessments(formattedAssessments);
    }
  }, [assessmentsData, assessmentsLoading]);
  
  // Handle combined loading states
  const isLoading = loading || assessmentsLoading || progressLoading;
  
  // Handle combined errors
  const hasError = error || assessmentsError || progressError;
  const errorMessage = error || 
                      (assessmentsError ? "Failed to load assessments." : "") || 
                      (progressError ? "Failed to load assessment progress." : "");
  
  // Display loading state
  if (isLoading && (!assessmentsData && !topConnections.length)) {
    return (
      <AppLayout>
        <div className="container py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Display error state
  if (hasError && (!assessmentsData && !topConnections.length)) {
    return (
      <AppLayout>
        <div className="container py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
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
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your compatibility insights.
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/assessment">Continue Assessment</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ResumeAssessmentCard />
          
          {/* Overall Compatibility Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Overall Compatibility</CardTitle>
              <CardDescription>Your average compatibility score</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-muted-foreground/20"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="12"
                    strokeDasharray={350}
                    strokeDashoffset={350 - (350 * (overallScore || 0)) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute text-3xl font-bold">
                  {overallScore !== null ? overallScore : '—'}
                </span>
              </div>
              {overallScore === null && (
                <p className="text-sm text-muted-foreground mt-2">
                  Complete assessments to see your score
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/matrix">View Full Matrix</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Top Connections Card */}
          <Card>
            <CardHeader>
              <CardTitle>Top Connections</CardTitle>
              <CardDescription>Your highest compatibility matches</CardDescription>
            </CardHeader>
            <CardContent>
              {topConnections.length > 0 ? (
                <div className="space-y-4">
                  {topConnections.map((connection) => (
                    <div key={connection.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {connection.name.split(' ')[0][0]}
                            {connection.name.split(' ').length > 1 ? connection.name.split(' ')[1][0] : ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                        </div>
                      </div>
                      <Badge variant={connection.score > 90 ? "default" : "secondary"}>
                        {connection.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No compatibility data available yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Complete more assessments to see your top connections.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/connections">View All Connections</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Assessments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Your assessment progress</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAssessments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{assessment.name}</p>
                        {assessment.completedAt && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={assessment.status === "completed" ? "default" : "secondary"}
                      >
                        {assessment.status === "completed" ? "Completed" : 
                          assessment.status === "in_progress" ? `${assessment.progress}%` : "Not Started"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No assessments completed yet.
                  </p>
                  <Button size="sm" className="mt-4" asChild>
                    <Link href="/assessment">Start Assessment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/assessment">Continue Assessment</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Dimensions Breakdown */}
        <h2 className="text-2xl font-bold mt-10 mb-6">Compatibility Dimensions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dimension Breakdown</CardTitle>
              <CardDescription>Your compatibility across different dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              {dimensionScores.length > 0 ? (
                <div className="space-y-4">
                  {dimensionScores.map((dimension, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{dimension.name}</span>
                        <span className="text-sm font-medium">{dimension.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            dimension.score >= 90
                              ? "bg-green-500"
                              : dimension.score >= 75
                              ? "bg-green-400"
                              : dimension.score >= 60
                              ? "bg-yellow-400"
                              : dimension.score >= 40
                              ? "bg-orange-400"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${dimension.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No dimension data available yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Complete assessments to see dimension breakdown.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/matrix">Detailed Analysis</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compatibility Recommendations</CardTitle>
              <CardDescription>Suggested actions based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dynamically decide which recommendations to show based on data */}
                {(!assessmentsData || assessmentsData.overall_progress < 100) && (
                  <div className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Complete More Assessments</h3>
                      <p className="text-sm text-muted-foreground">
                        {progressData ? 
                          `You've completed ${progressData.completed_dimensions} out of ${progressData.total_dimensions} assessment dimensions.` : 
                          'Complete all assessments to get more accurate compatibility results.'}
                      </p>
                      <Button variant="link" className="h-8 p-0 mt-2" asChild>
                        <Link href="/assessment">Continue Assessment →</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {topConnections.length > 0 && (
                  <div className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Connect with {topConnections[0].name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Your compatibility score of {topConnections[0].score}% suggests a strong potential connection.
                      </p>
                      <Button variant="link" className="h-8 p-0 mt-2" asChild>
                        <Link href={`/compatibility/${topConnections[0].user_id}`}>View Compatibility →</Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Update Your Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Adding more details to your profile will improve compatibility matching.
                    </p>
                    <Button variant="link" className="h-8 p-0 mt-2" asChild>
                      <Link href="/profile">Edit Profile →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/connections/suggested">View All Recommendations</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Display top compatible matches if available */}
        {topConnections.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-6">Top Compatible Matches</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topConnections.slice(0, 4).map((connection) => (
                <CompatibilityCard
                  key={connection.user_id}
                  userId={connection.user_id}
                  name={connection.name}
                  score={connection.score}
                  dimensions={connection.dimension_scores?.slice(0, 3).map((dim: any) => ({
                    name: dim.name || dim.dimension_id,
                    score: dim.score
                  }))}
                  strengths={connection.strengths?.map((s: any) => 
                    s.description || `Strong ${s.name || s.dimension_id}` 
                  )}
                  challenges={connection.challenges?.map((c: any) => 
                    c.description || `Different ${c.name || c.dimension_id}` 
                  )}
                />
              ))}
            </div>
            
            {topConnections.length > 3 && (
              <div className="flex justify-center mt-6">
                <Button asChild variant="outline">
                  <Link href="/connections">View All Connections</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}