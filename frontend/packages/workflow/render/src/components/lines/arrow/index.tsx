import React from 'react';

import { LINE_OFFSET } from '../../../constants/lines';

export default function ArrowRenderer({
  id,
  pos,
  strokeWidth,
}: {
  id: string;
  strokeWidth: number;
  pos: {
    x: number;
    y: number;
  };
}) {
  return (
    <path
      d={`M ${pos.x - LINE_OFFSET},${pos.y - LINE_OFFSET} L ${pos.x},${
        pos.y
      } L ${pos.x - LINE_OFFSET},${pos.y + LINE_OFFSET}`}
      strokeLinecap="round"
      stroke={`url(#${id})`}
      fill="none"
      strokeWidth={strokeWidth}
    />
  );
}
