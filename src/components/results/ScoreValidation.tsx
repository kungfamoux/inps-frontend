import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface ScoreValidationProps {
  errors: ValidationError[];
  warnings: string[];
}

export default function ScoreValidation({
  errors,
  warnings,
}: ScoreValidationProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">
              Please fix the following errors:
            </div>
            <ul className="list-disc list-inside text-sm">
              {errors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{error.field}:</span>{' '}
                  {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-1">Warnings:</div>
            <ul className="list-disc list-inside text-sm">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function validateScore(
  score: number,
  type: 'CA1' | 'CA2' | 'Exam',
): ValidationError | null {
  const maxScore = type === 'Exam' ? 40 : 30;

  if (score < 0) {
    return {
      field: type,
      message: 'Score cannot be negative',
    };
  }

  if (score > maxScore) {
    return {
      field: type,
      message: `Score cannot exceed ${maxScore}`,
    };
  }

  return null;
}

export function validateScoreInput(
  value: string,
  type: 'CA1' | 'CA2' | 'Exam',
): { isValid: boolean; error?: string } {
  if (value === '') {
    return { isValid: true }; // Empty is valid (null score)
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: 'Must be a number' };
  }

  if (numValue < 0) {
    return { isValid: false, error: 'Cannot be negative' };
  }

  const maxScore = type === 'Exam' ? 40 : 30;
  if (numValue > maxScore) {
    return { isValid: false, error: `Max is ${maxScore}` };
  }

  return { isValid: true };
}

export function validateScores(
  ca1: number | null,
  ca2: number | null,
  exam: number | null,
): { errors: ValidationError[]; warnings: string[] } {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (ca1 !== null) {
    const ca1Error = validateScore(ca1, 'CA1');
    if (ca1Error) errors.push(ca1Error);
  }

  if (ca2 !== null) {
    const ca2Error = validateScore(ca2, 'CA2');
    if (ca2Error) errors.push(ca2Error);
  }

  if (exam !== null) {
    const examError = validateScore(exam, 'Exam');
    if (examError) errors.push(examError);
  }

  // Add warnings for incomplete entries
  if (
    (ca1 !== null || ca2 !== null || exam !== null) &&
    (ca1 === null || ca2 === null || exam === null)
  ) {
    warnings.push('Some scores are missing for this entry');
  }

  return { errors, warnings };
}
