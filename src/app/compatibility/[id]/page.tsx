"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  AlertTriangle,
  Check,
  MessagesSquare,
  UserCircle2,
  Loader,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompatibilityService } from "@/lib/api-services";
import CompatibilityRadarChart from "@/components/compatibility/compatibility-radar-chart";
import { useSendConnectionRequest } from "@/hooks/useConnections";

// Helper function to get compatibility level description
const getCompatibilityLevel = (score: number) => {
  if (score >= 90) return { level: "Exceptional", description: "Highly aligned in critical areas" };
  if (score >= 75) return { level: "Strong", description: "Well-matched with minor differences" };
  if (score >= 60) return { level: "Moderate", description: "Workable differences requiring some adaptation" };
  if (score >= 40) return { level: "Mixed", description: "Significant differences requiring substantial effort" };
  return { level: "Limited", description: "Fundamental differences in key areas" };
};

interface CompatibilityData {
  overall_score: number;
  other_user: {
    name: string;
  };
  message?: string;
  detailed_analysis?: {
    personality_comparison?: {
      user: Record<string, number>;
      other: Record<string, number>;
    };
    communication_dynamics?: {
      user: string;
      other: string;
      dynamics: string;
    };
    values_alignment?: Array<{
      name: string;
      alignment: number;
    }>;
  };
  strengths?: Array<{
    dimension_id: string;
    name?: string;
    score: number;
    description?: string;
  }>;
  challenges?: Array<{
    dimension_id: string;
    name?: string;
    score: number;
    description?: string;
  }>;
  dimension_scores: Array<{
    dimension_id: string;
    name?: string;
    score: number;
  }>;
  interests?: {
    shared: string[];
    user: string[];
    other: string[];
  };
}

interface PageParams {
  id: string;
}

