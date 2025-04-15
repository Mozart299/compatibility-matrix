
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
  UserCircle2 
} from "lucide-react";

// Mock compatibility data for a specific person
const mockCompatibilityData = {
  person: {
    id: 2,
    name: "Alex Johnson",
    avatar: "/avatars/alex.png",
  },
  overallScore: 87,
  dimensionScores: [
    { id: "personality", name: "Personality Traits", score: 82, color: "bg-blue-500" },
    { id: "values", name: "Values & Beliefs", score: 91, color: "bg-purple-500" },
    { id: "interests", name: "Interests & Activities", score: 78, color: "bg-green-500" },
    { id: "communication", name: "Communication Styles", score: 73, color: "bg-yellow-500" },
    { id: "goals", name: "Life Goals & Priorities", score: 89, color: "bg-red-500" },
    { id: "emotional", name: "Emotional Intelligence", score: 94, color: "bg-indigo-500" },
    { id: "lifestyle", name: "Lifestyle Preferences", score: 85, color: "bg-orange-500" },
  ],
  strengths: [
    {
      title: "Strong Shared Values",
      description: "You both prioritize honesty, personal growth, and community involvement, creating a strong foundation for mutual respect.",
    },
    {
      title: "High Emotional Intelligence",
      description: "You both demonstrate excellent self-awareness and empathy, allowing for deep emotional connections and effective conflict resolution.",
    },
    {
      title: "Complementary Life Goals",
      description: "Your career ambitions and family planning timelines align well, setting you up for compatible long-term planning.",
    },
  ],
  challenges: [
    {
      title: "Different Communication Styles",
      description: "You tend to communicate directly, while Alex prefers a more diplomatic approach, which may lead to occasional misunderstandings.",
    },
    {
      title: "Varying Social Energy",
      description: "Alex enjoys more frequent social gatherings than you do, which may require compromise in social planning.",
    },
  ],
  interests: {
    shared: ["Hiking", "Documentary Films", "International Cuisine", "Reading"],
    user: ["Gaming", "Photography", "Jazz Music"],
    other: ["Tennis", "Classical Music", "Painting"],
  },
  personalityDetails: {
    user: {
      extraversion: 65,
      agreeableness: 80,
      conscientiousness: 85,
      emotionalStability: 75,
      openness: 90,
    },
    other: {
      extraversion: 75,
      agreeableness: 85,
      conscientiousness: 70,
      emotionalStability: 80,
      openness: 85,
    },
  },
  communicationStyles: {
    user: "Direct Communicator",
    other: "Diplomatic Communicator",
    dynamics: "Your direct communication style paired with Alex's diplomatic approach can create balanced conversations when both styles are respected. You may help Alex be more straightforward, while Alex can help you consider how messages might be received.",
  },
};

// Helper function to get compatibility level description
const getCompatibilityLevel = (score) => {
  if (score >= 90) return { level: "Exceptional", description: "Highly aligned in critical areas" };
  if (score >= 75) return { level: "Strong", description: "Well-matched with minor differences" };
  if (score >= 60) return { level: "Moderate", description: "Workable differences requiring some adaptation" };
  if (score >= 40) return { level: "Mixed", description: "Significant differences requiring substantial effort" };
  return { level: "Limited", description: "Fundamental differences in key areas" };
};

