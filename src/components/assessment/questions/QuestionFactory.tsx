// src/components/assessment/questions/QuestionFactory.tsx (updated)
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { LikertScaleQuestion } from './LikertScaleQuestion';
import { OpenEndedQuestion } from './OpenEndedQuestion';
import { useState, useEffect } from 'react';
import { validateResponse } from '@/utils/validation';

interface QuestionFactoryProps {
  question: {
    id: string;
    text: string;
    type?: string;
    options: string | any[];
  };
  value: string | null;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export function QuestionFactory({ 
  question, 
  value, 
  onChange, 
  onValidChange,
  disabled = false,
  showValidation = false
}: QuestionFactoryProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Parse options if they're a string
  const parsedOptions = typeof question.options === 'string'
    ? JSON.parse(question.options)
    : question.options;
  
  // Determine question type
  const questionType = question.type || detectQuestionType(parsedOptions);
  
  // Validate response when value changes or when showValidation is true
  useEffect(() => {
    if (value !== null || showValidation) {
      const { isValid, errorMessage } = validateResponse(
        value, 
        questionType as any, 
        parsedOptions
      );
      
      setError(isValid ? null : errorMessage || 'Invalid response');
      
      if (onValidChange) {
        onValidChange(isValid);
      }
    }
  }, [value, questionType, parsedOptions, showValidation, onValidChange]);
  
  // Common props for all question types
  const commonProps = {
    question,
    value,
    onChange,
    disabled,
    error,
    showValidation
  };
  
  switch (questionType) {
    case 'likert_scale':
      return (
        <LikertScaleQuestion
          {...commonProps}
          options={parsedOptions}
        />
      );
    case 'open_ended':
      return (
        <OpenEndedQuestion
          {...commonProps}
        />
      );
    case 'multiple_choice':
    default:
      return (
        <MultipleChoiceQuestion
          {...commonProps}
          options={parsedOptions}
        />
      );
  }
}

// Helper function to detect question type from options if not explicitly specified
function detectQuestionType(options: any[]): string {
  if (!Array.isArray(options)) {
    return 'open_ended';
  }
  
  // Check if options have numeric values in sequence (likely a Likert scale)
  const hasNumericValues = options.every(opt => 
    !isNaN(Number(opt.value)) && opt.value.toString() === opt.value.toString()
  );
  
  const isSequential = hasNumericValues && options.length > 2 && 
    options.every((opt, i, arr) => 
      i === 0 || Number(opt.value) === Number(arr[i-1].value) + 1
    );
  
  if (hasNumericValues && isSequential) {
    return 'likert_scale';
  }
  
  return 'multiple_choice';
}