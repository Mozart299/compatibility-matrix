"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  UserPlus,
  UserX,
  Loader2,
  UserCheck,
  AlertCircle,
  SearchIcon,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  useConnections,
  useSuggestedConnections,
  useRespondToConnectionRequest,
  useSendConnectionRequest,
  useRemoveConnection,
} from "@/hooks/useConnections";

// Define interfaces for data structures
interface Compatibility {
  overall_score?: number;
  strengths?: { name: string }[];
  challenges?: { name: string }[];
  dimension_scores?: { name?: string; dimension_id?: string; score: number }[];
}

interface Connection {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  strengths: string[];
  challenges: string[];
  dimensions: { name: string; score: number }[];
  createdAt: string;
}

interface PendingRequest {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  direction: "incoming" | "outgoing";
  createdAt: string;
}

interface Suggestion {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  strengths: string[];
  challenges: string[];
  dimensions: { name: string; score: number }[];
  hasPendingRequest: boolean;
}

// Interface for filterable items (used in getFilteredItems)
interface FilterableItem {
  name: string;
  score: number;
  createdAt?: string;
}

// Interface for hook responses (assuming react-query or similar)
interface ConnectionsResponse {
  connections: {
    id: string;
    user_id: string;
    name: string;
    avatar_url: string;
    compatibility?: Compatibility;
    created_at: string;
    direction?: string; // For pending requests
  }[];
}

