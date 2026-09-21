import React, { useMemo } from "react";
import katex from "katex";

interface LatexProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const Latex: React.FC<LatexProps> = ({ math, displayMode = false, className = "" }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`inline-latex font-mono select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
