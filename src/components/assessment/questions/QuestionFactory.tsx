// src/components/assessment/questions/QuestionFactory.tsx
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { LikertScaleQuestion } from './LikertScaleQuestion';
import { OpenEndedQuestion } from './OpenEndedQuestion';

interface QuestionFactoryProps {
  question: {
    id: string;
    text: string;
    type?: string;
    options: string | any[];
  };
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QuestionFactory({ question, value, onChange, disabled = false }: QuestionFactoryProps) {
  // Parse options if they're a string
  const parsedOptions = typeof question.options === 'string'
    ? JSON.parse(question.options)
    : question.options;
  
  // Determine question type
  // This can be extended based on your backend's question type definitions
  const questionType = question.type || detectQuestionType(parsedOptions);
  
  switch (questionType) {
    case 'likert_scale':
      return (
        <LikertScaleQuestion
          question={question}
          options={parsedOptions}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'open_ended':
      return (
        <OpenEndedQuestion
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'multiple_choice':
    default:
      return (
        <MultipleChoiceQuestion
          question={question}
          options={parsedOptions}
          value={value}
          onChange={onChange}
          disabled={disabled}
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