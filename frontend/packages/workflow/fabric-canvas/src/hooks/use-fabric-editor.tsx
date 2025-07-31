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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useMemo } from 'react';

import { type InputVariable } from '@coze-workflow/base/types';

import {
  REF_VARIABLE_ID_PREFIX,
  type FabricClickEvent,
  type FabricObjectWithCustomProps,
  type FabricSchema,
  type VariableRef,
} from '../typings';
import { useViewport } from './use-viewport';
import { useSnapMove } from './use-snap-move';
import { useRedoUndo } from './use-redo-undo';
import { usePosition } from './use-position';
import { useMousePosition } from './use-mouse-position';
import { useInlineTextAdd } from './use-inline-text-add';
import { useInitCanvas } from './use-init-canvas';
import { useImagAdd } from './use-img-add';
import { useGroup } from './use-group';
import { useFreePencil } from './use-free-pencil';
import { useDragAdd } from './use-drag-add';
import { useCopyPaste } from './use-copy-paste';
import { useCommonOperation } from './use-common-operation';
import { useCanvasResize } from './use-canvas-resize';
import { useCanvasChange } from './use-canvas-change';
import { useBackground } from './use-background';
import { useAlign } from './use-align';
import { useActiveObjectChange } from './use-active-object-change';

export const useFabricEditor = ({
  ref,
  schema: _schema,
  onChange,
  maxWidth,
  maxHeight,
  startInit,
  maxZoom = 3,
  minZoom = 0.3,
  readonly = false,
  onShapeAdded,
  variables,
  id,
  helpLineLayerId,
  onClick,
}: {
  id?: string;
  helpLineLayerId: string;
  ref: React.RefObject<HTMLCanvasElement>;
  schema: FabricSchema;
  onChange?: (schema: FabricSchema) => void;
  maxWidth: number;
  maxHeight: number;
  startInit: boolean;
  maxZoom?: number;
  minZoom?: number;
  readonly?: boolean;
  onShapeAdded?: (data: { element: FabricObjectWithCustomProps }) => void;
  variables?: InputVariable[];
  onClick?: (e: FabricClickEvent) => void;
}) => {
  const schema: FabricSchema = useMemo(() => {
    /**
     * Compatible with historical data
     * Delete timing, see apps/fabric-canvas-node-render/utils/replace-ref-value.ts comment
     */
    if (
      !_schema?.customVariableRefs &&
      (_schema?.objects?.filter(d => d.customVariableName)?.length ?? 0) > 0
    ) {
      const refObjects = _schema?.objects?.filter(d => d.customVariableName);
      const newRefs: VariableRef[] =
        refObjects?.map(d => ({
          variableId: d.customId
            .replace(`${REF_VARIABLE_ID_PREFIX}-img-`, '')
            .replace(`${REF_VARIABLE_ID_PREFIX}-text-`, ''),
          objectId: d.customId,
          variableName: d.customVariableName as string,
        })) ?? [];

      return {
        ..._schema,
        customVariableRefs: newRefs,
      };
    }
    return _schema;
  }, [_schema]);

  const objectLength = useMemo(() => schema.objects.length, [schema]);

  /**
   * Maximum number of elements that can be added
   */
  const MAX_OBJECT_LENGTH = 50;
  const couldAddNewObject = useMemo(
    () => objectLength < MAX_OBJECT_LENGTH,
    [objectLength],
  );

  const { resize, scale } = useCanvasResize({
    maxWidth,
    maxHeight,
    width: schema.width,
    height: schema.height,
  });

  // Initialize fabric canvas
  const { canvas, loadFromJSON } = useInitCanvas({
    startInit,
    ref: ref.current,
    schema,
    resize,
    scale,
    readonly,
    onClick,
  });

  const { viewport, setViewport, zoomToPoint } = useViewport({
    canvas,
    minZoom,
    maxZoom,
    schema,
  });

  const { mousePosition } = useMousePosition({ canvas });

  const { group, unGroup } = useGroup({
    canvas,
  });

  const {
    startListen,
    stopListen,
    addRefObjectByVariable,
    updateRefByObjectId,
    customVariableRefs,
  } = useCanvasChange({
    variables,
    canvas,
    schema,
    onChange: json => {
      onChange?.(json);
      pushOperation(json);
    },
  });

  useSnapMove({ canvas, helpLineLayerId, scale });

  const { copy, paste, disabledPaste } = useCopyPaste({
    canvas,
    mousePosition,
    couldAddNewObject,
    customVariableRefs,
    addRefObjectByVariable,
    variables,
  });

  const { pushOperation, undo, redo, disabledRedo, disabledUndo, redoUndoing } =
    useRedoUndo({
      id,
      schema,
      loadFromJSON,
      startListen,
      stopListen,
      onChange,
    });

  const {
    activeObjects,
    activeObjectsPopPosition,
    setActiveObjectsProps,
    isActiveObjectsInBack,
    isActiveObjectsInFront,
  } = useActiveObjectChange({
    canvas,
    scale,
  });

  const {
    alignLeft,
    alignRight,
    alignCenter,
    alignTop,
    alignBottom,
    alignMiddle,
    verticalAverage,
    horizontalAverage,
  } = useAlign({
    canvas,
    selectObjects: activeObjects,
  });

  useEffect(() => {
    if (canvas) {
      resize(canvas);
    }
  }, [resize, canvas]);

  const { backgroundColor, setBackgroundColor } = useBackground({
    canvas,
    schema,
  });

  const {
    moveActiveObject,
    removeActiveObjects,
    moveTo,
    discardActiveObject,
    resetWidthHeight,
  } = useCommonOperation({
    canvas,
  });

  const { addImage } = useImagAdd({
    canvas,
    onShapeAdded,
  });

  const { enterDragAddElement, exitDragAddElement } = useDragAdd({
    canvas,
    onShapeAdded,
  });

  const { enterFreePencil, exitFreePencil } = useFreePencil({
    canvas,
  });

  const { enterAddInlineText, exitAddInlineText } = useInlineTextAdd({
    canvas,
    onShapeAdded,
  });

  const { allObjectsPositionInScreen } = usePosition({
    canvas,
    scale,
    viewport,
  });

  return {
    canvas,
    canvasSettings: {
      width: schema.width,
      height: schema.height,
      backgroundColor,
    },
    state: {
      viewport,
      cssScale: scale,
      activeObjects,
      activeObjectsPopPosition,
      objectLength,
      couldAddNewObject,
      disabledUndo,
      disabledRedo,
      redoUndoing,
      disabledPaste,
      isActiveObjectsInBack,
      isActiveObjectsInFront,
      canvasWidth: canvas?.getElement().getBoundingClientRect().width,
      canvasHeight: canvas?.getElement().getBoundingClientRect().height,
      customVariableRefs,
      allObjectsPositionInScreen,
    },
    sdk: {
      discardActiveObject,
      setActiveObjectsProps,
      setBackgroundColor,
      moveToFront: () => {
        moveTo('front');
      },
      moveToBackend: () => {
        moveTo('backend');
      },
      moveToFrontOne: () => {
        moveTo('front-one');
      },
      moveToBackendOne: () => {
        moveTo('backend-one');
      },
      zoomToPoint,
      setViewport,
      moveActiveObject,
      removeActiveObjects,
      enterDragAddElement,
      exitDragAddElement,
      enterFreePencil,
      exitFreePencil,
      enterAddInlineText,
      exitAddInlineText,
      addImage,
      undo,
      redo,
      copy,
      paste,
      group,
      unGroup,
      alignLeft,
      alignRight,
      alignCenter,
      alignTop,
      alignBottom,
      alignMiddle,
      verticalAverage,
      horizontalAverage,
      resetWidthHeight,
      addRefObjectByVariable,
      updateRefByObjectId,
    },
  };
};
