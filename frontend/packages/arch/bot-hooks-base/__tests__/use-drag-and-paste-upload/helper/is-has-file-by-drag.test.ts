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

import { describe, it, expect } from 'vitest';

import { isHasFileByDrag } from '../../../src/use-drag-and-paste-upload/helper/is-has-file-by-drag';

describe('isHasFileByDrag', () => {
  it('should return true when Files type is present', () => {
    const dragEvent = {
      dataTransfer: {
        types: ['Files', 'text/plain'],
      },
    } as unknown as DragEvent;

    expect(isHasFileByDrag(dragEvent)).toBe(true);
  });

  it('should return false when Files type is not present', () => {
    const dragEvent = {
      dataTransfer: {
        types: ['text/plain', 'text/html'],
      },
    } as unknown as DragEvent;

    expect(isHasFileByDrag(dragEvent)).toBe(false);
  });

  it('should return false when dataTransfer is null', () => {
    const dragEvent = {
      dataTransfer: null,
    } as unknown as DragEvent;

    expect(isHasFileByDrag(dragEvent)).toBe(false);
  });

  it('should return false when types is undefined', () => {
    const dragEvent = {
      dataTransfer: {
        types: [],
      },
    } as unknown as DragEvent;

    expect(isHasFileByDrag(dragEvent)).toBe(false);
  });
});
