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

/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-lines-per-function */
import {
  useEffect,
  useRef,
  useState,
  type FC,
  useMemo,
  useCallback,
} from 'react';

import { nanoid } from 'nanoid';
import { pick } from 'lodash-es';
import { type IText, type Point, type TMat2D } from 'fabric';
import classNames from 'classnames';
import { useDebounce, useLatest, useSize } from 'ahooks';
import { createUseGesture, pinchAction, wheelAction } from '@use-gesture/react';
import { type InputVariable } from '@coze-workflow/base/types';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { ConfigProvider } from '@coze-arch/coze-design';

import { TopBar } from '../topbar';
import { RefTitle } from '../ref-title';
import { MyIconButton } from '../icon-button';
import { Form } from '../form';
import { ContentMenu } from '../content-menu';
import {
  AlignMode,
  Mode,
  type FabricObjectWithCustomProps,
  type FabricSchema,
} from '../../typings';
import s from '../../index.module.less';
import { useFabricEditor } from '../../hooks';
import { GlobalContext } from '../../context';
import { useShortcut } from './use-shortcut';
import {
  MAX_AREA,
  MAX_WIDTH,
  MAX_ZOOM,
  MIN_HEIGHT,
  MIN_WIDTH,
  MIN_ZOOM,
  MAX_HEIGHT,
} from './const';

interface IProps {
  onClose: () => void;
  icon: string;
  title: string;
  schema: FabricSchema;
  readonly?: boolean;
  variables?: InputVariable[];
  onChange: (schema: FabricSchema) => void;
  className?: string;
  /**
   * Unforced, used as the key to save the redo/undo operation stack to memory
   * If it is not passed, the operation stack will not be saved to memory. Performance: close the side pull window and lose the operation stack.
   */
  id?: string;
}

const useGesture = createUseGesture([pinchAction, wheelAction]);

