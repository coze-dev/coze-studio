import React from 'react';

import { Swatch } from './swatch';
import { Semantic } from './semantic';

export interface ColorsItem {
  color: string;
  key?: string;
  text?: string;
  className?: string;
  textClassName?: string;
}

export interface SwatchColors {
  title: string;
  items: ColorsItem[];
}

export interface SwatchSetProps {
  colors: SwatchColors[];
  isSemantic?: boolean;
  theme: 'dark' | 'light';
}

export const Color = ({
  colors,
  theme,
  isSemantic = false,
}: SwatchSetProps) => (
  <div className="flex flex-row flex-wrap items-center justify-center w-full h-full p-2">
    {colors.map(({ title, items }) => (
      <div key={title} className="flex flex-col items-start w-full h-full">
        <h2 className="text-xl font-bold text-foreground-4">{title}</h2>
        <div className="flex flex-row flex-wrap items-center justify-start w-full h-full p-4">
          {items.map((c, index) =>
            isSemantic ? (
              <Semantic
                title={title}
                // @ts-expect-error -- linter-disable-autofix
                text={c.text}
                key={`${c.color}-${index}`}
                className={c.className}
                color={c.color}
                textClassName={c.textClassName}
              />
            ) : (
              <Swatch
                key={`${c.color}-${index}`}
                color={c.color}
                title={`${title}-${c.key}`}
              />
            ),
          )}
        </div>
      </div>
    ))}
  </div>
);
