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

import { useState, useEffect } from 'react';

export const useTableHeight = (tableRef: React.RefObject<HTMLDivElement>) => {
  const [tableHeight, setTableHeight] = useState<string>('calc(100vh - 360px)');

  useEffect(() => {
    if (!tableRef.current) {
      return;
    }
    const calculateHeight = () => {
      if (tableRef.current) {
        const topPosition = tableRef.current.getBoundingClientRect().top;
        setTableHeight(`calc(100vh - ${topPosition + 80}px)`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [tableRef.current]);

  return tableHeight;
};