interface SuggestionsResponse {
  suggestions: {
    user_id: string;
    name: string;
    avatar_url: string;
    compatibility?: Compatibility;
    has_pending_request: boolean;
  }[];
}

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"compatibility" | "name" | "recent">(
    "compatibility"
  );
  const [filterThreshold, setFilterThreshold] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    "connections" | "suggestions" | "incoming" | "outgoing"
  >("connections");

  // Fetch connections with different statuses
  const {
    data: connectionsData,
    isLoading: connectionsLoading,
    error: connectionsError,
  } = useConnections("accepted") as {
    data?: ConnectionsResponse;
    isLoading: boolean;
    error: Error | null;
  };

  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
  } = useConnections("pending") as {
    data?: ConnectionsResponse;
    isLoading: boolean;
    error: Error | null;
  };

  const {
    data: suggestionsData,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useSuggestedConnections(undefined, filterThreshold > 0 ? filterThreshold : undefined) as {
    data?: SuggestionsResponse;
    isLoading: boolean;
    error: Error | null;
  };

  // State for processed data
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<PendingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PendingRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Mutations for connections actions
  const sendConnectionRequest = useSendConnectionRequest();
  const respondToConnectionRequest = useRespondToConnectionRequest();
  const removeConnection = useRemoveConnection();

  // Process API data into local state
  useEffect(() => {
    // Process established connections
    if (connectionsData?.connections) {
      setConnections(
        connectionsData.connections.map((conn) => ({
          id: conn.id,
          userId: conn.user_id,
          name: conn.name,
          avatar: conn.avatar_url,
          score: conn.compatibility?.overall_score || 0,
          strengths: conn.compatibility?.strengths?.map((s) => s.name) || [],
          challenges: conn.compatibility?.challenges?.map((c) => c.name) || [],
          dimensions:
            conn.compatibility?.dimension_scores?.map((d) => ({
              name: d.name || d.dimension_id || "Unknown",
              score: d.score,
            })) || [],
          createdAt: conn.created_at,
        }))
      );
    }

    // Process pending connections
    if (pendingData?.connections) {
      const incoming: PendingRequest[] = [];
      const outgoing: PendingRequest[] = [];

      pendingData.connections.forEach((conn) => {
        const processedConn: PendingRequest = {
          id: conn.id,
          userId: conn.user_id,
          name: conn.name,
          avatar: conn.avatar_url,
          score: conn.compatibility?.overall_score || 0,
          direction: conn.direction as "incoming" | "outgoing",
          createdAt: conn.created_at,
        };

        if (conn.direction === "incoming") {
          incoming.push(processedConn);
        } else {
          outgoing.push(processedConn);
        }
      });

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    }

    // Process suggested connections
    if (suggestionsData?.suggestions) {
      setSuggestions(
        suggestionsData.suggestions.map((sugg) => ({
          userId: sugg.user_id,
          name: sugg.name,
          avatar: sugg.avatar_url,
          score: sugg.compatibility?.overall_score || 0,
          strengths: sugg.compatibility?.strengths?.map((s) => s.name) || [],
          challenges: sugg.compatibility?.challenges?.map((c) => c.name) || [],
          dimensions:
            sugg.compatibility?.dimension_scores?.map((d) => ({
              name: d.name || d.dimension_id || "Unknown",
              score: d.score,
            })) || [],
          hasPendingRequest: sugg.has_pending_request,
        }))
      );
    }
  }, [connectionsData, pendingData, suggestionsData]);

  // Apply search, filter, and sorting to lists
  const getFilteredItems = <T extends FilterableItem>(items: T[]): T[] => {
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (filterThreshold === 0 || item.score >= filterThreshold)
      )
      .sort((a, b) => {
        if (sortOrder === "compatibility") {
          return b.score - a.score;
        } else if (sortOrder === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortOrder === "recent") {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return b.score - a.score;
        }
        return 0;
      });
  };

  const filteredConnections = getFilteredItems(connections);
  const filteredSuggestions = getFilteredItems(suggestions);
  const filteredIncomingRequests = getFilteredItems(incomingRequests);
  const filteredOutgoingRequests = getFilteredItems(outgoingRequests);

  // Handle sending a connection request
  const handleSendRequest = (userId: string) => {
    sendConnectionRequest.mutate(userId, {
      onSuccess: () => {
        toast.success("Connection request sent", {
          description: "Your connection request was sent successfully.",
        });
      },
      onError: (error: Error) => {
        toast.error("Failed to send request", {
          description: error.message || "Something went wrong. Please try again.",
        });
      },
    });
  };

  // Handle accepting/declining a connection request
  const handleRespondToRequest = (
    connectionId: string,
    action: "accept" | "decline"
  ) => {
    respondToConnectionRequest.mutate(
      { connectionId, action },
      {
        onSuccess: () => {
          toast.success(
            action === "accept" ? "Request accepted" : "Request declined",
            {
              description:
                action === "accept"
                  ? "You've accepted the connection request."
                  : "You've declined the connection request.",
            }
          );
        },
        onError: (error: Error) => {
          toast.error(`Failed to ${action} request`, {
            description:
              error.message || "Something went wrong. Please try again.",
          });
        },
      }
    );
  };

  // Handle removing a connection
  const handleRemoveConnection = (connectionId: string) => {
    if (window.confirm("Are you sure you want to remove this connection?")) {
      removeConnection.mutate(connectionId, {
        onSuccess: () => {
          toast.success("Connection removed", {
            description: "The connection has been removed.",
          });
        },
        onError: (error: Error) => {
          toast.error("Failed to remove connection", {
            description:
              error.message || "Something went wrong. Please try again.",
          });
        },
      });
    }
  };

  // Check for any errors
  const hasError = connectionsError || pendingError || suggestionsError;

  // Handle loading state for the entire page
  const isLoading =
    (connectionsLoading && pendingLoading && suggestionsLoading) ||
    (!connections.length &&
      !incomingRequests.length &&
      !outgoingRequests.length &&
      !suggestions.length &&
      (connectionsLoading || pendingLoading || suggestionsLoading));

  return (
    <AppLayout>
      <div className="container py-6 sm:py-8 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Connections
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your connections and discover new compatibility matches
            </p>
          </div>
        </div>

        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error loading your connection data. Please try
              refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="w-full sm:w-1/2 lg:w-2/3 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9"
            />
          </div>
          <div className="flex gap-3 sm:gap-4 w-full sm:w-1/2 lg:w-1/3">
            <div className="w-1/2">
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "name" | "compatibility" | "recent")}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compatibility" className="text-xs sm:text-sm">
                    Highest Compatibility
                  </SelectItem>
                  <SelectItem value="name" className="text-xs sm:text-sm">
                    Name (A-Z)
                  </SelectItem>
                  <SelectItem value="recent" className="text-xs sm:text-sm">
                    Most Recent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              <Select
                value={filterThreshold.toString()}
                onValueChange={(value) => setFilterThreshold(parseInt(value))}
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-xs sm:text-sm">
                    Show All
                  </SelectItem>
                  <SelectItem value="60" className="text-xs sm:text-sm">
                    60%+ Compatibility
                  </SelectItem>
                  <SelectItem value="75" className="text-xs sm:text-sm">
                    75%+ Compatibility
                  </SelectItem>
                  <SelectItem value="90" className="text-xs sm:text-sm">
                    90%+ Compatibility
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="connections" value={activeTab} onValueChange={(value) => setActiveTab(value as "incoming" | "outgoing" | "connections" | "suggestions")}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-6 w-auto inline-flex">
              <TabsTrigger value="connections" className="text-xs sm:text-sm">
                <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                Your Connections
                {connections.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px]">
                    {connections.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="text-xs sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Suggested
                {suggestions.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px]">
                    {suggestions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="incoming" className="text-xs sm:text-sm">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Incoming Requests
                {incomingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px]">
                    {incomingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="text-xs sm:text-sm">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Sent Requests
                {outgoingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px]">
                    {outgoingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading connections...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Active Connections Tab */}
              <TabsContent value="connections">
                {filteredConnections.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/30">
                    <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-medium">
                      No connections found
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                      {searchQuery
                        ? "Try adjusting your search criteria."
                        : "You don't have any connections yet. Check out the suggested matches tab to find people to connect with."}
                    </p>
                    {!searchQuery && (
                      <Button
                        className="mt-4"
                        onClick={() => setActiveTab("suggestions")}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Explore Suggested Matches
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredConnections.map((connection) => (
                      <Card key={connection.id} className="relative overflow-hidden">
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute top-2 right-2 h-7 w-7"
                          onClick={() => handleRemoveConnection(connection.id)}
                          title="Remove connection"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-20 w-20 mb-3">
                              {connection.avatar ? (
                                <AvatarImage
                                  src={connection.avatar}
                                  alt={connection.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  {connection.name
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()
                                    .substring(0, 2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <h3 className="text-lg font-medium text-center">
                              {connection.name}
                            </h3>

                            <div className="mt-3 w-full">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Compatibility</span>
                                <span className="font-medium">
                                  {connection.score}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    connection.score >= 90
                                      ? "bg-green-500"
                                      : connection.score >= 75
                                      ? "bg-green-400"
                                      : connection.score >= 60
                                      ? "bg-yellow-400"
                                      : connection.score >= 40
                                      ? "bg-orange-400"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${connection.score}%` }}
                                />
                              </div>
                            </div>

                            <div className="mt-6 w-full">
                              <Button className="w-full text-sm" asChild>
                                <Link href={`/compatibility/${connection.userId}`}>
                                  View Compatibility
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Suggested Matches Tab */}
              <TabsContent value="suggestions">
                {filteredSuggestions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/30">
                    <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-medium">
                      No suggested matches found
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                      {searchQuery || filterThreshold > 0
                        ? "Try adjusting your search or filter criteria."
                        : "Complete more assessments to get personalized suggestions based on compatibility."}
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/assessment">Complete Assessments</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredSuggestions.map((suggestion) => (
                      <Card key={suggestion.userId} className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-20 w-20 mb-3">
                              {suggestion.avatar ? (
                                <AvatarImage
                                  src={suggestion.avatar}
                                  alt={suggestion.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  {suggestion.name
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()
                                    .substring(0, 2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <h3 className="text-lg font-medium text-center">
                              {suggestion.name}
                            </h3>

                            <div className="mt-3 w-full">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Compatibility</span>
                                <span className="font-medium">
                                  {suggestion.score}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    suggestion.score >= 90
                                      ? "bg-green-500"
                                      : suggestion.score >= 75
                                      ? "bg-green-400"
                                      : suggestion.score >= 60
                                      ? "bg-yellow-400"
                                      : suggestion.score >= 40
                                      ? "bg-orange-400"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${suggestion.score}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 w-full mt-6">
                              <Button
                                className="w-1/2"
                                onClick={() => handleSendRequest(suggestion.userId)}
                                disabled={
                                  suggestion.hasPendingRequest ||
                                  sendConnectionRequest.isPending
                                }
                              >
                                {suggestion.hasPendingRequest ? (
                                  <>Request Sent</>
                                ) : (
                                  <>
                                    {sendConnectionRequest.isPending &&
                                    sendConnectionRequest.variables ===
                                      suggestion.userId ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <UserPlus className="h-4 w-4 mr-1" />
                                    )}
                                    Connect
                                  </>
                                )}
                              </Button>
                              <Button variant="outline" className="w-1/2" asChild>
                                <Link href={`/compatibility/${suggestion.userId}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Incoming Requests Tab */}
              <TabsContent value="incoming">
                {filteredIncomingRequests.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/30">
                    <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-medium">
                      No incoming requests
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      You don't have any pending connection requests to respond to.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredIncomingRequests.map((request) => (
                      <Card key={request.id} className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-20 w-20 mb-3">
                              {request.avatar ? (
                                <AvatarImage
                                  src={request.avatar}
                                  alt={request.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  {request.name
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()
                                    .substring(0, 2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <h3 className="text-lg font-medium text-center">
                              {request.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sent request{" "}
                              {request.createdAt
                                ? new Date(request.createdAt).toLocaleDateString()
                                : "recently"}
                            </p>

                            {request.score > 0 && (
                              <div className="mt-3 w-full">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Compatibility</span>
                                  <span className="font-medium">
                                    {request.score}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      request.score >= 90
                                        ? "bg-green-500"
                                        : request.score >= 75
                                        ? "bg-green-400"
                                        : request.score >= 60
                                        ? "bg-yellow-400"
                                        : request.score >= 40
                                        ? "bg-orange-400"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${request.score}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex w-full mt-6 gap-2">
                              <Button
                                className="w-1/2"
                                onClick={() =>
                                  handleRespondToRequest(request.id, "accept")
                                }
                                disabled={respondToConnectionRequest.isPending}
                              >
                                {respondToConnectionRequest.isPending &&
                                respondToConnectionRequest.variables?.connectionId ===
                                  request.id &&
                                respondToConnectionRequest.variables?.action ===
                                  "accept" ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                className="w-1/2"
                                onClick={() =>
                                  handleRespondToRequest(request.id, "decline")
                                }
                                disabled={respondToConnectionRequest.isPending}
                              >
                                {respondToConnectionRequest.isPending &&
                                respondToConnectionRequest.variables?.connectionId ===
                                  request.id &&
                                respondToConnectionRequest.variables?.action ===
                                  "decline" ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-1" />
                                )}
                                Decline
                              </Button>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full mt-2 text-sm"
                              asChild
                              size="sm"
                            >
                              <Link href={`/compatibility/${request.userId}`}>
                                View Compatibility
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Outgoing Requests Tab */}
              <TabsContent value="outgoing">
                {filteredOutgoingRequests.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/30">
                    <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-medium">
                      No outgoing requests
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      You haven't sent any connection requests that are still
                      pending.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("suggestions")}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Connections
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredOutgoingRequests.map((request) => (
                      <Card key={request.id} className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col items-center">
                            <Badge
                              variant="outline"
                              className="absolute top-3 right-3 text-xs"
                            >
                              Pending
                            </Badge>
                            <Avatar className="h-20 w-20 mb-3">
                              {request.avatar ? (
                                <AvatarImage
                                  src={request.avatar}
                                  alt={request.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  {request.name
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()
                                    .substring(0, 2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <h3 className="text-lg font-medium text-center">
                              {request.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sent{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>

                            {request.score > 0 && (
                              <div className="mt-3 w-full">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Compatibility</span>
                                  <span className="font-medium">
                                    {request.score}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      request.score >= 90
                                        ? "bg-green-500"
                                        : request.score >= 75
                                        ? "bg-green-400"
                                        : request.score >= 60
                                        ? "bg-yellow-400"
                                        : request.score >= 40
                                        ? "bg-orange-400"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${request.score}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex w-full mt-6">
                              <Button
                                variant="outline"
                                className="w-full text-sm"
                                onClick={() => handleRemoveConnection(request.id)}
                                disabled={removeConnection.isPending}
                              >
                                {removeConnection.isPending &&
                                removeConnection.variables === request.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4 mr-1" />
                                )}
                                Cancel Request
                              </Button>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full mt-2 text-sm"
                              asChild
                              size="sm"
                            >
                              <Link href={`/compatibility/${request.userId}`}>
                                View Compatibility
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}