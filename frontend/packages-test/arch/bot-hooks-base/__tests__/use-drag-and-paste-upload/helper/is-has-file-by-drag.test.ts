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
