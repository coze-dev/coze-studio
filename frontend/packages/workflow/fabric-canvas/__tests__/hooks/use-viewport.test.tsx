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
import { type Canvas, type Point } from 'fabric';
import { renderHook } from '@testing-library/react';

import { setViewport, zoomToPoint } from '../../src/utils';
import { Mode } from '../../src/typings';
import { useViewport } from '../../src/hooks/use-viewport';

// Mock dependencies
vi.mock('../../src/utils', () => ({
  setViewport: vi.fn(),
  zoomToPoint: vi.fn(),
}));

describe('useViewport', () => {
  const mockSchema = {
    width: 800,
    height: 600,
    background: '#ffffff',
    backgroundColor: '#ffffff',
    objects: [],
    customVariableRefs: [],
    customType: Mode.RECT,
    customId: 'test-canvas',
  };
  const mockFire = vi.fn();
  const mockCanvas = {
    fire: mockFire,
  } as unknown as Canvas;
  const minZoom = 0.3;
  const maxZoom = 3;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default viewport', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    expect(result.current.viewport).toEqual([1, 0, 0, 1, 0, 0]);
  });

  it('should not set viewport when canvas is undefined', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: undefined,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.setViewport([2, 0, 0, 2, 100, 100]);
    expect(setViewport).not.toHaveBeenCalled();
  });

  it('should limit viewport x position to not move beyond left edge', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.setViewport([2, 0, 0, 2, 100, 0]);
    expect(setViewport).toHaveBeenCalledWith({
      canvas: mockCanvas,
      vpt: [2, 0, 0, 2, 0, 0],
    });
  });

  it('should limit viewport x position to not move beyond right edge', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.setViewport([2, 0, 0, 2, -2000, 0]);
    expect(setViewport).toHaveBeenCalledWith({
      canvas: mockCanvas,
      vpt: [2, 0, 0, 2, -800, 0],
    });
  });

  it('should limit viewport y position to not move beyond top edge', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.setViewport([2, 0, 0, 2, 0, 100]);
    expect(setViewport).toHaveBeenCalledWith({
      canvas: mockCanvas,
      vpt: [2, 0, 0, 2, 0, 0],
    });
  });

  it('should limit viewport y position to not move beyond bottom edge', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.setViewport([2, 0, 0, 2, 0, -2000]);
    expect(setViewport).toHaveBeenCalledWith({
      canvas: mockCanvas,
      vpt: [2, 0, 0, 2, 0, -600],
    });
  });

  it('should fire object:moving event after setting viewport', () => {
    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.setViewport([2, 0, 0, 2, 0, 0]);
    expect(mockFire).toHaveBeenCalledWith('object:moving');
  });

  it('should call zoomToPoint with correct parameters', () => {
    const mockPoint: Point = { x: 100, y: 100 };
    const mockZoomLevel = 2;
    const mockVpt = [2, 0, 0, 2, 0, 0];

    (zoomToPoint as jest.Mock).mockReturnValue(mockVpt);

    const { result } = renderHook(() =>
      useViewport({
        canvas: mockCanvas,
        schema: mockSchema,
        minZoom,
        maxZoom,
      }),
    );

    result.current.zoomToPoint(mockPoint, mockZoomLevel);

    expect(zoomToPoint).toHaveBeenCalledWith({
      canvas: mockCanvas,
      point: mockPoint,
      zoomLevel: mockZoomLevel,
      minZoom,
      maxZoom,
    });

    expect(setViewport).toHaveBeenCalledWith({
      canvas: mockCanvas,
      vpt: mockVpt,
    });
  });
});