export default function CompatibilityDetailPage({ params }: { params: PageParams }) {
  const { id } = params;
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personality");
  const [hasSentRequest, setHasSentRequest] = useState(false);

  // Mutation for sending connection request
  const sendConnectionRequest = useSendConnectionRequest();

  useEffect(() => {
    async function loadCompatibilityData() {
      try {
        setLoading(true);
        setError(null);

        // Get detailed compatibility report from API
        const report = await CompatibilityService.getDetailedReport(id);
        setCompatibilityData(report);

        setLoading(false);
      } catch (err) {
        console.error("Error loading compatibility data:", err);
        setError("Failed to load compatibility data. Please try again.");
        setLoading(false);
      }
    }

    loadCompatibilityData();
  }, [id]);

  const handleSendConnectionRequest = () => {
    sendConnectionRequest.mutate(id, {
      onSuccess: () => {
        setHasSentRequest(true);
        alert("Connection request sent successfully!");
      },
      onError: () => alert("Failed to send connection request"),
    });
  };

  // Display loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading compatibility data...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Display error state
  if (error) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Display "no data" state if needed
  if (!compatibilityData || compatibilityData.overall_score === 0) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <div className="mb-6 md:mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/matrix">
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Back to Matrix</span>
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  Compatibility with {compatibilityData?.other_user?.name || "User"}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {compatibilityData?.message || "No compatibility data available yet"}
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-6 md:mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center py-10">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Compatibility Data Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {compatibilityData?.message ||
                    "Complete more assessments to generate compatibility data with this user."}
                </p>
                <Button asChild>
                  <Link href="/assessment">Complete Assessments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Get compatibility level description
  const { level, description } = getCompatibilityLevel(compatibilityData.overall_score);

  // Get personality data for radar chart
  const personalityData = compatibilityData.detailed_analysis?.personality_comparison || null;
  const userPersonality = personalityData?.user || {};
  const otherPersonality = personalityData?.other || {};

  // Get interests data
  const interestsData = compatibilityData.interests || {
    shared: [],
    user: [],
    other: [],
  };

  return (
    <AppLayout>
      <div className="container py-6 sm:py-8 md:py-10">
        <div className="mb-6 md:mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/matrix">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Matrix</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                Compatibility with {compatibilityData.other_user.name}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Detailed analysis of your compatibility across multiple dimensions
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex-1 md:flex-auto">
                <UserCircle2 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Profile</span>
              </Button>
              <Button
                size="sm"
                className="flex-1 md:flex-auto"
                onClick={handleSendConnectionRequest}
                disabled={hasSentRequest || sendConnectionRequest.isPending}
              >
                <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">
                  {hasSentRequest ? "Request Sent" : "Connect"}
                </span>
              </Button>
              <Button size="sm" className="flex-1 md:flex-auto">
                <MessagesSquare className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Message</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Compatibility Card */}
        <Card className="mb-6 md:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <svg className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40">
                    <circle
                      className="text-muted-foreground/20"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="8"
                      strokeDasharray={350}
                      strokeDashoffset={350 - (350 * compatibilityData.overall_score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{compatibilityData.overall_score}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
                <Badge className="mt-2 text-sm sm:text-lg py-1 px-2 sm:py-1.5 sm:px-3">
                  {level} Compatibility
                </Badge>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center max-w-xs">
                  {description}
                </p>
              </div>

              <div className="flex-1 space-y-4">
                {compatibilityData.strengths && compatibilityData.strengths.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-green-500" />
                      Relationship Strengths
                    </h3>
                    <ul className="space-y-2">
                      {compatibilityData.strengths.map((strength, index) => (
                        <li key={index} className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              {strength.name || `Strong ${strength.dimension_id} Compatibility`}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Score: {strength.score}% - {strength.description || "You both align well in this dimension"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {compatibilityData.challenges && compatibilityData.challenges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Potential Challenges
                    </h3>
                    <ul className="space-y-2">
                      {compatibilityData.challenges.map((challenge, index) => (
                        <li key={index} className="flex gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm sm:text-base">
                              {challenge.name || `Different ${challenge.dimension_id} Approaches`}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Score: {challenge.score}% -{" "}
                              {challenge.description || "You may need to navigate differences in this area"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!compatibilityData.strengths || compatibilityData.strengths.length === 0) &&
                  (!compatibilityData.challenges || compatibilityData.challenges.length === 0) && (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        Complete more assessments to see detailed strengths and challenges.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown */}
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dimension Breakdown</h2>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {compatibilityData.dimension_scores.map((dimension) => (
            <Card key={dimension.dimension_id} className="h-full">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">{dimension.name || dimension.dimension_id}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Compatibility score in this dimension</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl sm:text-3xl font-bold">{dimension.score}</div>
                  <Badge
                    className={
                      dimension.score >= 90
                        ? "bg-green-500"
                        : dimension.score >= 75
                        ? "bg-green-400"
                        : dimension.score >= 60
                        ? "bg-yellow-400"
                        : dimension.score >= 40
                        ? "bg-orange-400"
                        : "bg-red-500"
                    }
                  >
                    {getCompatibilityLevel(dimension.score).level}
                  </Badge>
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis Tabs */}
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Detailed Analysis</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 w-auto inline-flex">
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="values">Values</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personality">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Personality Traits Comparison</CardTitle>
                <CardDescription>
                  How your personality traits align with {compatibilityData.other_user.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personalityData ? (
                  <div className="space-y-6">
                    {/* Radar chart if component is available */}
                    {Object.keys(userPersonality).length > 0 && Object.keys(otherPersonality).length > 0 && (
                      <div className="mb-6">
                        <CompatibilityRadarChart
                          userData={userPersonality}
                          otherUserData={otherPersonality}
                          userName="You"
                          otherUserName={compatibilityData.other_user.name}
                        />
                      </div>
                    )}

                    {Object.keys(userPersonality).map((trait) => {
                      const userScore = userPersonality[trait];
                      const otherScore = otherPersonality[trait];
                      const traitName = trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, " $1");

                      return (
                        <div key={trait}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm sm:text-base">{traitName}</span>
                          </div>
                          <div className="relative h-16 sm:h-12 w-full bg-muted rounded-lg overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-blue-200 opacity-30" style={{ width: "100%" }} />

                            {/* User's score */}
                            <div
                              className="absolute top-0 h-3 sm:h-4 mt-2 bg-blue-500 rounded-full"
                              style={{ left: `${Math.min(userScore, 100)}%`, transform: "translateX(-50%)" }}
                            >
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap mt-1">
                                <span className="text-xs px-1 rounded bg-blue-100 text-blue-700 font-semibold">
                                  You: {userScore}%
                                </span>
                              </div>
                            </div>

                            {/* Other person's score */}
                            <div
                              className="absolute top-0 h-3 sm:h-4 mt-2 bg-purple-500 rounded-full"
                              style={{ left: `${Math.min(otherScore, 100)}%`, transform: "translateX(-50%)" }}
                            >
                              <div className="w-3 h-3 bg-purple-500 rounded-full" />
                              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap mt-3 sm:mt-1">
                                <span className="text-xs px-1 rounded bg-purple-100 text-purple-700 font-semibold">
                                  {compatibilityData.other_user.name.split(" ")[0]}: {otherScore}%
                                </span>
                              </div>
                            </div>

                            {/* Scale markers */}
                            <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2">
                              <div className="h-full w-px bg-muted-foreground/20" />
                              <div className="h-full w-px bg-muted-foreground/20" />
                              <div className="h-full w-px bg-muted-foreground/20" />
                              <div className="h-full w-px bg-muted-foreground/20" />
                              <div className="h-full w-px bg-muted-foreground/20" />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-6">
                            <span>Low</span>
                            <span>High</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <p className="text-muted-foreground">Personality comparison data not available yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Complete the personality assessment to see this data.
                      </p>
                      <Button size="sm" className="mt-4" asChild>
                        <Link href="/assessment">Go to Assessments</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Interests & Activities</CardTitle>
                <CardDescription>
                  Shared and individual interests between you and {compatibilityData.other_user.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interestsData.shared.length > 0 || interestsData.user.length > 0 || interestsData.other.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <h3 className="font-medium text-base sm:text-lg mb-3">Shared Interests</h3>
                      {interestsData.shared.length > 0 ? (
                        <div className="space-y-2">
                          {interestsData.shared.map((interest, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-100"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{interest}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No shared interests found yet.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-base sm:text-lg mb-3">Your Unique Interests</h3>
                      {interestsData.user.length > 0 ? (
                        <div className="space-y-2">
                          {interestsData.user.map((interest, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border border-blue-100"
                            >
                              <UserCircle2 className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{interest}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No unique interests added to your profile yet.</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <h3 className="font-medium text-base sm:text-lg mb-3">
                        {compatibilityData.other_user.name}'s Unique Interests
                      </h3>
                      {interestsData.other.length > 0 ? (
                        <div className="space-y-2">
                          {interestsData.other.map((interest, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 rounded-md bg-purple-50 border border-purple-100"
                            >
                              <UserCircle2 className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">{interest}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No unique interests found for this user yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No interests information available yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Complete your profile and add your interests.</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link href="/profile">Update Profile</Link>
                    </Button>
                  </div>
                )}

                <div className="mt-6 p-3 sm:p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Interest Compatibility</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {interestsData.shared && interestsData.shared.length > 0
                      ? `You share ${interestsData.shared.length} interests with ${compatibilityData.other_user.name}, creating a strong foundation for shared activities.`
                      : `You don't seem to share common interests with ${compatibilityData.other_user.name} yet. Consider updating your profile or exploring new activities together.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Communication Styles</CardTitle>
                <CardDescription>How your communication styles interact</CardDescription>
              </CardHeader>
              <CardContent>
                {compatibilityData.detailed_analysis?.communication_dynamics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3 sm:p-4">
                        <h3 className="font-medium mb-2 text-sm sm:text-base">Your Communication Style</h3>
                        <div className="mt-2 px-3 py-2 bg-blue-50 text-blue-800 rounded-md inline-block">
                          <span className="font-medium">{compatibilityData.detailed_analysis.communication_dynamics.user}</span>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3 sm:p-4">
                        <h3 className="font-medium mb-2 text-sm sm:text-base">
                          {compatibilityData.other_user.name}'s Style
                        </h3>
                        <div className="mt-2 px-3 py-2 bg-purple-50 text-purple-800 rounded-md inline-block">
                          <span className="font-medium">{compatibilityData.detailed_analysis.communication_dynamics.other}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                      <h3 className="font-medium mb-2 text-sm sm:text-base">Communication Dynamics</h3>
                      <p className="text-sm text-muted-foreground">
                        {compatibilityData.detailed_analysis.communication_dynamics.dynamics}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium mb-2">Communication Strengths</h4>
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-xs sm:text-sm">
                            Understanding each other's communication style helps build stronger connections
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-medium mb-2">Improvement Areas</h4>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span className="text-xs sm:text-sm">
                            Be mindful of differences in communication preferences
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <p className="text-muted-foreground">Communication style analysis not available yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Complete the communication assessment to see this data.
                      </p>
                      <Button size="sm" className="mt-4" asChild>
                        <Link href="/assessment">Go to Assessments</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Values & Beliefs</CardTitle>
                <CardDescription>Alignment in core values and belief systems</CardDescription>
              </CardHeader>
              <CardContent>
                {compatibilityData.detailed_analysis?.values_alignment ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3 text-base">Value Alignment</h3>
                        <div className="space-y-3">
                          {compatibilityData.detailed_analysis.values_alignment.map((value, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className={`w-2 h-6 rounded-full ${
                                  value.alignment > 70 ? "bg-green-500" : value.alignment > 40 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{value.name}</p>
                                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                  <div
                                    className={`h-full rounded-full ${
                                      value.alignment > 70
                                        ? "bg-green-500"
                                        : value.alignment > 40
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${value.alignment}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs font-medium">{value.alignment}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3 text-base">Values Analysis</h3>
                        <p className="text-sm text-gray-600">
                          {compatibilityData.detailed_analysis.values_alignment.length > 0
                            ? "You share several core values which can create a strong foundation for mutual understanding."
                            : "Complete the values assessment to see a detailed analysis of your value alignment."}
                        </p>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Values compatibility</h4>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{
                                  width: `${
                                    compatibilityData.dimension_scores.find((d) => d.dimension_id === "values")?.score || 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {compatibilityData.dimension_scores.find((d) => d.dimension_id === "values")?.score || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <p className="text-muted-foreground">Values analysis not available yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Complete the values assessment to see how your core values align.
                      </p>
                      <Button size="sm" className="mt-4" asChild>
                        <Link href="/assessment">Go to Assessments</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions and Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Next Steps</CardTitle>
            <CardDescription>Suggested actions to improve your compatibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border rounded-lg p-4 flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base">Complete More Assessments</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Complete all assessments to get a more accurate compatibility score.
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                    <Link href="/assessment">Continue Assessments →</Link>
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-600"
                  >
                    <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.5 3a1 1 0 0 1 1 0l3.826 5.921a.7.7 0 0 1-.626 1.079H8.3z"></path>
                    <path d="M12 12.01v5.99"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base">Connect & Explore</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Start a conversation about your shared interests to build a stronger connection.
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                    <Link href="/messages">Start Conversation →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}