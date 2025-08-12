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

import { useCallback, useRef, useState, type FC, type RefObject } from 'react';

import classNames from 'classnames';
import { useKeyPress } from 'ahooks';
import { SizeSelect, Text } from '@coze-workflow/components';
import { ViewVariableType } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozAlignBottom,
  IconCozAlignCenterHorizontal,
  IconCozAlignCenterVertical,
  IconCozAlignLeft,
  IconCozAlignRight,
  IconCozAlignTop,
  IconCozArrowBack,
  IconCozArrowForward,
  IconCozAutoView,
  IconCozDistributeHorizontal,
  IconCozDistributeVertical,
  IconCozEllipse,
  IconCozEmpty,
  IconCozFixedSize,
  IconCozImage,
  IconCozLine,
  IconCozMinus,
  IconCozMoveToBottomFill,
  IconCozMoveToTopFill,
  IconCozParagraph,
  IconCozPencil,
  IconCozPlus,
  IconCozRectangle,
  IconCozRectangleSetting,
  IconCozString,
  IconCozTriangle,
  IconCozVariables,
  type OriginIconProps,
} from '@coze-arch/coze-design/icons';
import {
  ConfigProvider,
  EmptyState,
  InputNumber,
  Menu,
  Select,
  Tag,
  Tooltip,
} from '@coze-arch/coze-design';

import { ColorPicker } from '../setters/color-picker';
import { MyIconButton } from '../icon-button';
import { AlignMode, Mode } from '../../typings';
import styles from '../../index.module.less';
import { useGlobalContext } from '../../context';
import { ImageUpload } from './image-upload';
import { Align } from './align';

interface IProps {
  popRefAlignRight: RefObject<HTMLDivElement> | null;
  readonly?: boolean;
  mode?: Mode;
  maxLimit?: boolean;
  onModeChange: (currentMode?: Mode, prevMode?: Mode) => void;
  onMoveToTop: (e: unknown) => void;
  onMoveToBackend: (e: unknown) => void;
  isActiveObjectsInBack?: boolean;
  isActiveObjectsInFront?: boolean;
  onAddImg: (url: string) => void;
  zoomSettings: {
    zoom: number;
    onChange: (value: number) => void;
    reset: () => void;
    max: number;
    min: number;
  };
  redo: () => void;
  undo: () => void;
  disabledUndo: boolean;
  disabledRedo: boolean;
  redoUndoing: boolean;
  canvasSettings: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    width: number;
    height: number;
    background: string;
    onChange: (value: {
      width?: number;
      height?: number;
      type?: string;
      background?: string;
    }) => void;
  };
  aligns: Record<AlignMode, () => void>;
}

type Icon = React.ForwardRefExoticComponent<
  Omit<OriginIconProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

const SplitLine = () => (
  <div className="h-[24px] w-[1px] coz-mg-primary-pressed"></div>
);

const textIcons: Partial<Record<Mode, { icon: Icon; text: string }>> = {
  [Mode.INLINE_TEXT]: {
    icon: IconCozParagraph,
    text: I18n.t('imageflow_canvas_text1'),
  },
  [Mode.BLOCK_TEXT]: {
    icon: IconCozFixedSize,
    text: I18n.t('imageflow_canvas_text2'),
  },
};

const shapeIcons: Partial<Record<Mode, { icon: Icon; text: string }>> = {
  [Mode.RECT]: {
    icon: IconCozRectangle,
    text: I18n.t('imageflow_canvas_rect'),
  },
  [Mode.CIRCLE]: {
    icon: IconCozEllipse,
    text: I18n.t('imageflow_canvas_circle'),
  },
  [Mode.TRIANGLE]: {
    icon: IconCozTriangle,
    text: I18n.t('imageflow_canvas_trian'),
  },
  [Mode.STRAIGHT_LINE]: {
    icon: IconCozLine,
    text: I18n.t('imageflow_canvas_line'),
  },
};

const alignIcons: Record<AlignMode, Icon> = {
  [AlignMode.Bottom]: IconCozAlignBottom,
  [AlignMode.Center]: IconCozAlignCenterHorizontal,
  [AlignMode.Middle]: IconCozAlignCenterVertical,
  [AlignMode.Left]: IconCozAlignLeft,
  [AlignMode.Right]: IconCozAlignRight,
  [AlignMode.Top]: IconCozAlignTop,
  [AlignMode.HorizontalAverage]: IconCozDistributeHorizontal,
  [AlignMode.VerticalAverage]: IconCozDistributeVertical,
};

const addTextPrefix = I18n.t('add');
const commonTooltipProps = {
  mouseEnterDelay: 300,
  mouseLeaveDelay: 300,
  getPopupContainer: () => document.body,
};

