import { useMemo, useRef } from 'react';

import { useSize } from 'ahooks';

export function useTableScroll(gap: number) {
  const containerRef = useRef<HTMLElement>(null);

  const size = useSize(containerRef);
  const scroll = useMemo(
    () => ({ y: size?.height ? size.height - gap : 0 }),
    [size, gap],
  );

  return {
    containerRef,
    scroll,
  };
}
