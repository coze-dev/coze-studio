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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Canvas } from 'fabric';
import { renderHook, act } from '@testing-library/react';

import { loadFontWithSchema, setElementAfterLoad } from '../../src/utils';
import { Mode } from '../../src/typings';
import { useInitCanvas } from '../../src/hooks/use-init-canvas';

// Mock fabric
vi.mock('fabric', () => ({
  Canvas: vi.fn(),
}));

// Mock utils
vi.mock('../../src/utils', () => ({
  loadFontWithSchema: vi.fn(),
  setElementAfterLoad: vi.fn(),
}));

describe('useInitCanvas', () => {
  const mockRef = document.createElement('canvas');
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
  const mockResize = vi.fn();
  const mockLoadFromJSON = vi.fn();
  const mockRequestRenderAll = vi.fn();
  const mockDispose = vi.fn();
  const mockOn = vi.fn(() => () => {
    // cleanup function
  });
  let mockCanvas: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any)._fabric_canvas = undefined;

    mockCanvas = {
      loadFromJSON: mockLoadFromJSON,
      requestRenderAll: mockRequestRenderAll,
      dispose: mockDispose,
      on: mockOn,
    };

    // Setup Canvas mock
    (Canvas as any).mockImplementation(() => mockCanvas);

    // Mock loadFromJSON to resolve immediately
    mockLoadFromJSON.mockImplementation((json, callback) => {
      callback(null, {});
      return Promise.resolve();
    });
  });

  it('should not initialize canvas when startInit is false', () => {
    act(() => {
      renderHook(() =>
        useInitCanvas({
          startInit: false,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      );
    });

    expect(Canvas).not.toHaveBeenCalled();
  });

  it('should not initialize canvas when ref is null', () => {
    act(() => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: null,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      );
    });

    expect(Canvas).not.toHaveBeenCalled();
  });

  it('should initialize canvas with correct parameters', async () => {
    const scale = 1.5;
    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
          scale,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(Canvas).toHaveBeenCalledWith(mockRef, {
      width: mockSchema.width * scale,
      height: mockSchema.height * scale,
      backgroundColor: mockSchema.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
    });
  });

  it('should call resize after canvas initialization', async () => {
    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockResize).toHaveBeenCalled();
  });

  it('should load schema and fonts after initialization', async () => {
    mockLoadFromJSON.mockImplementation((json, callback) => {
      callback(null, {});
      loadFontWithSchema({ schema: mockSchema, canvas: mockCanvas });
      return Promise.resolve();
    });

    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockLoadFromJSON).toHaveBeenCalledWith(
      JSON.stringify(mockSchema),
      expect.any(Function),
    );
    expect(loadFontWithSchema).toHaveBeenCalledWith({
      schema: mockSchema,
      canvas: mockCanvas,
    });
  });

  it('should set canvas in debug mode when not readonly', async () => {
    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect((window as any)._fabric_canvas).toBe(mockCanvas);
  });

  it('should not set canvas in debug mode when readonly', async () => {
    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: true,
          resize: mockResize,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect((window as any)._fabric_canvas).toBeUndefined();
  });

  it('should bind click handler when provided', async () => {
    const mockOnClick = vi.fn();
    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
          onClick: mockOnClick,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOn).toHaveBeenCalledWith('mouse:down', expect.any(Function));
  });

  it('should dispose canvas on unmount', async () => {
    let unmount: () => void;
    await act(async () => {
      ({ unmount } = renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      ));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      unmount();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDispose).toHaveBeenCalled();
  });

  it('should handle element loading callback', async () => {
    const mockElement = { type: 'rect' };
    mockLoadFromJSON.mockImplementation((json, callback) => {
      callback(null, mockElement);
      mockRequestRenderAll();
      return Promise.resolve();
    });

    await act(async () => {
      renderHook(() =>
        useInitCanvas({
          startInit: true,
          ref: mockRef,
          schema: mockSchema,
          readonly: false,
          resize: mockResize,
        }),
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(setElementAfterLoad).toHaveBeenCalledWith({
      element: mockElement,
      options: { readonly: false },
      canvas: expect.any(Object),
    });
    expect(mockRequestRenderAll).toHaveBeenCalled();
  });
});
