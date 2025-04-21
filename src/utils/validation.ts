// src/utils/validation.ts
export type QuestionType = 'multiple_choice' | 'likert_scale' | 'open_ended';

export function validateResponse(
  value: string | null,
  questionType: QuestionType,
  options?: any
): { isValid: boolean; errorMessage?: string } {
  // If no value, it's invalid
  if (value === null || value === undefined || value === '') {
    return { 
      isValid: false, 
      errorMessage: 'Please provide a response'
    };
  }

  switch (questionType) {
    case 'multiple_choice':
      // For multiple choice, we just need a value selected
      return { isValid: true };

    case 'likert_scale': 
      // For Likert scale, we need a numeric value within range
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        return { 
          isValid: false, 
          errorMessage: 'Please select a valid option'
        };
      }
      
      // If options are provided, check if value is within range
      if (options) {
        const minValue = Math.min(...options.map((o: any) => Number(o.value)));
        const maxValue = Math.max(...options.map((o: any) => Number(o.value)));
        
        if (numValue < minValue || numValue > maxValue) {
          return { 
            isValid: false, 
            errorMessage: `Please select a value between ${minValue} and ${maxValue}`
          };
        }
      }
      
      return { isValid: true };

    case 'open_ended':
      // For open-ended, ensure the response has a minimum length
      if (value.trim().length < 2) {
        return { 
          isValid: false, 
          errorMessage: 'Please provide a more detailed response'
        };
      }
      
      return { isValid: true };

    default:
      return { isValid: true };
  }
}