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

import { useRef, useState } from 'react';

import { useMutationObserver } from 'ahooks';

export const useFileDragging = () => {
  const [fileDragging, setFileDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useMutationObserver(
    mutationsList => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          (mutation.target as HTMLDivElement)?.className?.includes(
            'semi-upload-drag-area',
          )
        ) {
          setFileDragging(
            (mutation.target as HTMLDivElement)?.className?.includes(
              'semi-upload-drag-area-legal',
            ),
          );
        }
      }
    },
    ref,
    { attributes: true, subtree: true, attributeFilter: ['class'] },
  );

  return {
    ref,
    fileDragging,
  };
};
