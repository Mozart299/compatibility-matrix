
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data for the dashboard
const mockCompatibilityData = {
  overallScore: 78,
  dimensionScores: [
    { name: "Personality Traits", score: 82 },
    { name: "Values & Beliefs", score: 73 },
    { name: "Interests & Activities", score: 85 },
    { name: "Communication Styles", score: 68 },
    { name: "Life Goals", score: 79 },
    { name: "Emotional Intelligence", score: 81 },
    { name: "Lifestyle", score: 75 },
  ],
  topConnections: [
    { id: 1, name: "Alex Johnson", score: 92, avatar: "/avatars/alex.png" },
    { id: 2, name: "Jamie Smith", score: 88, avatar: "/avatars/jamie.png" },
    { id: 3, name: "Taylor West", score: 85, avatar: "/avatars/taylor.png" },
  ],
  recentAssessments: [
    { id: 1, name: "Personality Assessment", completedAt: "2025-04-10T14:30:00Z", status: "Completed" },
    { id: 2, name: "Values & Beliefs", completedAt: "2025-04-08T10:15:00Z", status: "Completed" },
    { id: 3, name: "Communication Styles", status: "In Progress" },
  ],
};

export default function Dashboard() {
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
                    strokeDashoffset={350 - (350 * mockCompatibilityData.overallScore) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute text-3xl font-bold">
                  {mockCompatibilityData.overallScore}
                </span>
              </div>
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
              <div className="space-y-4">
                {mockCompatibilityData.topConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {connection.name.split(' ')[0][0]}
                          {connection.name.split(' ')[1][0]}
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
              <div className="space-y-4">
                {mockCompatibilityData.recentAssessments.map((assessment) => (
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
                      variant={assessment.status === "Completed" ? "default" : "secondary"}
                    >
                      {assessment.status}
                    </Badge>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {mockCompatibilityData.dimensionScores.map((dimension, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dimension.name}</span>
                      <span className="text-sm font-medium">{dimension.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${dimension.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dimensions">Detailed Analysis</Link>
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
                    <h3 className="font-medium">Complete Communication Assessment</h3>
                    <p className="text-sm text-muted-foreground">Improve your compatibility insights by completing the communication styles assessment.</p>
                    <Button variant="link" className="h-8 p-0 mt-2" asChild>
                      <Link href="/assessment">Continue Assessment →</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Connect with Jamie Smith</h3>
                    <p className="text-sm text-muted-foreground">Your compatibility score of 88% suggests a strong potential connection.</p>
                    <Button variant="link" className="h-8 p-0 mt-2" asChild>
                      <Link href="/connections">Explore Connections →</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Update Your Interests</h3>
                    <p className="text-sm text-muted-foreground">Adding more specific interests to your profile will improve compatibility matching.</p>
                    <Button variant="link" className="h-8 p-0 mt-2" asChild>
                      <Link href="/profile">Edit Profile →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/recommendations">View All Recommendations</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}