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

import { Mode, type FabricSchema } from '../../src/typings';
import { useViewport } from '../../src/hooks/use-viewport';
import { useSnapMove } from '../../src/hooks/use-snap-move';
import { useRedoUndo } from '../../src/hooks/use-redo-undo';
import { usePosition } from '../../src/hooks/use-position';
import { useMousePosition } from '../../src/hooks/use-mouse-position';
import { useInlineTextAdd } from '../../src/hooks/use-inline-text-add';
import { useInitCanvas } from '../../src/hooks/use-init-canvas';
import { useImagAdd } from '../../src/hooks/use-img-add';
import { useGroup } from '../../src/hooks/use-group';
import { useFreePencil } from '../../src/hooks/use-free-pencil';
import { useFabricEditor } from '../../src/hooks/use-fabric-editor';
import { useDragAdd } from '../../src/hooks/use-drag-add';
import { useCopyPaste } from '../../src/hooks/use-copy-paste';
import { useCommonOperation } from '../../src/hooks/use-common-operation';
import { useCanvasResize } from '../../src/hooks/use-canvas-resize';
import { useCanvasChange } from '../../src/hooks/use-canvas-change';
import { useBackground } from '../../src/hooks/use-background';
import { useAlign } from '../../src/hooks/use-align';
import { useActiveObjectChange } from '../../src/hooks/use-active-object-change';

// Mock all dependencies
vi.mock('../../src/hooks/use-canvas-resize', () => ({
  useCanvasResize: vi.fn(),
}));

vi.mock('../../src/hooks/use-init-canvas', () => ({
  useInitCanvas: vi.fn(),
}));

vi.mock('../../src/hooks/use-viewport', () => ({
  useViewport: vi.fn(),
}));

vi.mock('../../src/hooks/use-mouse-position', () => ({
  useMousePosition: vi.fn(),
}));

vi.mock('../../src/hooks/use-group', () => ({
  useGroup: vi.fn(),
}));

vi.mock('../../src/hooks/use-canvas-change', () => ({
  useCanvasChange: vi.fn(),
}));

vi.mock('../../src/hooks/use-snap-move', () => ({
  useSnapMove: vi.fn(),
}));

vi.mock('../../src/hooks/use-copy-paste', () => ({
  useCopyPaste: vi.fn(),
}));

vi.mock('../../src/hooks/use-redo-undo', () => ({
  useRedoUndo: vi.fn(),
}));

vi.mock('../../src/hooks/use-active-object-change', () => ({
  useActiveObjectChange: vi.fn(),
}));

vi.mock('../../src/hooks/use-align', () => ({
  useAlign: vi.fn(),
}));

vi.mock('../../src/hooks/use-background', () => ({
  useBackground: vi.fn(),
}));

vi.mock('../../src/hooks/use-common-operation', () => ({
  useCommonOperation: vi.fn(),
}));

vi.mock('../../src/hooks/use-img-add', () => ({
  useImagAdd: vi.fn(),
}));

vi.mock('../../src/hooks/use-drag-add', () => ({
  useDragAdd: vi.fn(),
}));

vi.mock('../../src/hooks/use-free-pencil', () => ({
  useFreePencil: vi.fn(),
}));

vi.mock('../../src/hooks/use-inline-text-add', () => ({
  useInlineTextAdd: vi.fn(),
}));

vi.mock('../../src/hooks/use-position', () => ({
  usePosition: vi.fn(),
}));

