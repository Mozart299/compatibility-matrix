// src/components/assessment/questions/OpenEndedQuestion.tsx (updated)
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/ui/form";

interface OpenEndedQuestionProps {
  question: {
    id: string;
    text: string;
  };
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  showValidation?: boolean;
}

export function OpenEndedQuestion({
  question,
  value,
  onChange,
  disabled = false,
  error = null,
  showValidation = false
}: OpenEndedQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 id={`question-${question.id}`} className="text-base sm:text-lg font-medium">
        {question.text}
      </h3>
      <div className="space-y-2">
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className={`min-h-[120px] ${error && showValidation ? 'border-destructive' : ''}`}
          disabled={disabled}
          aria-labelledby={`question-${question.id}`}
          aria-invalid={error && showValidation ? 'true' : 'false'}
        />
        
        {/* Validation error message */}
        {(showValidation && error) && (
          <FormMessage>{error}</FormMessage>
        )}
      </div>
    </div>
  );
}