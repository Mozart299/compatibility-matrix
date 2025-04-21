"use client";

import { useState, useEffect } from "react";
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
import { Loader, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompatibilityService, AssessmentService } from "@/lib/api-services";

export default function MatrixPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface MatrixScore {
    user_id: string;
    score: number;
  }

  interface MatrixRow {
    user_id: string;
    name: string;
    scores: MatrixScore[];
  }

  interface MatrixData {
    matrix: MatrixRow[];
  }

  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  interface Dimension {
    id: string;
    name: string;
  }
  
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [activeTab, setActiveTab] = useState("overall");
  const [searchQuery, setSearchQuery] = useState("");
  const [thresholdFilter, setThresholdFilter] = useState("0");
  
  // Load matrix and dimension data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Load dimensions first
        const dimensionsData = await AssessmentService.getDimensions();
        setDimensions(dimensionsData);
        
        // Load initial matrix data (overall compatibility)
        const matrix = await CompatibilityService.getMatrix();
        setMatrixData(matrix);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading compatibility data:", err);
        setError("Failed to load compatibility data. Please try again.");
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Handle tab change (overall or dimension-specific)
  const handleTabChange = async (tab: string) => {
    try {
      setActiveTab(tab);
      setLoading(true);
      
      // If "overall", get full matrix, otherwise filter by dimension
      if (tab === "overall") {
        const matrix = await CompatibilityService.getMatrix(
          null, 
          thresholdFilter !== "0" ? parseInt(thresholdFilter) : null
        );
        setMatrixData(matrix);
      } else {
        // Find dimension ID based on the tab value
        const dimension = dimensions.find(d => d.id === tab || d.name.toLowerCase().replace(/\s+/g, '') === tab);
        
        if (dimension) {
          const matrix = await CompatibilityService.getMatrix(
            dimension.id, 
            thresholdFilter !== "0" ? parseInt(thresholdFilter) : null
          );
          setMatrixData(matrix);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading compatibility data for tab:", err);
      setError("Failed to load compatibility data. Please try again.");
      setLoading(false);
    }
  };
  
  // Handle threshold filter change
  const handleThresholdChange = async (value: string) => {
    try {
      setThresholdFilter(value);
      setLoading(true);
      
      // Re-fetch matrix with new threshold
      if (activeTab === "overall") {
        const matrix = await CompatibilityService.getMatrix(
          null, 
          value !== "0" ? parseInt(value) : null
        );
        setMatrixData(matrix);
      } else {
        // Find dimension ID based on the active tab
        const dimension = dimensions.find(d => d.id === activeTab || d.name.toLowerCase().replace(/\s+/g, '') === activeTab);
        
        if (dimension) {
          const matrix = await CompatibilityService.getMatrix(
            dimension.id, 
            value !== "0" ? parseInt(value) : null
          );
          setMatrixData(matrix);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error applying threshold filter:", err);
      setError("Failed to update compatibility data. Please try again.");
      setLoading(false);
    }
  };
  
  // Helper function to filter matrix data by search query
  const getFilteredMatrix = () => {
    if (!matrixData || !matrixData.matrix) return [];
    
    if (!searchQuery) return matrixData.matrix;
    
    // Filter matrix rows by name
    return matrixData.matrix.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Helper function to get color based on compatibility score
  const getColorForScore = (score: number | null): string => {
    if (!score && score !== 0) return "bg-gray-200"; // No data
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-green-400";
    if (score >= 60) return "bg-yellow-400";
    if (score >= 45) return "bg-orange-400";
    return "bg-red-500";
  };

  const getTextColorForScore = (score: number | null): string => {
    if (!score && score !== 0) return "text-gray-500"; // No data
    if (score >= 75) return "text-white";
    if (score >= 45) return "text-gray-900";
    return "text-white";
  };
  
  // Display loading state
  if (loading && !matrixData) {
    return (
      <AppLayout>
        <div className="container py-10">
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
  if (error && !matrixData) {
    return (
      <AppLayout>
        <div className="container py-10">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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

  // Get filtered matrix data
  const filteredMatrix = getFilteredMatrix();

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
              <Input 
                type="search" 
                id="search" 
                placeholder="Search by name..." 
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overall" value={activeTab} onValueChange={handleTabChange} className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              {dimensions.map(dimension => (
                <TabsTrigger 
                  key={dimension.id} 
                  value={dimension.id}
                >
                  {dimension.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-4 md:mt-0">
              <Select value={thresholdFilter} onValueChange={handleThresholdChange}>
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

          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "overall" 
                    ? "Overall Compatibility Matrix" 
                    : `${dimensions.find(d => d.id === activeTab)?.name || "Dimension"} Compatibility`}
                </CardTitle>
                <CardDescription>
                  {activeTab === "overall"
                    ? "Combined compatibility across all dimensions"
                    : `Compatibility based on ${dimensions.find(d => d.id === activeTab)?.name || "this dimension"} only`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader className="h-6 w-6 animate-spin" />
                      <p className="text-sm text-muted-foreground">Updating compatibility data...</p>
                    </div>
                  </div>
                ) : filteredMatrix.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No compatibility data available or no matching results.</p>
                    <p className="text-sm text-muted-foreground mt-2">Complete more assessments to see compatibility data.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="p-3 text-left font-medium text-muted-foreground"></th>
                          {filteredMatrix.map((person) => (
                            <th key={person.user_id} className="p-3 text-left font-medium">
                              <div className="flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-1">
                                  <span className="text-xs font-medium">
                                    {person.name === "You" ? "You" : `${person.name.split(' ')[0][0]}${person.name.split(' ').length > 1 ? person.name.split(' ')[1][0] : ''}`}
                                  </span>
                                </div>
                                <span className="text-sm whitespace-nowrap">{person.name}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMatrix.map((person1) => (
                          <tr key={person1.user_id} className="border-t">
                            <td className="p-3 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {person1.name === "You" ? "You" : `${person1.name.split(' ')[0][0]}${person1.name.split(' ').length > 1 ? person1.name.split(' ')[1][0] : ''}`}
                                  </span>
                                </div>
                                <span>{person1.name}</span>
                              </div>
                            </td>
                            {filteredMatrix.map((person2) => {
                              // Find the score between these two users
                              const scoreObj = person1.scores.find(s => s.user_id === person2.user_id);
                              const score = scoreObj ? scoreObj.score : null;
                              
                              return (
                                <td
                                  key={person2.user_id}
                                  className="p-3 text-center"
                                >
                                  <div className="flex justify-center">
                                    <div
                                      className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorForScore(score)} ${getTextColorForScore(score)}`}
                                    >
                                      {score !== null ? score : '-'}
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
                )}
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
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-200"></div>
              <span>No Data Available</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}