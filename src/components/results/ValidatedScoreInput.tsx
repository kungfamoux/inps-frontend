import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { validateScore } from "./ScoreValidation";

interface ValidatedScoreInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  type: "CA1" | "CA2" | "Exam";
  disabled?: boolean;
  className?: string;
}

export default function ValidatedScoreInput({
  value,
  onChange,
  type,
  disabled = false,
  className = "",
}: ValidatedScoreInputProps) {
  const maxScore = type === "Exam" ? 40 : 30;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? null : parseFloat(e.target.value);
    onChange(newValue);
  };

  const validationError = value !== null ? validateScore(value, type) : null;
  const hasError = validationError !== null;
  const maxValue = type === "Exam" ? 40 : 30;

  return (
    <div className="relative">
      <Input
        type="number"
        min="0"
        max={maxValue}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full text-center text-sm h-8 ${
          hasError ? "border-red-500 focus:border-red-500" : ""
        } ${className}`}
        placeholder={`0-${maxValue}`}
      />
      {hasError && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
      )}
      {hasError && (
        <div className="absolute left-0 -bottom-5 text-xs text-red-500 whitespace-nowrap">
          {validationError.message}
        </div>
      )}
    </div>
  );
}