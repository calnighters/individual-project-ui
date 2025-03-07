import type { MutableRefObject } from 'react';
import type { Option } from '@tact/gds-component-library';

type CheckboxesRef = MutableRefObject<HTMLDivElement | null>;

type ErrorSummaryRef = MutableRefObject<HTMLDivElement | null>;

type ErrorSummaryItem = {
  index: number;
  targetName: string;
  text: string;
};

type Label = {
  htmlFor: string;
  text: string;
};

interface NotificationBanner {
  content: string;
  successHeading: string;
}

type PaginationRef = MutableRefObject<HTMLElement | undefined>;

interface PaginationProps {
  onPageChange: (selectedPage: number, from: number, to: number) => void;
  resultsPerPageLimit: number;
  scrollToRef?: PaginationRef;
  selectedPage: number;
  totalResults: number;
}

type SelectRef = MutableRefObject<HTMLSelectElement | null>;

type SelectOption = Pick<Option, 'children', 'value'>;

interface SummaryListItem {
  key: string;
  value: string;
}

type TextInputRef = MutableRefObject<HTMLInputElement | null>;
