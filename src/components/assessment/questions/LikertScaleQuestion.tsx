// src/components/assessment/questions/LikertScaleQuestion.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LikertScaleQuestionProps {
  question: {
    id: string;
    text: string;
  };
  options: Array<{
    value: string | number;
    label: string;
  }>;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function LikertScaleQuestion({
  question,
  options,
  value,
  onChange,
  disabled = false
}: LikertScaleQuestionProps) {
  return (
    <div className="space-y-4">
      <h3 id={`question-${question.id}`} className="text-base sm:text-lg font-medium">
        {question.text}
      </h3>
      
      <div className="pt-2">
        <RadioGroup
          value={value ?? undefined}
          onValueChange={onChange}
          disabled={disabled}
          aria-labelledby={`question-${question.id}`}
          className="flex items-center justify-between space-x-1"
        >
          {options.map((option) => (
            <div key={option.value} className="flex flex-col items-center space-y-2">
              <RadioGroupItem
                value={option.value.toString()}
                id={`option-${question.id}-${option.value}`}
                className="peer"
                disabled={disabled}
              />
              <Label
                htmlFor={`option-${question.id}-${option.value}`}
                className="text-xs text-center cursor-pointer peer-data-[state=checked]:font-medium"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {/* Scale labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{options[0]?.label}</span>
          <span>{options[options.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
}