export const FabricEditor: FC<IProps> = props => {
  const {
    onClose,
    icon,
    title,
    schema: _schema,
    onChange: _onChange,
    readonly,
    variables: _variables,
    className,
  } = props;

  const variables = useMemo(() => {
    const _v = _variables?.filter(d => d.type);
    return _v;
  }, [_variables]);

  /**
   * Props.onChange is asynchronous, which makes the state of the schema difficult to manage.
   * Therefore, state is used to manage the schema here, and subsequent consumption of onChange can be handled synchronously
   *
   * Side effect: Schema changes caused by the outside world will not be synchronized to the canvas (this scene is not available for now)
   */
  const [schema, setSchema] = useState<FabricSchema>(_schema);
  const onChange = useCallback(
    (data: FabricSchema) => {
      setSchema(data);
      _onChange(data);
    },
    [_onChange],
  );

  const [id] = useState<string>(props.id ?? nanoid());
  const helpLineLayerId = `help-line-${id}`;

  // Shortcut the listening area
  const shortcutRef = useRef<HTMLDivElement>(null);

  // Popover rendering to dom
  const popRef = useRef(null);
  // Popover render to dom, act on select, dropdown right align
  const popRefAlignRight = useRef<HTMLDivElement>(null);

  // Canvas renderable domain
  const sizeRef = useRef<HTMLDivElement>(null);
  const size = useSize(sizeRef);

  // Popover render to dom
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverSize = useSize(popoverRef);

  // Fabric canvas rendering dom
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // pattern
  const [drawMode, setDrawMode] = useState<Mode | undefined>();
  const latestDrawMode = useLatest(drawMode);

  const [contentMenuPosition, setContentMenuPosition] = useState<
    | {
        left: number;
        top: number;
      }
    | undefined
  >();

  // Monitor whether the mouse is pressed, and display the property settings panel when you let go
  const [isMousePressing, setIsMousePressing] = useState(false);

  const cancelContentMenu = useCallback(() => {
    setContentMenuPosition(undefined);
  }, []);

  const {
    state: {
      activeObjects,
      activeObjectsPopPosition,
      viewport,
      couldAddNewObject,
      disabledUndo,
      disabledRedo,
      redoUndoing,
      disabledPaste,
      isActiveObjectsInBack,
      isActiveObjectsInFront,
      canvasWidth,
      canvasHeight,
      customVariableRefs,
      allObjectsPositionInScreen,
    },
    sdk: {
      setActiveObjectsProps,
      moveToFront,
      moveToBackend,
      moveToFrontOne,
      moveToBackendOne,
      addImage,
      removeActiveObjects,
      moveActiveObject,
      enterFreePencil,
      exitFreePencil,
      enterDragAddElement,
      exitDragAddElement,
      enterAddInlineText,
      exitAddInlineText,
      zoomToPoint,
      setViewport,
      setBackgroundColor,
      discardActiveObject,
      redo,
      undo,
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
    canvasSettings: { backgroundColor },
    canvas,
  } = useFabricEditor({
    id,
    helpLineLayerId,
    onChange,
    ref: canvasRef,
    variables,
    schema,
    maxWidth: size?.width || 0,
    maxHeight: size?.height ? size.height - 2 : 0,
    startInit: !!size?.width,
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    readonly,
    onShapeAdded: () => {
      if (latestDrawMode.current) {
        modeSetting[latestDrawMode.current as Mode]?.exitFn();
        setDrawMode(undefined);
      }
    },
    onClick: cancelContentMenu,
  });

  const modeSetting: Partial<
    Record<
      Mode,
      {
        enterFn: () => void;
        exitFn: () => void;
      }
    >
  > = {
    [Mode.INLINE_TEXT]: {
      enterFn: () => {
        enterAddInlineText();
      },
      exitFn: () => {
        exitAddInlineText();
      },
    },
    [Mode.BLOCK_TEXT]: {
      enterFn: () => {
        enterDragAddElement(Mode.BLOCK_TEXT);
      },
      exitFn: () => {
        exitDragAddElement();
      },
    },
    [Mode.RECT]: {
      enterFn: () => {
        enterDragAddElement(Mode.RECT);
      },
      exitFn: () => {
        exitDragAddElement();
      },
    },
    [Mode.CIRCLE]: {
      enterFn: () => {
        enterDragAddElement(Mode.CIRCLE);
      },
      exitFn: () => {
        exitDragAddElement();
      },
    },
    [Mode.STRAIGHT_LINE]: {
      enterFn: () => {
        enterDragAddElement(Mode.STRAIGHT_LINE);
      },
      exitFn: () => {
        exitDragAddElement();
      },
    },
    [Mode.TRIANGLE]: {
      enterFn: () => {
        enterDragAddElement(Mode.TRIANGLE);
      },
      exitFn: () => {
        exitDragAddElement();
      },
    },
    [Mode.PENCIL]: {
      enterFn: () => {
        enterFreePencil();
      },
      exitFn: () => {
        exitFreePencil();
      },
    },
  };

  // For brush mode, after reaching the upper limit, actively exit the painting mode
  useEffect(() => {
    if (drawMode && !couldAddNewObject) {
      modeSetting[drawMode]?.exitFn();
      setDrawMode(undefined);
    }
  }, [couldAddNewObject, drawMode]);

  const zoomStartPointer = useRef<Point>();
  // mouse wheel zoom
  const onWheelZoom = (e: WheelEvent, isFirst: boolean) => {
    if (!canvas) {
      return;
    }
    const zoomStep = 0.05;
    let zoomLevel = viewport[0];

    const delta = e.deltaY;
    if (isFirst) {
      const pointer = canvas.getViewportPoint(e);
      zoomStartPointer.current = pointer;
    }

    // Determine whether to zoom in or out according to the direction of the roller
    if (delta < 0) {
      zoomLevel += zoomStep;
    } else {
      zoomLevel -= zoomStep;
    }
    zoomToPoint(
      zoomStartPointer.current as Point,
      Number(zoomLevel.toFixed(2)),
    );
  };

  // mouse displacement
  const onWheelTransform = (deltaX: number, deltaY: number) => {
    const vpt: TMat2D = [...viewport];
    vpt[4] -= deltaX;
    vpt[5] -= deltaY;
    setViewport(vpt);
  };

  // Touchpad gesture zoom, shift
  const gestureBind = useGesture(
    {
      onPinch: state => {
        const e = state.event as WheelEvent;
        e.preventDefault();
        onWheelZoom(e, state.first);
        if (state.first) {
          setIsMousePressing(true);
        } else if (state.last) {
          setIsMousePressing(false);
        }
      },
      onWheel: state => {
        const e = state.event;
        e.preventDefault();

        if (!state.pinching) {
          if (state.metaKey) {
            onWheelZoom(e, state.first);
          } else {
            onWheelTransform(e.deltaX, e.deltaY);
          }
        }

        if (state.first) {
          setIsMousePressing(true);
        } else if (state.last) {
          setIsMousePressing(false);
        }
      },
    },
    {
      eventOptions: {
        passive: false,
      },
    },
  );

  // When a user edits text, pressing the delete key should not perform a delete element operation
  const [isTextEditing, setIsTextEditing] = useState(false);
  useEffect(() => {
    let disposers: (() => void)[] = [];
    if (
      activeObjects?.length === 1 &&
      [Mode.BLOCK_TEXT, Mode.INLINE_TEXT].includes(
        (activeObjects[0] as FabricObjectWithCustomProps).customType,
      )
    ) {
      disposers.push(
        (activeObjects[0] as IText).on('editing:entered', () => {
          setIsTextEditing(true);
        }),
      );
      disposers.push(
        (activeObjects[0] as IText).on('editing:exited', () => {
          setIsTextEditing(false);
        }),
      );
    }
    return () => {
      disposers.forEach(dispose => dispose());
      disposers = [];
    };
  }, [activeObjects]);

  useEffect(() => {
    const openMenu = (e: MouseEvent) => {
      e.preventDefault();
      const sizeRect = sizeRef.current?.getBoundingClientRect();
      setContentMenuPosition({
        left: e.clientX - (sizeRect?.left ?? 0),
        top: e.clientY - (sizeRect?.top ?? 0),
      });
    };
    if (sizeRef.current) {
      sizeRef.current.addEventListener('contextmenu', openMenu);
    }
    return () => {
      if (sizeRef.current) {
        sizeRef.current.removeEventListener('contextmenu', openMenu);
      }
    };
  }, [sizeRef]);

  // Click on the outside of the canvas and uncheck it.
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      setContentMenuPosition(undefined);
      discardActiveObject();
    };
    document.addEventListener('click', clickOutside);
    return () => {
      document.removeEventListener('click', clickOutside);
    };
  }, [discardActiveObject]);

  // Registration shortcut
  useShortcut({
    ref: shortcutRef,
    state: {
      isTextEditing,
      disabledPaste,
    },
    sdk: {
      moveActiveObject,
      removeActiveObjects,
      undo,
      redo,
      copy,
      paste,
      group,
      unGroup,
      moveToFront,
      moveToBackend,
      moveToFrontOne,
      moveToBackendOne,
      alignLeft,
      alignRight,
      alignCenter,
      alignTop,
      alignBottom,
      alignMiddle,
      verticalAverage,
      horizontalAverage,
    },
  });

  const isContentMenuShow = !readonly && contentMenuPosition;

  // Whether the selected elements are of the same type (including box selection)
  const isSameActiveObjects =
    Array.from(
      new Set(
        activeObjects?.map(
          obj => (obj as FabricObjectWithCustomProps).customType,
        ),
      ),
    ).length === 1;

  /**
   * Properties menu not displayed & &
   * The right mouse button is not pressed (drag and drop ing) & &
   * isSameActiveObjects &&
   */
  const isFormShow =
    !isContentMenuShow && !isMousePressing && isSameActiveObjects;

  // There are two restrictions on the maximum width and height: 1. Area 2. Fixed maximum
  const { canvasMaxWidth, canvasMaxHeight } = useMemo(
    () => ({
      canvasMaxWidth: Math.min(MAX_AREA / schema.height, MAX_WIDTH),
      canvasMaxHeight: Math.min(MAX_AREA / schema.width, MAX_HEIGHT),
    }),
    [schema.width, schema.height],
  );

  const [focus, setFocus] = useState(false);
  const debouncedFocus = useDebounce(focus, {
    wait: 300,
  });

  useEffect(() => {
    setTimeout(() => {
      shortcutRef.current?.focus();
    }, 300);
  }, []);

  return (
    <div
      tabIndex={0}
      className={`flex flex-col w-full h-full relative ${className} min-w-[900px]`}
      ref={shortcutRef}
      onFocus={() => {
        setFocus(true);
      }}
      onBlur={() => {
        setFocus(false);
      }}
    >
      <GlobalContext.Provider
        value={{
          variables,
          customVariableRefs,
          allObjectsPositionInScreen,
          activeObjects,
          addRefObjectByVariable,
          updateRefByObjectId,
        }}
      >
        <div ref={popRef}></div>
        <div
          className={s['top-bar-pop-align-right']}
          ref={popRefAlignRight}
        ></div>
        <ConfigProvider
          getPopupContainer={() => popRef.current ?? document.body}
        >
          <>
            <div
              className={classNames([
                'flex gap-[8px] items-center',
                'w-full h-[55px]',
                'px-[16px]',
              ])}
            >
              <img className="w-[20px] h-[20px] rounded-[2px]" src={icon}></img>

              <div className="text-xxl font-semibold">{title}</div>

              <div className="flex-1">
                <TopBar
                  redo={redo}
                  undo={undo}
                  disabledRedo={disabledRedo}
                  disabledUndo={disabledUndo}
                  redoUndoing={redoUndoing}
                  popRefAlignRight={popRefAlignRight}
                  readonly={readonly || !canvas}
                  maxLimit={!couldAddNewObject}
                  mode={drawMode}
                  onModeChange={(currentMode, prevMode) => {
                    setDrawMode(currentMode);
                    if (prevMode) {
                      modeSetting[prevMode]?.exitFn();
                    }

                    if (currentMode) {
                      modeSetting[currentMode]?.enterFn();
                    }
                  }}
                  isActiveObjectsInBack={isActiveObjectsInBack}
                  isActiveObjectsInFront={isActiveObjectsInFront}
                  onMoveToTop={e => {
                    (e as MouseEvent).stopPropagation();
                    moveToFront();
                  }}
                  onMoveToBackend={e => {
                    (e as MouseEvent).stopPropagation();
                    moveToBackend();
                  }}
                  onAddImg={url => {
                    addImage(url);
                  }}
                  zoomSettings={{
                    reset: () => {
                      setViewport([1, 0, 0, 1, 0, 0]);
                    },
                    zoom: viewport[0],
                    onChange(value: number): void {
                      if (isNaN(value)) {
                        return;
                      }
                      const vpt: TMat2D = [...viewport];
                      let v = Number(value.toFixed(2));

                      if (v > MAX_ZOOM) {
                        v = MAX_ZOOM;
                      } else if (v < MIN_ZOOM) {
                        v = MIN_ZOOM;
                      }

                      vpt[0] = v;
                      vpt[3] = v;
                      setViewport(vpt);
                    },
                    max: MAX_ZOOM,
                    min: MIN_ZOOM,
                  }}
                  aligns={{
                    [AlignMode.Left]: alignLeft,
                    [AlignMode.Right]: alignRight,
                    [AlignMode.Center]: alignCenter,
                    [AlignMode.Top]: alignTop,
                    [AlignMode.Bottom]: alignBottom,
                    [AlignMode.Middle]: alignMiddle,
                    [AlignMode.VerticalAverage]: verticalAverage,
                    [AlignMode.HorizontalAverage]: horizontalAverage,
                  }}
                  canvasSettings={{
                    width: schema.width,
                    minWidth: MIN_WIDTH,
                    maxWidth: canvasMaxWidth,
                    height: schema.height,
                    minHeight: MIN_HEIGHT,
                    maxHeight: canvasMaxHeight,
                    background: backgroundColor as string,
                    onChange(value: {
                      width?: number | undefined;
                      height?: number | undefined;
                      background?: string | undefined;
                    }): void {
                      if (value.background) {
                        setBackgroundColor(value.background);
                        return;
                      }
                      const _value = pick(value, ['width', 'height']);
                      if (_value.width) {
                        if (_value.width > canvasMaxWidth) {
                          _value.width = canvasMaxWidth;
                        }
                        if (_value.width < MIN_WIDTH) {
                          _value.width = MIN_WIDTH;
                        }
                      }

                      if (_value.height) {
                        if (_value.height > canvasMaxHeight) {
                          _value.height = canvasMaxHeight;
                        }
                        if (_value.height < MIN_HEIGHT) {
                          _value.height = MIN_HEIGHT;
                        }
                      }

                      resetWidthHeight({
                        ..._value,
                      });
                    },
                  }}
                />
              </div>

              <MyIconButton
                onClick={onClose}
                icon={<IconCozCross className="text-[16px]" />}
              />
            </div>

            <div
              className={classNames([
                'flex-1 flex items-center justify-center',
                'p-[16px]',
                'overflow-hidden',
                'coz-bg-primary',
                'border-0 border-t coz-stroke-primary border-solid',
                'scale-100',
              ])}
              ref={popoverRef}
            >
              <div
                onMouseDown={e => {
                  if (e.button === 0) {
                    setIsMousePressing(true);
                  }
                }}
                onMouseUp={e => {
                  if (e.button === 0) {
                    setIsMousePressing(false);
                  }
                }}
                ref={sizeRef}
                tabIndex={0}
                className={classNames([
                  'flex items-center justify-center',
                  'w-full h-full overflow-hidden',
                ])}
              >
                <div
                  {...gestureBind()}
                  className={`border border-solid ${
                    debouncedFocus ? 'coz-stroke-hglt' : 'coz-stroke-primary'
                  } rounded-small overflow-hidden`}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                >
                  {/* Reference tag */}
                  <RefTitle visible={!isMousePressing} />
                  <div className="w-fit h-fit overflow-hidden">
                    <div
                      id={helpLineLayerId}
                      className="relative top-0 left-0 bg-red-500 z-[2] pointer-events-none"
                    ></div>
                    <canvas ref={canvasRef} className="h-[0px]" />
                  </div>
                </div>
              </div>
              {/* right-click menu */}
              {isContentMenuShow ? (
                <ContentMenu
                  limitRect={popoverSize}
                  left={contentMenuPosition.left}
                  top={contentMenuPosition.top}
                  cancelMenu={() => {
                    setContentMenuPosition(undefined);
                  }}
                  hasActiveObject={!!activeObjects?.length}
                  copy={copy}
                  paste={paste}
                  disabledPaste={disabledPaste}
                  moveToFront={moveToFront}
                  moveToBackend={moveToBackend}
                  moveToFrontOne={moveToFrontOne}
                  moveToBackendOne={moveToBackendOne}
                  isActiveObjectsInBack={isActiveObjectsInBack}
                  isActiveObjectsInFront={isActiveObjectsInFront}
                  offsetX={8}
                  offsetY={8}
                />
              ) : (
                <></>
              )}

              {/* properties panel */}
              {isFormShow ? (
                <Form
                  // Text switching, involving font size changes, need to rerender form synchronization state
                  key={
                    (activeObjects as FabricObjectWithCustomProps[])?.[0]
                      ?.customType
                  }
                  schema={schema}
                  activeObjects={activeObjects as FabricObjectWithCustomProps[]}
                  position={activeObjectsPopPosition}
                  onChange={value => {
                    setActiveObjectsProps(value);
                  }}
                  offsetX={((popoverSize?.width ?? 0) - (canvasWidth ?? 0)) / 2}
                  offsetY={
                    ((popoverSize?.height ?? 0) - (canvasHeight ?? 0)) / 2
                  }
                  canvasHeight={canvasHeight}
                  limitRect={popoverSize}
                />
              ) : (
                <></>
              )}
            </div>
          </>
        </ConfigProvider>
      </GlobalContext.Provider>
    </div>
  );
};
