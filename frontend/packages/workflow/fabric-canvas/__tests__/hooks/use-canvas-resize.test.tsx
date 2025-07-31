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
import { type Canvas } from 'fabric';
import { renderHook } from '@testing-library/react';

import { useCanvasResize } from '../../src/hooks/use-canvas-resize';

describe('useCanvasResize', () => {
  const mockCanvas = {
    setDimensions: vi.fn(),
  } as unknown as Canvas;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate correct scale', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 1000,
        maxHeight: 800,
        width: 500,
        height: 500,
      }),
    );

    expect(result.current.scale).toBe(1.6);
  });

  it('should calculate scale based on width constraint', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 800,
        maxHeight: 1000,
        width: 1000,
        height: 500,
      }),
    );

    expect(result.current.scale).toBe(0.8);
  });

  it('should calculate scale based on height constraint', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 1000,
        maxHeight: 800,
        width: 500,
        height: 1000,
      }),
    );

    expect(result.current.scale).toBe(0.8);
  });

  it('should not resize canvas when maxWidth is 0', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 0,
        maxHeight: 800,
        width: 500,
        height: 500,
      }),
    );

    result.current.resize(mockCanvas);
    expect(mockCanvas.setDimensions).not.toHaveBeenCalled();
  });

  it('should not resize canvas when maxHeight is 0', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 1000,
        maxHeight: 0,
        width: 500,
        height: 500,
      }),
    );

    result.current.resize(mockCanvas);
    expect(mockCanvas.setDimensions).not.toHaveBeenCalled();
  });

  it('should not resize canvas when canvas is undefined', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 1000,
        maxHeight: 800,
        width: 500,
        height: 500,
      }),
    );

    result.current.resize(undefined);
    expect(mockCanvas.setDimensions).not.toHaveBeenCalled();
  });

  it('should set canvas dimensions correctly', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 1000,
        maxHeight: 800,
        width: 500,
        height: 500,
      }),
    );

    result.current.resize(mockCanvas);

    // Check base dimensions
    expect(mockCanvas.setDimensions).toHaveBeenNthCalledWith(1, {
      width: 500,
      height: 500,
    });

    // Check CSS dimensions
    expect(mockCanvas.setDimensions).toHaveBeenNthCalledWith(
      2,
      {
        width: '800px',
        height: '800px',
      },
      {
        cssOnly: true,
      },
    );
  });

  it('should maintain aspect ratio when resizing', () => {
    const { result } = renderHook(() =>
      useCanvasResize({
        maxWidth: 1000,
        maxHeight: 800,
        width: 1000,
        height: 500,
      }),
    );

    result.current.resize(mockCanvas);

    // Check CSS dimensions maintain aspect ratio
    expect(mockCanvas.setDimensions).toHaveBeenNthCalledWith(
      2,
      {
        width: '1000px',
        height: '500px',
      },
      {
        cssOnly: true,
      },
    );
  });
});
