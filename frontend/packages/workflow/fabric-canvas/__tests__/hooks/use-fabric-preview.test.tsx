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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { Mode } from '../../src/typings';
import { useSchemaChange } from '../../src/hooks/use-schema-change';
import { useInitCanvas } from '../../src/hooks/use-init-canvas';
import { useFabricPreview } from '../../src/hooks/use-fabric-preview';
import { useCanvasResize } from '../../src/hooks/use-canvas-resize';

// Mock dependencies
vi.mock('../../src/hooks/use-canvas-resize', () => ({
  useCanvasResize: vi.fn(),
}));

vi.mock('../../src/hooks/use-init-canvas', () => ({
  useInitCanvas: vi.fn(),
}));

vi.mock('../../src/hooks/use-schema-change', () => ({
  useSchemaChange: vi.fn(),
}));

describe('useFabricPreview', () => {
  const mockRef = { current: document.createElement('canvas') };
  const mockSchema = {
    width: 800,
    height: 600,
    background: '#ffffff',
    objects: [],
    customVariableRefs: [],
    customType: Mode.RECT,
    customId: 'test-canvas',
  };
  const mockMaxWidth = 1000;
  const mockMaxHeight = 800;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    (useCanvasResize as any).mockReturnValue({
      resize: vi.fn(),
      scale: 1,
    });

    (useInitCanvas as any).mockReturnValue({
      canvas: null,
    });

    (useSchemaChange as any).mockImplementation(() => undefined);
  });

  it('should initialize with correct parameters', () => {
    renderHook(() =>
      useFabricPreview({
        ref: mockRef,
        schema: mockSchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
      }),
    );

    // Verify useCanvasResize was called with correct params
    expect(useCanvasResize).toHaveBeenCalledWith({
      maxWidth: mockMaxWidth,
      maxHeight: mockMaxHeight,
      width: mockSchema.width,
      height: mockSchema.height,
    });

    // Verify useInitCanvas was called with correct params
    expect(useInitCanvas).toHaveBeenCalledWith({
      ref: mockRef.current,
      schema: mockSchema,
      startInit: true,
      readonly: true,
      resize: expect.any(Function),
      scale: 1,
    });
  });

  it('should call resize when canvas is available', () => {
    const mockResize = vi.fn();
    const mockCanvas = {};

    (useCanvasResize as any).mockReturnValue({
      resize: mockResize,
      scale: 1,
    });

    (useInitCanvas as any).mockReturnValue({
      canvas: mockCanvas,
    });

    renderHook(() =>
      useFabricPreview({
        ref: mockRef,
        schema: mockSchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
      }),
    );

    expect(mockResize).toHaveBeenCalledWith(mockCanvas);
  });

  it('should return correct state with cssScale', () => {
    const mockScale = 0.5;
    (useCanvasResize as any).mockReturnValue({
      resize: vi.fn(),
      scale: mockScale,
    });

    const { result } = renderHook(() =>
      useFabricPreview({
        ref: mockRef,
        schema: mockSchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
      }),
    );

    expect(result.current.state).toEqual({
      cssScale: mockScale,
    });
  });

  it('should call useSchemaChange with correct params', () => {
    const mockCanvas = {};
    (useInitCanvas as any).mockReturnValue({
      canvas: mockCanvas,
    });

    renderHook(() =>
      useFabricPreview({
        ref: mockRef,
        schema: mockSchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
      }),
    );

    expect(useSchemaChange).toHaveBeenCalledWith({
      canvas: mockCanvas,
      schema: mockSchema,
      readonly: true,
    });
  });
});
