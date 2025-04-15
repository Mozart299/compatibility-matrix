
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Edit, Save, Upload, User } from "lucide-react";

// Mock user data
const mockUserData = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/avatars/you.png",
  profileCompletion: 85,
  bio: "Software engineer with a passion for building meaningful connections. Enjoys hiking, reading, and exploring new cuisines.",
  personalityType: "INFJ",
  location: "San Francisco, CA",
  joinedDate: "2024-12-15",
  privacySettings: {
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
    allowMessaging: true,
    showCompatibilityScores: true,
  },
  assessmentStatus: [
    { id: "personality", name: "Personality Traits", status: "completed", date: "2025-03-10" },
    { id: "values", name: "Values & Beliefs", status: "completed", date: "2025-03-12" },
    { id: "interests", name: "Interests & Activities", status: "completed", date: "2025-03-14" },
    { id: "communication", name: "Communication Styles", status: "in_progress" },
    { id: "goals", name: "Life Goals & Priorities", status: "not_started" },
    { id: "emotional", name: "Emotional Intelligence", status: "not_started" },
    { id: "lifestyle", name: "Lifestyle Preferences", status: "not_started" },
  ],
  personalitySummary: {
    extraversion: 45,
    agreeableness: 80,
    conscientiousness: 75,
    emotionalStability: 65,
    openness: 85,
  },
  interests: ["Hiking", "Reading", "Cooking", "Photography", "Jazz Music", "Documentary Films", "Travel"],
  valuesSummary: [
    { name: "Personal Growth", importance: "high" },
    { name: "Family", importance: "high" },
    { name: "Honesty", importance: "high" },
    { name: "Adventure", importance: "medium" },
    { name: "Community", importance: "medium" },
    { name: "Tradition", importance: "low" },
  ],
  communicationStyle: "Thoughtful Communicator",
};

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(mockUserData);

  const handleSaveProfile = () => {
    setEditMode(false);
    // In a real app, you would save changes to the backend here
  };

  const handleChange = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: value,
      },
    }));
  };

  return (
    <AppLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile information and privacy settings
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {editMode ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    value={userData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-center font-bold text-xl"
                  />
                  <Input
                    value={userData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="text-center text-muted-foreground"
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl">{userData.name}</CardTitle>
                  <CardDescription>{userData.location}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile Completion</span>
                  <span>{userData.profileCompletion}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${userData.profileCompletion}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Member since</p>
                <p>{new Date(userData.joinedDate).toLocaleDateString()}</p>
              </div>

              {userData.personalityType && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Personality Type</p>
                  <Badge className="bg-blue-500">{userData.personalityType}</Badge>
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Communication Style</p>
                <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                  {userData.communicationStyle}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About You</CardTitle>
                    <CardDescription>Your personal bio and information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <Textarea
                        value={userData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        className="min-h-32"
                      />
                    ) : (
                      <p className="text-muted-foreground">{userData.bio}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interests</CardTitle>
                    <CardDescription>Things you enjoy and are passionate about</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {userData.interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {interest}
                              <button
                                className="ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const newInterests = [...userData.interests];
                                  newInterests.splice(index, 1);
                                  handleChange("interests", newInterests);
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Add new interest" id="new-interest" />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById("new-interest") as HTMLInputElement;
                              if (input.value.trim()) {
                                handleChange("interests", [...userData.interests, input.value.trim()]);
                                input.value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userData.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personality Traits</CardTitle>
                    <CardDescription>
                      Based on your completed personality assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(userData.personalitySummary).map(([trait, score]) => {
                        const traitName = trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1');
                        
                        return (
                          <div key={trait}>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{traitName}</span>
                              <span>{score}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Core Values</CardTitle>
                    <CardDescription>
                      Your most important principles and beliefs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {userData.valuesSummary.map((value, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div 
                            className={`h-3 w-3 rounded-full ${
                              value.importance === "high" 
                                ? "bg-blue-500" 
                                : value.importance === "medium" 
                                ? "bg-blue-300" 
                                : "bg-blue-200"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{value.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {value.importance} importance
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assessments">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Status</CardTitle>
                    <CardDescription>
                      Track your progress across different compatibility dimensions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData.assessmentStatus.map((assessment) => (
                        <div key={assessment.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {assessment.status === "completed" && (
                              <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                            )}
                            {assessment.status === "in_progress" && (
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            {assessment.status === "not_started" && (
                              <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5" />
                              </div>
                            )}
                            
                            <div>
                              <p className="font-medium">{assessment.name}</p>
                              {assessment.date && (
                                <p className="text-xs text-muted-foreground">
                                  Completed on {new Date(assessment.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <Badge
                            variant={
                              assessment.status === "completed"
                                ? "default"
                                : assessment.status === "in_progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {assessment.status === "completed"
                              ? "Completed"
                              : assessment.status === "in_progress"
                              ? "In Progress"
                              : "Not Started"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <a href="/assessment">Continue Assessments</a>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control who can see your information and interact with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profile-visibility" className="font-medium">
                          Profile Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Who can view your profile and compatibility information
                        </p>
                      </div>
                      <div className="flex items-center">
                        <select
                          id="profile-visibility"
                          className="border rounded p-2"
                          value={userData.privacySettings.profileVisibility}
                          onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                          disabled={!editMode}
                        >
                          <option value="public">Everyone</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-email" className="font-medium">
                          Show Email Address
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your email address
                        </p>
                      </div>
                      <Switch
                        id="show-email"
                        checked={userData.privacySettings.showEmail}
                        onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-location" className="font-medium">
                          Show Location
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your location
                        </p>
                      </div>
                      <Switch
                        id="show-location"
                        checked={userData.privacySettings.showLocation}
                        onCheckedChange={(checked) => handlePrivacyChange("showLocation", checked)}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow-messaging" className="font-medium">
                          Allow Messaging
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Let others send you direct messages
                        </p>
                      </div>
                      <Switch
                        id="allow-messaging"
                        checked={userData.privacySettings.allowMessaging}
                        onCheckedChange={(checked) => handlePrivacyChange("allowMessaging", checked)}
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-compatibility" className="font-medium">
                          Show Compatibility Scores
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your compatibility scores with them
                        </p>
                      </div>
                      <Switch
                        id="show-compatibility"
                        checked={userData.privacySettings.showCompatibilityScores}
                        onCheckedChange={(checked) => handlePrivacyChange("showCompatibilityScores", checked)}
                        disabled={!editMode}
                      />
                    </div>
                  </CardContent>
                  {editMode && (
                    <CardFooter>
                      <Button className="w-full" onClick={handleSaveProfile}>
                        Save Privacy Settings
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}