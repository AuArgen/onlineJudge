import type { ReactNode } from 'react';

const URL_PATTERN = /(https?:\/\/[^\s<>"')\]]+)/g;

// Splits plain text on bare URLs and renders them as clickable links, so
// topic text blocks don't need a separate "link" block just to make a
// pasted URL clickable.
export function linkifyText(text: string, keyPrefix = 'lnk'): ReactNode[] {
  return text.split(URL_PATTERN).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={`${keyPrefix}-${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {part}
      </a>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}
