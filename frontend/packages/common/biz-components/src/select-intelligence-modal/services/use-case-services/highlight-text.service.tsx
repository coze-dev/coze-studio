import React from 'react';

export class HighlightTextService {
  highlightText(text: string, keyword: string) {
    if (!keyword) {
      return text;
    }

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={i} className="coz-fg-hglt-yellow">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  }
}

export const highlightService = new HighlightTextService();
