"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { axiosInstance } from "@/lib/auth-service";

// Profile data interface matching Supabase 'profiles' table
interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at?: string;
  
  // Additional profile data fields
  personality_type?: string;
  communication_style?: string;
  profile_completion?: number;
  personality_summary?: Record<string, number>;
  interests?: string[];
  values_summary?: Array<{name: string; importance: string}>;
  
  // Privacy settings
  privacy_settings?: {
    profile_visibility: string;
    show_email: boolean;
    show_location: boolean;
    allow_messaging: boolean;
    show_compatibility: boolean;
  };
}

// Interface for assessment status data
interface AssessmentStatus {
  id: string;
  name: string;
  status: string;
  date?: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [assessments, setAssessments] = useState<AssessmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  // Fetch user profile data when auth is ready
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfileData();
      fetchAssessmentStatus();
    }
  }, [authLoading, user]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      // Make API call to fetch user profile
      const response = await axiosInstance.get('/users/me');

      console.log("API Response:", response);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to load profile data');
      }
      
      const profileData = response.data;
      
      // Transform backend data to fit component's needs
      setProfile({
        ...profileData,
        // Set default privacy settings if not present
        privacy_settings: profileData.privacy_settings || {
          profile_visibility: 'public',
          show_email: false,
          show_location: true,
          allow_messaging: true,
          show_compatibility: true
        },
        // Use empty arrays as fallbacks
        interests: profileData.interests || [],
        values_summary: profileData.values_summary || [],
        // Set profile completion
        profile_completion: profileData.profile_completion || 
          calculateProfileCompletion(profileData)
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentStatus = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axiosInstance.get('/assessments');
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to load assessment data');
      }
      
      const data = response.data;
      
      // Transform assessment data for our component
      const assessmentData = data.assessments.map((assessment: any) => ({
        id: assessment.dimension_id,
        name: getDimensionName(assessment.dimension_id),
        status: assessment.status,
        date: assessment.status === "completed" ? assessment.updated_at : undefined
      }));
      
      setAssessments(assessmentData);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      // Don't set error for assessments as it's not critical
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: any) => {
    const requiredFields = ['name', 'bio', 'location'];
    const optionalFields = ['avatar_url', 'personality_type', 'interests', 'communication_style'];
    
    let filled = 0;
    let total = 0;
    
    requiredFields.forEach(field => {
      total++;
      if (profile[field]) filled++;
    });
    
    optionalFields.forEach(field => {
      total++;
      if (profile[field]) {
        if (Array.isArray(profile[field])) {
          if (profile[field].length > 0) filled++;
        } else {
          filled++;
        }
      }
    });
    
    return Math.round((filled / total) * 100);
  };

  // Get dimension name from ID
  const getDimensionName = (dimensionId: string) => {
    const dimensionMap: Record<string, string> = {
      'personality': 'Personality Traits',
      'values': 'Values & Beliefs',
      'interests': 'Interests & Activities',
      'communication': 'Communication Styles',
      'goals': 'Life Goals & Priorities',
      'emotional': 'Emotional Intelligence',
      'lifestyle': 'Lifestyle Preferences'
    };
    
    return dimensionMap[dimensionId] || dimensionId;
  };

  const handleSaveProfile = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!profile) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      // Prepare data for API
      const updateData = {
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        avatar_url: profile.avatar_url,
        privacy_settings: profile.privacy_settings
      };
      
      // Make API call to update profile
      const response = await axiosInstance.put('/users/me', updateData);
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to update profile');
      }
      
      // Show success message and exit edit mode
      setSaveSuccess(true);
      setEditMode(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile changes. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (!profile) return;
    
    setProfile((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    if (!profile || !profile.privacy_settings) return;
    
    setProfile((prev) => ({
      ...prev!,
      privacy_settings: {
        ...prev!.privacy_settings!,
        [field]: value,
      },
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, this would upload to your backend or Supabase storage
    // For this example, we'll use a file reader to simulate upload
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleChange('avatar_url', reader.result);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to upload image. Please try again.");
    }
  };

  // Display loading state
  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="space-y-4 text-center">
              <div className="h-12 w-12 border-4 border-t-primary border-muted rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Display error state
  if (authError || error || !profile) {
    return (
      <AppLayout>
        <div className="container py-6 sm:py-8 md:py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError || error || "Failed to load profile. Please try again."}
            </AlertDescription>
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
      <div className="container py-6 sm:py-8 md:py-10">
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your profile information and privacy settings
            </p>
          </div>
          <div className="w-full md:w-auto flex justify-end">
            {editMode ? (
              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditMode(false)} 
                  className="flex-1 md:flex-auto text-xs sm:text-sm"
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveProfile} 
                  className="flex-1 md:flex-auto text-xs sm:text-sm"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      Saving...
                      <div className="ml-2 h-4 w-4 border-2 border-t-white border-background rounded-full animate-spin"></div>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setEditMode(true)} className="text-xs sm:text-sm">
                <Edit className="h-3.5 w-3.5 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Summary Card */}
          <Card>
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback>
                      {profile.name
                        .split(' ')
                        .map(name => name[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <label htmlFor="avatar-upload">
                      <div className="absolute bottom-0 right-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-secondary hover:bg-secondary/90 cursor-pointer flex items-center justify-center">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    value={profile.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-center font-bold text-base sm:text-lg"
                  />
                  <Input
                    value={profile.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="text-center text-xs sm:text-sm text-muted-foreground"
                    placeholder="Your location"
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg sm:text-xl">{profile.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {profile.location || "No location set"}
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span>Profile Completion</span>
                  <span>{profile.profile_completion || 0}%</span>
                </div>
                <div className="h-1.5 sm:h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${profile.profile_completion || 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 sm:pt-2">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Member since</p>
                <p className="text-xs sm:text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>

              {profile.personality_type && (
                <div className="pt-1 sm:pt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Personality Type</p>
                  <Badge className="bg-blue-500 text-xs">{profile.personality_type}</Badge>
                </div>
              )}

              {profile.communication_style && (
                <div className="pt-1 sm:pt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Communication Style</p>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-600 text-xs">
                    {profile.communication_style}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            <Tabs 
              defaultValue="about"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4 sm:mb-6 overflow-x-auto pb-1 w-full flex justify-start">
                <TabsTrigger value="about" className="text-xs sm:text-sm">About</TabsTrigger>
                <TabsTrigger value="assessments" className="text-xs sm:text-sm">Assessments</TabsTrigger>
                <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">About You</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your personal bio and information</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
                    {editMode ? (
                      <Textarea
                        value={profile.bio || ""}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        className="min-h-24 sm:min-h-32 text-xs sm:text-sm"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {profile.bio || "No bio information added yet."}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Interests</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Things you enjoy and are passionate about</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
                    {editMode ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {profile.interests && profile.interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs">
                              {interest}
                              <button
                                className="ml-1.5 sm:ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const newInterests = [...profile.interests!];
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
                          <Input placeholder="Add new interest" id="new-interest" className="text-xs sm:text-sm" />
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={() => {
                              const input = document.getElementById("new-interest") as HTMLInputElement;
                              if (input.value.trim()) {
                                handleChange("interests", [...(profile.interests || []), input.value.trim()]);
                                input.value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {profile.interests && profile.interests.length > 0 ? (
                          profile.interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs">
                              {interest}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs sm:text-sm text-muted-foreground">No interests added yet.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {profile.personality_summary && Object.keys(profile.personality_summary).length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">Personality Traits</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Based on your completed personality assessment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="space-y-3 sm:space-y-4">
                        {Object.entries(profile.personality_summary).map(([trait, score]) => {
                          const traitName = trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1');
                          
                          return (
                            <div key={trait}>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs sm:text-sm font-medium">{traitName}</span>
                                <span className="text-xs sm:text-sm">{score}%</span>
                              </div>
                              <div className="h-1.5 sm:h-2 w-full bg-muted rounded-full overflow-hidden">
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
                )}

                {profile.values_summary && profile.values_summary.length > 0 && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg">Core Values</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Your most important principles and beliefs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {profile.values_summary.map((value, index) => (
                          <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
                            <div 
                              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                                value.importance === "high" 
                                  ? "bg-blue-500" 
                                  : value.importance === "medium" 
                                  ? "bg-blue-300" 
                                  : "bg-blue-200"
                              }`}
                            />
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{value.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                                {value.importance} importance
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="assessments">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Assessment Status</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Track your progress across different compatibility dimensions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-3 sm:py-4">
                    {assessments.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {assessments.map((assessment) => (
                          <div key={assessment.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {assessment.status === "completed" && (
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                              )}
                              {assessment.status === "in_progress" && (
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                  <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                              {assessment.status === "not_started" && (
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                              )}
                              
                              <div>
                                <p className="font-medium text-xs sm:text-sm">{assessment.name}</p>
                                {assessment.date && (
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">
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
                              className="text-[10px] sm:text-xs"
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
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No assessments found. Start an assessment to improve your compatibility insights.</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
                    <Button className="w-full text-xs sm:text-sm" asChild>
                      <Link href="/assessment">Continue Assessments</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Privacy Settings</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Control who can see your information and interact with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
                    {profile.privacy_settings && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="show-compatibility" className="text-xs sm:text-sm font-medium">
                              Show Compatibility Scores
                            </Label>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              Allow others to see your compatibility scores with them
                            </p>
                          </div>
                          <Switch
                            id="show-compatibility"
                            checked={profile.privacy_settings.show_compatibility}
                            onCheckedChange={(checked) => handlePrivacyChange("show_compatibility", checked)}
                            disabled={!editMode}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                  {editMode && (
                    <CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
                      <Button 
                        className="w-full text-xs sm:text-sm" 
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                      >
                        {saveLoading ? (
                          <>
                            Saving Privacy Settings...
                            <div className="ml-2 h-4 w-4 border-2 border-t-white border-background rounded-full animate-spin"></div>
                          </>
                        ) : (
                          "Save Privacy Settings"
                        )}
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