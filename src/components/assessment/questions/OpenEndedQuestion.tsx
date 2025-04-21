// src/components/assessment/questions/OpenEndedQuestion.tsx
import { Textarea } from "@/components/ui/textarea";

interface OpenEndedQuestionProps {
  question: {
    id: string;
    text: string;
  };
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OpenEndedQuestion({
  question,
  value,
  onChange,
  disabled = false
}: OpenEndedQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 id={`question-${question.id}`} className="text-base sm:text-lg font-medium">
        {question.text}
      </h3>
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[120px]"
        disabled={disabled}
        aria-labelledby={`question-${question.id}`}
      />
    </div>
  );
}