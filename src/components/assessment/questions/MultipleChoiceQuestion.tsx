// src/components/assessment/questions/MultipleChoiceQuestion.tsx (updated)
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";

interface MultipleChoiceQuestionProps {
  question: {
    id: string;
    text: string;
  };
  options: Array<{
    value: string;
    label: string;
  }>;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  showValidation?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  options,
  value,
  onChange,
  disabled = false,
  error = null,
  showValidation = false
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 id={`question-${question.id}`} className="text-base sm:text-lg font-medium">
        {question.text}
      </h3>
      <div className="space-y-2">
        <RadioGroup
          value={value ?? undefined}
          onValueChange={onChange}
          disabled={disabled}
          aria-labelledby={`question-${question.id}`}
          className="gap-2 sm:gap-3"
        >
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-muted/50"
            >
              <RadioGroupItem
                value={option.value.toString()}
                id={`option-${question.id}-${option.value}`}
                disabled={disabled}
              />
              <Label
                htmlFor={`option-${question.id}-${option.value}`}
                className="cursor-pointer w-full text-xs sm:text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {(showValidation && error) && (
          <FormMessage>{error}</FormMessage>
        )}
      </div>
    </div>
  );
}