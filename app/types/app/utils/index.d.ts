import type { ErrorSummaryItem } from '~/types/app/common';

interface MinDateBoundary {
  minYear?: number;
  minMonth?: number;
  minDay?: number;
}

interface MaxDateBoundary {
  maxYear?: number;
  maxMonth?: number;
  maxDay?: number;
}

interface DateBoundaryResponse {
  isValid: boolean;
  minDate?: string;
  maxDate?: string;
}

interface FieldError {
  index: enum<number>;
  text: string;
}

interface ValidationError {
  fieldError?: FieldError;
  summaryError?: ErrorSummaryItem;
  optionalPermissionsBroken?: boolean;
}

interface ValidateFormSubmission {
  isValid: boolean;
  fieldErrors?: FieldError[];
  summaryErrors?: ErrorSummaryItem[];
  optionalPermissionsBroken?: boolean;
}

interface ValidateFormSubmissionForUser {
  continueValidation?: boolean;
  fieldErrors?: FieldError[];
  summaryErrors?: ErrorSummaryItem[];
}