export default function CompatibilityReportPage({ params }) {
  const { id } = params;
  const { level, description } = getCompatibilityLevel(mockCompatibilityData.overallScore);
  
  return (
    <AppLayout>
      <div className="container py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/matrix">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Matrix
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                Compatibility with {mockCompatibilityData.person.name}
              </h1>
              <p className="text-muted-foreground">
                Detailed analysis of your compatibility across multiple dimensions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <UserCircle2 className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button size="sm">
                <MessagesSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Compatibility Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <svg className="w-40 h-40">
                    <circle
                      className="text-muted-foreground/20"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="62"
                      cx="80"
                      cy="80"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="8"
                      strokeDasharray={390}
                      strokeDashoffset={390 - (390 * mockCompatibilityData.overallScore) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="62"
                      cx="80"
                      cy="80"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-4xl font-bold">{mockCompatibilityData.overallScore}</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
                <Badge className="mt-2 text-lg py-1.5 px-3">
                  {level} Compatibility
                </Badge>
                <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                  {description}
                </p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-green-500" />
                    Relationship Strengths
                  </h3>
                  <ul className="space-y-2">
                    {mockCompatibilityData.strengths.map((strength, index) => (
                      <li key={index} className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{strength.title}</p>
                          <p className="text-sm text-muted-foreground">{strength.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Potential Challenges
                  </h3>
                  <ul className="space-y-2">
                    {mockCompatibilityData.challenges.map((challenge, index) => (
                      <li key={index} className="flex gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{challenge.title}</p>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown */}
        <h2 className="text-2xl font-bold mb-6">Dimension Breakdown</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {mockCompatibilityData.dimensionScores.map((dimension) => (
            <Card key={dimension.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{dimension.name}</CardTitle>
                <CardDescription>Compatibility score in this dimension</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl font-bold">{dimension.score}</div>
                  <Badge 
                    className={dimension.score >= 90 ? "bg-green-500" : 
                             dimension.score >= 75 ? "bg-green-400" : 
                             dimension.score >= 60 ? "bg-yellow-400" : 
                             dimension.score >= 40 ? "bg-orange-400" : "bg-red-500"}
                  >
                    {getCompatibilityLevel(dimension.score).level}
                  </Badge>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dimension.color}`}
                    style={{ width: `${dimension.score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis Tabs */}
        <h2 className="text-2xl font-bold mb-6">Detailed Analysis</h2>
        <Tabs defaultValue="personality" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="interests">Interests & Activities</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="values">Values & Beliefs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personality">
            <Card>
              <CardHeader>
                <CardTitle>Personality Traits Comparison</CardTitle>
                <CardDescription>
                  How your personality traits align with {mockCompatibilityData.person.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.keys(mockCompatibilityData.personalityDetails.user).map((trait) => {
                    const userScore = mockCompatibilityData.personalityDetails.user[trait];
                    const otherScore = mockCompatibilityData.personalityDetails.other[trait];
                    const traitName = trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1');
                    
                    return (
                      <div key={trait}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{traitName}</span>
                        </div>
                        <div className="relative h-8 w-full bg-muted rounded-lg overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-blue-200 opacity-30" style={{ width: '100%' }} />
                          
                          {/* User's score */}
                          <div 
                            className="absolute top-0 h-4 mt-2 bg-blue-500 rounded-full"
                            style={{ left: `${Math.min(userScore, 100)}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-xs font-semibold px-1 rounded bg-blue-100 text-blue-700">You: {userScore}%</span>
                            </div>
                          </div>
                          
                          {/* Other person's score */}
                          <div 
                            className="absolute top-0 h-4 mt-2 bg-purple-500 rounded-full"
                            style={{ left: `${Math.min(otherScore, 100)}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="w-3 h-3 bg-purple-500 rounded-full" />
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-xs font-semibold px-1 rounded bg-purple-100 text-purple-700">Alex: {otherScore}%</span>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <CardTitle>Interests & Activities</CardTitle>
                <CardDescription>
                  Shared and individual interests between you and {mockCompatibilityData.person.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-3">Shared Interests</h3>
                    <div className="space-y-2">
                      {mockCompatibilityData.interests.shared.map((interest, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-100">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{interest}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-3">Your Unique Interests</h3>
                    <div className="space-y-2">
                      {mockCompatibilityData.interests.user.map((interest, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border border-blue-100">
                          <UserCircle2 className="h-4 w-4 text-blue-500" />
                          <span>{interest}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-3">{mockCompatibilityData.person.name}'s Unique Interests</h3>
                    <div className="space-y-2">
                      {mockCompatibilityData.interests.other.map((interest, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-purple-50 border border-purple-100">
                          <UserCircle2 className="h-4 w-4 text-purple-500" />
                          <span>{interest}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Activity Compatibility</h3>
                  <p className="text-muted-foreground">
                    You share 4 key interests, which creates a strong foundation for spending quality time together.
                    Your unique interests add variety to your relationship, while still having enough common activities
                    to enjoy together.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Communication Styles</CardTitle>
                <CardDescription>
                  How your communication approaches interact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Your Communication Style</h3>
                    <Badge className="bg-blue-500 mb-2">{mockCompatibilityData.communicationStyles.user}</Badge>
                    <p className="text-muted-foreground">
                      You tend to communicate in a straightforward manner, prioritizing clarity and efficiency.
                      You express your thoughts and feelings explicitly and prefer others to do the same.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{mockCompatibilityData.person.name}'s Communication Style</h3>
                    <Badge className="bg-purple-500 mb-2">{mockCompatibilityData.communicationStyles.other}</Badge>
                    <p className="text-muted-foreground">
                      Alex tends to communicate diplomatically, prioritizing harmony and relationship preservation.
                      They are careful with word choice and may sometimes hint at rather than directly state concerns.
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Communication Dynamics</h3>
                  <p className="text-muted-foreground">
                    {mockCompatibilityData.communicationStyles.dynamics}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>You can complement each other's communication gaps</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>You balance clarity with sensitivity</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>Recognize when directness might be received as harshness</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>Ask for clarification when you sense Alex is being indirect</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="values">
            <Card>
              <CardHeader>
                <CardTitle>Values & Beliefs</CardTitle>
                <CardDescription>
                  Alignment in core values and belief systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <p className="text-muted-foreground">Values & Beliefs analysis is available after completing the corresponding assessment.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}