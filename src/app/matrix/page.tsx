
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data for the compatibility matrix
const mockPeople = [
  { id: 1, name: "You", avatar: "/avatars/you.png" },
  { id: 2, name: "Alex Johnson", avatar: "/avatars/alex.png" },
  { id: 3, name: "Jamie Smith", avatar: "/avatars/jamie.png" },
  { id: 4, name: "Taylor West", avatar: "/avatars/taylor.png" },
  { id: 5, name: "Morgan Reed", avatar: "/avatars/morgan.png" },
  { id: 6, name: "Casey Kim", avatar: "/avatars/casey.png" },
  { id: 7, name: "Jordan Lee", avatar: "/avatars/jordan.png" },
];

// Generate compatibility scores
const generateCompatibilityScores = () => {
  const scores: Record<number, Record<number, number>> = {};
  mockPeople.forEach((person1) => {
    scores[person1.id] = {};
    mockPeople.forEach((person2) => {
      if (person1.id === person2.id) {
        scores[person1.id][person2.id] = 100; // Perfect compatibility with self
      } else {
        // Generate a random score between 45 and 95
        scores[person1.id][person2.id] = Math.floor(Math.random() * 50) + 45;
      }
    });
  });
  return scores;
};

const mockCompatibilityScores = generateCompatibilityScores();

// Helper function to get color based on compatibility score
const getColorForScore = (score: number) => {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-green-400";
  if (score >= 60) return "bg-yellow-400";
  if (score >= 45) return "bg-orange-400";
  return "bg-red-500";
};

const getTextColorForScore = (score: number) => {
  if (score >= 75) return "text-white";
  if (score >= 45) return "text-gray-900";
  return "text-white";
};

export default function MatrixPage() {
  return (
    <AppLayout>
      <div className="container py-10">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compatibility Matrix</h1>
            <p className="text-muted-foreground">
              Explore compatibility relationships across different dimensions.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="search">Search</Label>
              <Input type="search" id="search" placeholder="Search by name..." className="w-full" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overall" className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="values">Values</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>
            <div className="mt-4 md:mt-0">
              <Select defaultValue="75">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Highlight threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90% and above</SelectItem>
                  <SelectItem value="75">75% and above</SelectItem>
                  <SelectItem value="60">60% and above</SelectItem>
                  <SelectItem value="0">Show all scores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overall" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Overall Compatibility Matrix</CardTitle>
                <CardDescription>
                  Combined compatibility across all dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 text-left font-medium text-muted-foreground"></th>
                        {mockPeople.map((person) => (
                          <th key={person.id} className="p-3 text-left font-medium">
                            <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-1">
                                <span className="text-xs font-medium">
                                  {person.name === "You" ? "You" : `${person.name.split(' ')[0][0]}${person.name.split(' ')[1][0]}`}
                                </span>
                              </div>
                              <span className="text-sm whitespace-nowrap">{person.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockPeople.map((person1) => (
                        <tr key={person1.id} className="border-t">
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {person1.name === "You" ? "You" : `${person1.name.split(' ')[0][0]}${person1.name.split(' ')[1][0]}`}
                                </span>
                              </div>
                              <span>{person1.name}</span>
                            </div>
                          </td>
                          {mockPeople.map((person2) => {
                            const score = mockCompatibilityScores[person1.id][person2.id];
                            return (
                              <td
                                key={person2.id}
                                className="p-3 text-center"
                              >
                                <div className="flex justify-center">
                                  <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorForScore(score)} ${getTextColorForScore(score)}`}
                                  >
                                    {score}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personality" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Personality Traits Compatibility</CardTitle>
                <CardDescription>
                  Compatibility based on personality traits including extraversion, emotional stability, 
                  openness to experience, conscientiousness, and agreeableness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Select this tab to view personality compatibility data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Values & Beliefs Compatibility</CardTitle>
                <CardDescription>
                  Compatibility based on core values, religious/spiritual beliefs, 
                  political views, and ethical frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Select this tab to view values compatibility data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Interests & Activities Compatibility</CardTitle>
                <CardDescription>
                  Compatibility based on leisure activities, cultural interests,
                  social activities, and physical activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Select this tab to view interests compatibility data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Communication Styles Compatibility</CardTitle>
                <CardDescription>
                  Compatibility based on expression mode, conflict resolution,
                  emotional expression, and listening style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Select this tab to view communication compatibility data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Matrix Legend</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-green-500"></div>
              <span>90-100: Exceptional Compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-green-400"></div>
              <span>75-89: Strong Compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-yellow-400"></div>
              <span>60-74: Moderate Compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-orange-400"></div>
              <span>45-59: Mixed Compatibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-red-500"></div>
              <span>Below 45: Limited Compatibility</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}