describe('useFabricEditor', () => {
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
  const mockHelpLineLayerId = 'help-line-layer';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    (useCanvasResize as any).mockReturnValue({
      resize: vi.fn(),
      scale: 1,
    });

    (useInitCanvas as any).mockReturnValue({
      canvas: null,
      loadFromJSON: vi.fn(),
    });

    (useViewport as any).mockReturnValue({
      viewport: { zoom: 1 },
      setViewport: vi.fn(),
      zoomToPoint: vi.fn(),
    });

    (useMousePosition as any).mockReturnValue({
      mousePosition: { x: 0, y: 0 },
    });

    (useGroup as any).mockReturnValue({
      group: vi.fn(),
      unGroup: vi.fn(),
    });

    (useCanvasChange as any).mockReturnValue({
      startListen: vi.fn(),
      stopListen: vi.fn(),
      addRefObjectByVariable: vi.fn(),
      updateRefByObjectId: vi.fn(),
      customVariableRefs: [],
    });

    (useSnapMove as any).mockImplementation(() => undefined);

    (useCopyPaste as any).mockReturnValue({
      copy: vi.fn(),
      paste: vi.fn(),
      disabledPaste: false,
    });

    (useRedoUndo as any).mockReturnValue({
      pushOperation: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      disabledRedo: false,
      disabledUndo: false,
      redoUndoing: false,
    });

    (useActiveObjectChange as any).mockReturnValue({
      activeObjects: [],
      activeObjectsPopPosition: null,
      setActiveObjectsProps: vi.fn(),
      isActiveObjectsInBack: false,
      isActiveObjectsInFront: false,
    });

    (useAlign as any).mockReturnValue({
      alignLeft: vi.fn(),
      alignRight: vi.fn(),
      alignCenter: vi.fn(),
      alignTop: vi.fn(),
      alignBottom: vi.fn(),
      alignMiddle: vi.fn(),
      verticalAverage: vi.fn(),
      horizontalAverage: vi.fn(),
    });

    (useBackground as any).mockReturnValue({
      backgroundColor: '#ffffff',
      setBackgroundColor: vi.fn(),
    });

    (useCommonOperation as any).mockReturnValue({
      moveActiveObject: vi.fn(),
      removeActiveObjects: vi.fn(),
      moveTo: vi.fn(),
      discardActiveObject: vi.fn(),
      resetWidthHeight: vi.fn(),
    });

    (useImagAdd as any).mockReturnValue({
      addImage: vi.fn(),
    });

    (useDragAdd as any).mockReturnValue({
      enterDragAddElement: vi.fn(),
      exitDragAddElement: vi.fn(),
    });

    (useFreePencil as any).mockReturnValue({
      enterFreePencil: vi.fn(),
      exitFreePencil: vi.fn(),
    });

    (useInlineTextAdd as any).mockReturnValue({
      enterAddInlineText: vi.fn(),
      exitAddInlineText: vi.fn(),
    });

    (usePosition as any).mockReturnValue({
      allObjectsPositionInScreen: [],
    });
  });

  it('should initialize with correct parameters', () => {
    renderHook(() =>
      useFabricEditor({
        ref: mockRef,
        schema: mockSchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
        helpLineLayerId: mockHelpLineLayerId,
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
      readonly: false,
      resize: expect.any(Function),
      scale: 1,
      onClick: undefined,
    });
  });

  it('should handle schema with legacy customVariableName', () => {
    const legacySchema = {
      ...mockSchema,
      objects: [
        {
          customId: 'variable-img-123',
          customType: Mode.IMAGE,
          customVariableName: 'testVar',
        },
        {
          customId: 'variable-text-456',
          customType: Mode.INLINE_TEXT,
          customVariableName: 'testVar2',
        },
      ],
    };

    renderHook(() =>
      useFabricEditor({
        ref: mockRef,
        schema: legacySchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
        helpLineLayerId: mockHelpLineLayerId,
      }),
    );

    // Verify useInitCanvas was called with correct params
    expect(useInitCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: mockRef.current,
        startInit: true,
        readonly: false,
        scale: 1,
        onClick: undefined,
        schema: expect.objectContaining({
          objects: legacySchema.objects,
        }),
      }),
    );
  });

  it('should enforce object limit', () => {
    const schemaWithObjects = {
      ...mockSchema,
      objects: Array(50).fill({
        customId: 'test',
        customType: Mode.RECT,
      }),
    };

    const { result } = renderHook(() =>
      useFabricEditor({
        ref: mockRef,
        schema: schemaWithObjects,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
        helpLineLayerId: mockHelpLineLayerId,
      }),
    );

    expect(result.current.state.couldAddNewObject).toBe(false);
  });

  it('should return all required functions and states', () => {
    const { result } = renderHook(() =>
      useFabricEditor({
        ref: mockRef,
        schema: mockSchema,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
        helpLineLayerId: mockHelpLineLayerId,
      }),
    );

    // Verify the returned object structure
    expect(result.current).toEqual({
      canvas: null,
      canvasSettings: {
        width: mockSchema.width,
        height: mockSchema.height,
        backgroundColor: '#ffffff',
      },
      sdk: expect.any(Object),
      state: expect.objectContaining({
        viewport: { zoom: 1 },
        cssScale: 1,
        activeObjects: [],
        activeObjectsPopPosition: null,
        couldAddNewObject: true,
        disabledPaste: false,
        disabledRedo: false,
        disabledUndo: false,
        redoUndoing: false,
        isActiveObjectsInBack: false,
        isActiveObjectsInFront: false,
        allObjectsPositionInScreen: [],
        canvasWidth: undefined,
        canvasHeight: undefined,
        customVariableRefs: [],
        objectLength: 0,
      }),
    });
  });

  it('should call onChange when canvas changes', () => {
    const onChange = vi.fn();
    const mockJson = { ...mockSchema };
    let changeCallback: ((json: FabricSchema) => void) | undefined;

    (useCanvasChange as any).mockImplementation(
      ({
        onChange: onChangeCallback,
      }: {
        onChange: (json: FabricSchema) => void;
      }) => {
        changeCallback = onChangeCallback;
        return {
          startListen: vi.fn(),
          stopListen: vi.fn(),
          addRefObjectByVariable: vi.fn(),
          updateRefByObjectId: vi.fn(),
          customVariableRefs: [],
        };
      },
    );

    renderHook(() =>
      useFabricEditor({
        ref: mockRef,
        schema: mockSchema,
        onChange,
        maxWidth: mockMaxWidth,
        maxHeight: mockMaxHeight,
        startInit: true,
        helpLineLayerId: mockHelpLineLayerId,
      }),
    );

    if (changeCallback) {
      changeCallback(mockJson);
      expect(onChange).toHaveBeenCalledWith(mockJson);
    }
  });
});
