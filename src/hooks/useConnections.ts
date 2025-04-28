import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionsService } from "@/lib/api-services";

interface Connection {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  strengths: string[];
  challenges: string[];
  dimensions: { name: string; score: number }[];
  status: string;
  requestedAt?: string;
}

interface SuggestedConnection {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  strengths: string[];
  challenges: string[];
  dimensions: { name: string; score: number }[];
}

// Fetch all connections with optional status filter (e.g., "accepted", "pending")
export function useConnections(status?: string) {
  return useQuery({
    queryKey: ["connections", status],
    queryFn: () => ConnectionsService.getConnections(status),
    select: (data) => data.connections || data,
  });
}

// Fetch suggested connections with optional limit and minScore filters
export function useSuggestedConnections(limit?: number, minScore?: number) {
  return useQuery({
    queryKey: ["suggestedConnections", limit, minScore],
    queryFn: () => ConnectionsService.getSuggestedConnections(limit, minScore),
    select: (data) => data.suggested_connections || data,
  });
}

// Send a connection request
export function useSendConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => ConnectionsService.sendConnectionRequest(userId),
    onSuccess: () => {
      // Invalidate connections and pending requests to reflect the new request
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connections", "pending"] });
    },
    onError: (error) => {
      console.error("Failed to send connection request:", error);
    },
  });
}

// Respond to a connection request (accept or decline)
export function useRespondToConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      connectionId,
      action,
    }: {
      connectionId: string;
      action: "accept" | "decline";
    }) => ConnectionsService.respondToConnectionRequest(connectionId, action),
    onSuccess: (_, variables) => {
      // Invalidate connections and pending requests to reflect the response
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connections", "pending"] });
      if (variables.action === "accept") {
        queryClient.invalidateQueries({ queryKey: ["connections", "accepted"] });
      }
    },
    onError: (error) => {
      console.error(`Failed to respond to connection request:`, error);
    },
  });
}

// Remove a connection
export function useRemoveConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => ConnectionsService.removeConnection(connectionId),
    onSuccess: () => {
      // Invalidate connections to reflect the removal
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connections", "accepted"] });
    },
    onError: (error) => {
      console.error("Failed to remove connection:", error);
    },
  });
}