export const TopBar: FC<IProps> = props => {
  const {
    popRefAlignRight,
    readonly,
    maxLimit,
    mode,
    onModeChange: _onModeChange,
    onMoveToTop,
    onMoveToBackend,
    onAddImg,
    zoomSettings,
    canvasSettings,
    redo,
    undo,
    disabledUndo,
    disabledRedo,
    redoUndoing,
    isActiveObjectsInBack,
    isActiveObjectsInFront,
    aligns,
  } = props;

  // Click on the selected one to unselect it.
  const onModeChange = useCallback(
    (m: Mode | undefined) => {
      if (m === mode) {
        _onModeChange(undefined, mode);
      } else {
        _onModeChange(m, mode);
      }
    },
    [_onModeChange, mode],
  );
  const ref = useRef<HTMLDivElement>(null);
  const [textType, setTextType] = useState<Mode>(Mode.INLINE_TEXT);
  const TextIcon = textIcons[textType]?.icon as Icon;

  const [shapeType, setShapeType] = useState<Mode>(Mode.RECT);
  const ShapeIcon = shapeIcons[shapeType]?.icon as Icon;

  const [alignType, setAlignType] = useState<AlignMode>(AlignMode.Left);
  const AlignIcon = alignIcons[alignType];

  useKeyPress(
    'esc',
    () => {
      onModeChange(undefined);
    },
    {
      events: ['keyup'],
    },
  );

  const { variables, addRefObjectByVariable, customVariableRefs } =
    useGlobalContext();
  return (
    <div
      className={classNames([
        styles['top-bar'],
        'flex justify-center items-center gap-[12px]',
      ])}
    >
      {/* reference variable */}
      <Tooltip
        key="ref-variable"
        content={I18n.t('workflow_detail_condition_reference')}
        {...commonTooltipProps}
      >
        <div>
          <Menu
            trigger="click"
            position="bottomLeft"
            className="max-h-[300px] overflow-y-auto"
            render={
              <Menu.SubMenu mode="menu">
                {(variables ?? []).length > 0 ? (
                  <>
                    <div className="p-[8px] pt-[4px] coz-fg-secondary text-[12px]">
                      {I18n.t('imageflow_canvas_var_add', {}, '添加变量')}
                    </div>
                    {variables?.map(v => {
                      const counts = customVariableRefs?.filter(
                        d => d.variableId === v.id,
                      ).length;

                      return (
                        <Menu.Item
                          itemKey={v.name}
                          key={v.name}
                          disabled={!v.type}
                          onClick={(_, e) => {
                            e.stopPropagation();
                            addRefObjectByVariable?.(v);
                          }}
                        >
                          <div className="flex flex-row gap-[4px] items-center w-[220px] h-[32px]">
                            <div className="flex flex-row gap-[4px] items-center flex-1 overflow-hidden w-full">
                              {v.type ? (
                                <>
                                  {v.type === ViewVariableType.String ? (
                                    <IconCozString className="coz-fg-dim" />
                                  ) : (
                                    <IconCozImage className="coz-fg-dim" />
                                  )}
                                </>
                              ) : (
                                <></>
                              )}
                              <div className="flex-1 overflow-hidden flex flex-row gap-[4px] items-center">
                                <Text text={v.name} />
                              </div>
                            </div>
                            {counts && counts > 0 ? (
                              <Tag size="mini" color="primary">
                                {I18n.t(
                                  'imageflow_canvas_var_reference',
                                  {
                                    n: counts,
                                  },
                                  `引用 ${counts} 次`,
                                )}
                              </Tag>
                            ) : null}
                          </div>
                        </Menu.Item>
                      );
                    })}
                  </>
                ) : (
                  <EmptyState
                    className="py-[16px] w-[200px]"
                    size="default"
                    icon={<IconCozEmpty />}
                    darkModeIcon={<IconCozEmpty />}
                    title={I18n.t('imageflow_canvas_var_no', {}, '暂无变量')}
                  />
                )}
              </Menu.SubMenu>
            }
          >
            <MyIconButton icon={<IconCozVariables className="text-[16px]" />} />
          </Menu>
        </div>
      </Tooltip>
      <SplitLine />

      {/* canvas base settings */}
      <Tooltip
        key="canvas-setting"
        position="bottom"
        trigger="click"
        getPopupContainer={() => document.body}
        className="!max-w-[600px]"
        content={
          <>
            <div ref={ref}></div>
            <div className="flex flex-col gap-[12px] px-[4px] py-[8px] w-[410px] rounded-[12px] relative">
              <ConfigProvider
                getPopupContainer={() => ref.current ?? document.body}
              >
                <div className="text-[16px] font-semibold">
                  {I18n.t('imageflow_canvas_setting')}
                </div>
                <div>{I18n.t('imageflow_canvas_frame')}</div>
                <SizeSelect
                  selectClassName="w-[120px]"
                  readonly={readonly}
                  value={{
                    width: canvasSettings.width,
                    height: canvasSettings.height,
                  }}
                  minHeight={canvasSettings.minHeight}
                  minWidth={canvasSettings.minWidth}
                  maxHeight={canvasSettings.maxHeight}
                  maxWidth={canvasSettings.maxWidth}
                  onChange={v => {
                    canvasSettings.onChange(v);
                  }}
                  options={[
                    {
                      label: '16:9',
                      value: {
                        width: 1920,
                        height: 1080,
                      },
                    },
                    {
                      label: '9:16',
                      value: {
                        width: 1080,
                        height: 1920,
                      },
                    },
                    {
                      label: '1:1',
                      value: {
                        width: 1024,
                        height: 1024,
                      },
                    },
                    {
                      label: I18n.t('imageflow_canvas_a41'),
                      value: {
                        width: 1485,
                        height: 1050,
                      },
                    },
                    {
                      label: I18n.t('imageflow_canvas_a42'),
                      value: {
                        width: 1050,
                        height: 1485,
                      },
                    },
                  ]}
                />
                <div>{I18n.t('imageflow_canvas_color')}</div>
                <ColorPicker
                  readonly={readonly}
                  value={canvasSettings.background}
                  onChange={color => {
                    canvasSettings.onChange({
                      background: color as string,
                    });
                  }}
                />
              </ConfigProvider>
            </div>
          </>
        }
      >
        <MyIconButton
          icon={<IconCozRectangleSetting className="text-[16px]" />}
        />
      </Tooltip>

      {/* Reset view */}
      <Tooltip
        key="reset-view"
        content={I18n.t('imageflow_canvas_restart')}
        {...commonTooltipProps}
      >
        {/* zoom */}
        <MyIconButton
          onClick={() => {
            zoomSettings.reset();
          }}
          icon={<IconCozAutoView className="text-[16px]" />}
        />
      </Tooltip>

      {/* zoom + - */}
      <MyIconButton
        disabled={readonly}
        onClick={() => {
          zoomSettings.onChange(
            Math.max(zoomSettings.zoom - 0.1, zoomSettings.min),
          );
        }}
        icon={<IconCozMinus className="text-[16px]" />}
      />
      <InputNumber
        disabled={readonly}
        className="w-[60px]"
        suffix="%"
        min={zoomSettings.min * 100}
        max={zoomSettings.max * 100}
        hideButtons
        precision={0}
        onNumberChange={v => {
          zoomSettings.onChange((v as number) / 100);
        }}
        value={zoomSettings.zoom * 100}
      />
      <MyIconButton
        disabled={readonly}
        onClick={() => {
          zoomSettings.onChange(
            Math.min(zoomSettings.zoom + 0.1, zoomSettings.max),
          );
        }}
        icon={<IconCozPlus className="text-[16px]" />}
      />

      <SplitLine />

      {/* undo redo */}
      <Tooltip
        key="undo"
        content={I18n.t('card_builder_redoUndo_undo')}
        {...commonTooltipProps}
      >
        <MyIconButton
          loading={redoUndoing}
          disabled={readonly || disabledUndo}
          onClick={() => {
            undo();
          }}
          icon={<IconCozArrowBack className="text-[16px]" />}
        />
      </Tooltip>

      <Tooltip
        key="redo"
        content={I18n.t('card_builder_redoUndo_redo')}
        {...commonTooltipProps}
      >
        <MyIconButton
          loading={redoUndoing}
          disabled={readonly || disabledRedo}
          onClick={() => {
            redo();
          }}
          icon={<IconCozArrowForward className="text-[16px]" />}
        />
      </Tooltip>
      <SplitLine />

      {/* Bottom, top */}
      <Tooltip
        key="move-to-bottom"
        content={I18n.t('card_builder_move_to_bottom')}
        {...commonTooltipProps}
      >
        <MyIconButton
          disabled={readonly || isActiveObjectsInBack}
          onClick={onMoveToBackend}
          icon={<IconCozMoveToBottomFill className="text-[16px]" />}
        />
      </Tooltip>
      <Tooltip
        key="move-to-top"
        content={I18n.t('card_builder_move_to_top')}
        {...commonTooltipProps}
      >
        <MyIconButton
          disabled={readonly || isActiveObjectsInFront}
          onClick={onMoveToTop}
          icon={<IconCozMoveToTopFill className="text-[16px]" />}
        />
      </Tooltip>
      {/* align */}
      <div className="flex">
        <MyIconButton
          disabled={readonly}
          onClick={e => {
            // Prohibit bubbling to prevent the selected state of canvas from being cleared when clicking align
            e.stopPropagation();
            aligns[alignType]();
          }}
          icon={<AlignIcon className="text-[16px]" />}
        />

        <Align
          readonly={readonly}
          onChange={alignMode => {
            setAlignType(alignMode);
            aligns[alignMode]();
          }}
          popRefAlignRight={popRefAlignRight}
        />
      </div>

      {/* Text */}
      <div className="flex">
        <Tooltip
          key="text"
          content={
            textType === Mode.INLINE_TEXT
              ? `${addTextPrefix}${I18n.t('imageflow_canvas_text1')}`
              : `${addTextPrefix}${I18n.t('imageflow_canvas_text2')}`
          }
          {...commonTooltipProps}
        >
          <MyIconButton
            disabled={readonly || maxLimit}
            onClick={() => {
              onModeChange(textType);
            }}
            className={classNames({
              '!coz-mg-secondary-pressed':
                mode && [Mode.INLINE_TEXT, Mode.BLOCK_TEXT].includes(mode),
            })}
            icon={<TextIcon className="text-[16px]" />}
          />
        </Tooltip>
        <Select
          disabled={readonly || maxLimit}
          className="hide-selected-label hide-border"
          // showTick={false}
          value={textType}
          size="small"
          getPopupContainer={() => popRefAlignRight?.current ?? document.body}
          optionList={Object.entries(textIcons).map(([key, value]) => {
            const Icon = value.icon;
            const { text } = value;
            return {
              value: key,
              label: (
                <div className="px-[8px] flex gap-[8px] items-center">
                  <Icon className="text-[16px]" />
                  <span>{text}</span>
                </div>
              ),
            };
          })}
          onSelect={v => {
            setTextType(v as Mode);
            onModeChange(v as Mode);
          }}
        />
      </div>
      {/* picture */}

      <ImageUpload
        onChange={onAddImg}
        tooltip={`${addTextPrefix}${I18n.t('card_builder_image')}`}
      >
        <MyIconButton
          disabled={readonly || maxLimit}
          icon={<IconCozImage className="text-[16px]" />}
        />
      </ImageUpload>

      {/* shape */}
      <div className="flex">
        <Tooltip
          key="shape"
          content={(() => {
            if (shapeType === Mode.CIRCLE) {
              return `${addTextPrefix}${I18n.t('imageflow_canvas_circle')}`;
            } else if (shapeType === Mode.TRIANGLE) {
              return `${addTextPrefix}${I18n.t('imageflow_canvas_trian')}`;
            } else if (shapeType === Mode.STRAIGHT_LINE) {
              return `${addTextPrefix}${I18n.t('imageflow_canvas_line')}`;
            }
            return `${addTextPrefix}${I18n.t('imageflow_canvas_rect')}`;
          })()}
          {...commonTooltipProps}
        >
          <MyIconButton
            disabled={readonly || maxLimit}
            onClick={() => {
              onModeChange(shapeType);
            }}
            className={classNames({
              '!coz-mg-secondary-pressed':
                mode &&
                [
                  Mode.RECT,
                  Mode.CIRCLE,
                  Mode.TRIANGLE,
                  Mode.STRAIGHT_LINE,
                ].includes(mode),
            })}
            icon={<ShapeIcon className="text-[16px]" />}
          />
        </Tooltip>
        <Select
          disabled={readonly || maxLimit}
          className="hide-selected-label hide-border"
          // showTick={false}
          value={shapeType}
          size="small"
          getPopupContainer={() => popRefAlignRight?.current ?? document.body}
          optionList={Object.entries(shapeIcons).map(([key, value]) => {
            const Icon = value.icon;
            const { text } = value;
            return {
              value: key,
              label: (
                <div className="px-[8px] flex gap-[8px] items-center">
                  <Icon className="text-[16px]" />
                  <span>{text}</span>
                </div>
              ),
            };
          })}
          onSelect={v => {
            setShapeType(v as Mode);
            onModeChange(v as Mode);
          }}
        />
      </div>

      {/* Free brush */}
      <Tooltip
        key="pencil"
        content={I18n.t('imageflow_canvas_draw')}
        {...commonTooltipProps}
      >
        <MyIconButton
          disabled={readonly || maxLimit}
          onClick={() => {
            onModeChange(Mode.PENCIL);
          }}
          className={classNames({
            '!coz-mg-secondary-pressed': mode && [Mode.PENCIL].includes(mode),
          })}
          icon={<IconCozPencil className="text-[16px]" />}
        />
      </Tooltip>
    </div>
  );
};
