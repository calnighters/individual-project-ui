import './col-format.css';

interface ColFormatProps {
  children: Element | string;
  wordBreak?: 'all' | 'normal' | 'word';
  minWidth?: '50' | '85' | '100' | '120' | '150';
}

export const ColFormat = ({
  children,
  wordBreak,
  minWidth,
}: ColFormatProps) => {
  const className = `col-format col-format-${wordBreak || 'word'} ${minWidth ? `min-width-${minWidth}` : ''}`;
  return <div className={className}>{children}</div>;
};
