"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { CompatibilityCard } from "@/components/compatibility/compatibility-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Mock data for connections
const mockConnections = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/avatars/alex.png",
    score: 92,
    strengths: ["Shared values around honesty and personal growth"],
    challenges: ["Different communication styles"],
    dimensions: [
      { name: "Values", score: 91 },
      { name: "Personality", score: 82 },
      { name: "Emotional Intelligence", score: 94 },
    ],
  },
  {
    id: 2,
    name: "Jamie Smith",
    avatar: "/avatars/jamie.png",
    score: 88,
    strengths: ["Complementary personality traits"],
    challenges: ["Differing views on work-life balance"],
    dimensions: [
      { name: "Personality", score: 89 },
      { name: "Communication", score: 85 },
      { name: "Interests", score: 78 },
    ],
  },
  {
    id: 3,
    name: "Taylor West",
    avatar: "/avatars/taylor.png",
    score: 85,
    strengths: ["Shared interests in outdoor activities"],
    challenges: ["Different approaches to planning"],
    dimensions: [
      { name: "Interests", score: 93 },
      { name: "Values", score: 79 },
      { name: "Lifestyle", score: 76 },
    ],
  },
  {
    id: 4,
    name: "Morgan Reed",
    avatar: "/avatars/morgan.png",
    score: 80,
    strengths: ["Similar communication styles"],
    challenges: ["Different long-term goals"],
    dimensions: [
      { name: "Communication", score: 92 },
      { name: "Personality", score: 81 },
      { name: "Goals", score: 65 },
    ],
  },
  {
    id: 5,
    name: "Casey Kim",
    avatar: "/avatars/casey.png",
    score: 76,
    strengths: ["Shared professional interests"],
    challenges: ["Different social preferences"],
    dimensions: [
      { name: "Interests", score: 85 },
      { name: "Communication", score: 73 },
      { name: "Lifestyle", score: 71 },
    ],
  },
  {
    id: 6,
    name: "Jordan Lee",
    avatar: "/avatars/jordan.png",
    score: 74,
    strengths: ["Complementary problem-solving approaches"],
    challenges: ["Different energy levels"],
    dimensions: [
      { name: "Personality", score: 79 },
      { name: "Communication", score: 73 },
      { name: "Values", score: 72 },
    ],
  },
];

// Mock suggested connections
const mockSuggestions = [
  {
    id: 7,
    name: "Riley Parker",
    avatar: "/avatars/riley.png",
    score: 89,
    strengths: ["Similar values and goals"],
    challenges: ["Different communication preferences"],
    dimensions: [
      { name: "Values", score: 93 },
      { name: "Goals", score: 87 },
      { name: "Communication", score: 68 },
    ],
  },
  {
    id: 8,
    name: "Avery Thompson",
    avatar: "/avatars/avery.png",
    score: 85,
    strengths: ["Shared intellectual interests"],
    challenges: ["Different social energy levels"],
    dimensions: [
      { name: "Interests", score: 92 },
      { name: "Personality", score: 84 },
      { name: "Lifestyle", score: 71 },
    ],
  },
  {
    id: 9,
    name: "Quinn Wilson",
    avatar: "/avatars/quinn.png",
    score: 83,
    strengths: ["Compatible work styles"],
    challenges: ["Different preferences for routine"],
    dimensions: [
      { name: "Communication", score: 86 },
      { name: "Goals", score: 81 },
      { name: "Lifestyle", score: 69 },
    ],
  },
];

