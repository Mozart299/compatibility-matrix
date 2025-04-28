// src/hooks/useConnections.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionsService } from "@/lib/api-services";

// Types for connection data
export interface ConnectionUser {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  compatibility?: {
    overall_score: number;
    dimension_scores: Array<{
      dimension_id: string;
      name: string;
      score: number;
    }>;
    strengths: Array<{
      dimension_id: string;
      name: string;
      score: number;
    }>;
    challenges: Array<{
      dimension_id: string;
      name: string;
      score: number;
    }>;
  };
  status: string;
  direction: "incoming" | "outgoing";
  created_at: string;
  updated_at: string;
}

export interface SuggestedUser {
  user_id: string;
  name: string;
  avatar_url?: string;
  compatibility: {
    overall_score: number;
    dimension_scores: Array<{
      dimension_id: string;
      name: string;
      score: number;
    }>;
    strengths: Array<{
      dimension_id: string;
      name: string;
      score: number;
    }>;
    challenges: Array<{
      dimension_id: string;
      name: string;
      score: number;
    }>;
  };
}

// Fetch connections with optional status filter
export function useConnections(status?: string) {
  return useQuery({
    queryKey: ["connections", status],
    queryFn: async () => {
      const response = await ConnectionsService.getConnections(status);
      return response;
    },
    // Adjust staleTime and refetchInterval for better UX
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes - auto refresh connections periodically
  });
}

// Fetch suggested connections
export function useSuggestedConnections(limit?: number, minScore?: number) {
  return useQuery({
    queryKey: ["suggestedConnections", limit, minScore],
    queryFn: async () => {
      const response = await ConnectionsService.getSuggestedConnections(limit, minScore);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Send a connection request
export function useSendConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => ConnectionsService.sendConnectionRequest(userId),
    onMutate: async (userId) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ["suggestedConnections"] });
      
      // Get the previous suggestions state
      const previousSuggestions = queryClient.getQueryData(["suggestedConnections"]);
      
      // Return context with the previous state
      return { previousSuggestions };
    },
    onSuccess: () => {
      // Invalidate and refetch affected queries
      queryClient.invalidateQueries({ queryKey: ["connections", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedConnections"] });
    },
    onError: (error, _, context) => {
      // Revert to previous state if there's an error
      if (context?.previousSuggestions) {
        queryClient.setQueryData(["suggestedConnections"], context.previousSuggestions);
      }
      console.error("Failed to send connection request:", error);
    },
  });
}

// Respond to a connection request
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
    onMutate: async ({ connectionId, action }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ["connections", "pending"] });
      
      // Get previous pending requests
      const previousPending = queryClient.getQueryData(["connections", "pending"]);
      
      // If accepting, move the connection to accepted connections
      if (action === "accept") {
        // Update connections optimistically
        const pendingData = queryClient.getQueryData<{ connections: ConnectionUser[] }>(["connections", "pending"]);
        const acceptedData = queryClient.getQueryData<{ connections: ConnectionUser[] }>(["connections", "accepted"]) || { connections: [] };
        
        if (pendingData) {
          const connectionToAccept = pendingData.connections.find(c => c.id === connectionId);
          
          if (connectionToAccept) {
            // Optimistically modify its status
            const updatedConnection = {
              ...connectionToAccept,
              status: "accepted",
              updated_at: new Date().toISOString()
            };
            
            // Add to accepted connections
            queryClient.setQueryData(["connections", "accepted"], {
              ...acceptedData,
              connections: [...acceptedData.connections, updatedConnection]
            });
            
            // Remove from pending
            queryClient.setQueryData(["connections", "pending"], {
              connections: pendingData.connections.filter(c => c.id !== connectionId)
            });
          }
        }
      }
      
      return { previousPending };
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch affected queries
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connections", "pending"] });
      if (variables.action === "accept") {
        queryClient.invalidateQueries({ queryKey: ["connections", "accepted"] });
      }
    },
    onError: (error, _, context) => {
      // Revert to previous state if there's an error
      if (context?.previousPending) {
        queryClient.setQueryData(["connections", "pending"], context.previousPending);
      }
      console.error("Failed to respond to connection request:", error);
    },
  });
}

// Remove a connection
export function useRemoveConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => ConnectionsService.removeConnection(connectionId),
    onMutate: async (connectionId) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ["connections", "accepted"] });
      
      // Get previous connections
      const previousConnections = queryClient.getQueryData(["connections", "accepted"]);
      
      // Optimistically remove the connection
      const connections = queryClient.getQueryData<{ connections: ConnectionUser[] }>(["connections", "accepted"]);
      
      if (connections) {
        queryClient.setQueryData(["connections", "accepted"], {
          connections: connections.connections.filter(c => c.id !== connectionId)
        });
      }
      
      return { previousConnections };
    },
    onSuccess: () => {
      // Invalidate and refetch connections
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connections", "accepted"] });
      
      // After some time, also refresh suggestions as the removed connection might reappear
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["suggestedConnections"] });
      }, 1000);
    },
    onError: (error, _, context) => {
      // Revert to previous state if there's an error
      if (context?.previousConnections) {
        queryClient.setQueryData(["connections", "accepted"], context.previousConnections);
      }
      console.error("Failed to remove connection:", error);
    },
  });
}