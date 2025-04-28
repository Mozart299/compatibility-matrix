// src/hooks/useAssessments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssessmentService } from "@/lib/api-services";

export function useAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: AssessmentService.getAssessments,
  });
}

export function useAssessmentDimensions() {
  return useQuery({
    queryKey: ["dimensions"],
    queryFn: AssessmentService.getDimensions,
  });
}

export function useAssessment(assessmentId: string | null) {
  return useQuery({
    queryKey: ["assessment", assessmentId],
    queryFn: () => AssessmentService.getAssessment(assessmentId!),
    enabled: !!assessmentId,
  });
}

export function useStartAssessment(p0: { onError: (error: any) => void; }) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dimensionId: string) => {
      return AssessmentService.startAssessment(dimensionId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.setQueryData(["assessment", data.assessment_id], data);
    },
  });
}

export function useSubmitResponse(p0: { onError: (error: any) => void; }) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      assessmentId,
      questionId,
      value,
    }: {
      assessmentId: string;
      questionId: string;
      value: string;
    }) => {
      return AssessmentService.submitResponse(assessmentId, questionId, value);
    },
    onSuccess: (data, variables) => {
      // Update assessment cache
      queryClient.setQueryData(["assessment", variables.assessmentId], data);
      
      // If assessment completed, invalidate assessments list
      if (data.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["assessments"] });
      }
    },
  });
}

export function useAssessmentProgress() {
  return useQuery({
    queryKey: ["assessmentProgress"],
    queryFn: AssessmentService.getProgress,
  });
}