// Mock pending connection requests
const mockPendingRequests = [
  {
    id: 10,
    name: "Blake Anderson",
    avatar: "/avatars/blake.png",
    score: 81,
    dimensions: [
      { name: "Values", score: 85 },
      { name: "Personality", score: 79 },
      { name: "Interests", score: 77 },
    ],
    requestedAt: "2025-04-10T14:30:00Z",
  },
  {
    id: 11,
    name: "Reese Garcia",
    avatar: "/avatars/reese.png",
    score: 78,
    dimensions: [
      { name: "Communication", score: 82 },
      { name: "Goals", score: 76 },
      { name: "Values", score: 75 },
    ],
    requestedAt: "2025-04-12T09:15:00Z",
  },
];

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("compatibility");
  const [filterThreshold, setFilterThreshold] = useState(0);
  const [activeTab, setActiveTab] = useState("connections");
  
  // Filter and sort connections based on user input
  const filterConnections = (connections: typeof mockConnections) => {
    return connections
      .filter(
        (connection) =>
          connection.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          connection.score >= filterThreshold
      )
      .sort((a, b) => {
        if (sortOrder === "compatibility") {
          return b.score - a.score;
        } else if (sortOrder === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortOrder === "recent") {
          // In a real app, would sort by most recent interaction
          return 0;
        }
        return 0;
      });
  };
  
  const filteredConnections = filterConnections(mockConnections);
  const filteredSuggestions = filterConnections(mockSuggestions);

  return (
    <AppLayout>
      <div className="container py-6 sm:py-8 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Connections</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your connections and discover new compatibility matches
            </p>
          </div>
        </div>
        
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="w-full sm:w-1/2 lg:w-2/3">
            <Label htmlFor="search" className="sr-only">
              Search connections
            </Label>
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm"
            />
          </div>
          <div className="flex gap-3 sm:gap-4 w-full sm:w-1/2 lg:w-1/3">
            <div className="w-1/2">
              <Label htmlFor="sort" className="sr-only">
                Sort by
              </Label>
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger id="sort" className="text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compatibility" className="text-xs sm:text-sm">Highest Compatibility</SelectItem>
                  <SelectItem value="name" className="text-xs sm:text-sm">Name (A-Z)</SelectItem>
                  <SelectItem value="recent" className="text-xs sm:text-sm">Most Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              <Label htmlFor="filter" className="sr-only">
                Filter by
              </Label>
              <Select
                value={filterThreshold.toString()}
                onValueChange={(value) => setFilterThreshold(parseInt(value))}
              >
                <SelectTrigger id="filter" className="text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-xs sm:text-sm">Show All</SelectItem>
                  <SelectItem value="60" className="text-xs sm:text-sm">60%+ Compatibility</SelectItem>
                  <SelectItem value="75" className="text-xs sm:text-sm">75%+ Compatibility</SelectItem>
                  <SelectItem value="90" className="text-xs sm:text-sm">90%+ Compatibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Tabs 
          defaultValue="connections"
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <div className="overflow-x-auto">
            <TabsList className="mb-6 w-full md:w-auto inline-flex">
              <TabsTrigger value="connections" className="text-xs sm:text-sm">Your Connections</TabsTrigger>
              <TabsTrigger value="suggestions" className="text-xs sm:text-sm">Suggested Matches</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending Requests</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="connections">
            {filteredConnections.length === 0 ? (
              <div className="text-center py-8 sm:py-10 border rounded-lg bg-muted/30">
                <h3 className="text-base sm:text-lg font-medium">No connections found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try adjusting your search criteria."
                    : "You don't have any connections yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredConnections.map((connection) => (
                  <CompatibilityCard
                    key={connection.id}
                    userId={connection.id}
                    name={connection.name}
                    avatar={connection.avatar}
                    score={connection.score}
                    strengths={connection.strengths}
                    challenges={connection.challenges}
                    dimensions={connection.dimensions}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 sm:py-10 border rounded-lg bg-muted/30">
                <h3 className="text-base sm:text-lg font-medium">No suggestions found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {searchQuery || filterThreshold > 0
                    ? "Try adjusting your search or filter criteria."
                    : "Complete more assessments to get personalized suggestions."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredSuggestions.map((suggestion) => (
                  <CompatibilityCard
                    key={suggestion.id}
                    userId={suggestion.id}
                    name={suggestion.name}
                    avatar={suggestion.avatar}
                    score={suggestion.score}
                    strengths={suggestion.strengths}
                    challenges={suggestion.challenges}
                    dimensions={suggestion.dimensions}
                    actionText="Connect"
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {mockPendingRequests.length === 0 ? (
              <div className="text-center py-8 sm:py-10 border rounded-lg bg-muted/30">
                <h3 className="text-base sm:text-lg font-medium">No pending requests</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  You don't have any pending connection requests.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {mockPendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg overflow-hidden h-full">
                    <div className="p-4 sm:p-6 flex items-center">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                        <span className="text-xs font-medium">
                          {request.name.split(' ')[0][0]}{request.name.split(' ')[1][0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{request.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Compatibility: {request.score}%
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Requested {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="border-t p-3 sm:p-4 flex gap-2 sm:gap-3">
                      <Button className="w-1/2 text-xs sm:text-sm py-1 sm:py-2 h-auto">
                        Accept
                      </Button>
                      <Button variant="outline" className="w-1/2 text-xs sm:text-sm py-1 sm:py-2 h-auto">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}