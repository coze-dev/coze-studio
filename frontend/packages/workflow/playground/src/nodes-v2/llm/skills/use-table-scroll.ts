/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
