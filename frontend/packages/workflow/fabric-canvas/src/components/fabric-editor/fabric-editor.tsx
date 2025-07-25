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
   * 不强制，用来当做 redo/undo 操作栈保存到内存的 key
   * 不传的话，不会保存操作栈到内存，表现：关闭侧拉窗，丢失操作栈
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
   * props.onChange 是异步，这个异步导致 schema 的状态很难管理。
   * 因此此处用 state 来管理 schema，后续消费 onChange 的地方可以当同步处理
   *
   * 副作用：外界引发的 schema 变化，不会同步到画布（暂时没这个场景）
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

  // 快捷点监听区域
  const shortcutRef = useRef<HTMLDivElement>(null);

  // Popover 渲染至 dom
  const popRef = useRef(null);
  // Popover 渲染至 dom，作用于 select ，dropdown 右对齐
  const popRefAlignRight = useRef<HTMLDivElement>(null);

  // canvas 可渲染区域 dom
  const sizeRef = useRef<HTMLDivElement>(null);
  const size = useSize(sizeRef);

  // popover 渲染至 dom
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverSize = useSize(popoverRef);

  // fabric canvas 渲染 dom
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 模式
  const [drawMode, setDrawMode] = useState<Mode | undefined>();
  const latestDrawMode = useLatest(drawMode);

  const [contentMenuPosition, setContentMenuPosition] = useState<
    | {
        left: number;
        top: number;
      }
    | undefined
  >();

  // 监听鼠标是否处于按下状态，松手时才显示属性设置面板
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

  // 针对画笔模式，达到上限后，主动退出绘画模式
  useEffect(() => {
    if (drawMode && !couldAddNewObject) {
      modeSetting[drawMode]?.exitFn();
      setDrawMode(undefined);
    }
  }, [couldAddNewObject, drawMode]);

  const zoomStartPointer = useRef<Point>();
  // 鼠标滚轮缩放
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

    // 根据滚轮方向确定是放大还是缩小
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

  // 鼠标位移
  const onWheelTransform = (deltaX: number, deltaY: number) => {
    const vpt: TMat2D = [...viewport];
    vpt[4] -= deltaX;
    vpt[5] -= deltaY;
    setViewport(vpt);
  };

  // 触摸板手势缩放、位移
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

  // 当用户编辑文本时，按删除键不应该执行删除元素操作
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

  // 点击画布外侧，取消选中
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

  // 注册快捷键
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

  // 选中元素是否为同一类型（包含框选）
  const isSameActiveObjects =
    Array.from(
      new Set(
        activeObjects?.map(
          obj => (obj as FabricObjectWithCustomProps).customType,
        ),
      ),
    ).length === 1;

  /**
   * 属性菜单没有展示 &&
   * 鼠标右键没有按下（拖拽 ing）&&
   * isSameActiveObjects &&
   */
  const isFormShow =
    !isContentMenuShow && !isMousePressing && isSameActiveObjects;

  // 最大宽高有两层限制 1. 面积 2. 固定最大值
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
                  {/* 引用 tag */}
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
              {/* 右键菜单 */}
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

              {/* 属性面板 */}
              {isFormShow ? (
                <Form
                  // 文本切换时，涉及字号变化，需要 rerender form 同步状态
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
