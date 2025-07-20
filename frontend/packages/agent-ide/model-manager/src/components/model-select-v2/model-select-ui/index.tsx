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
 
import { type ReactNode, useRef, useState } from 'react';

import { isBoolean } from 'lodash-es';
import cls from 'classnames';
import { Popover, type PopoverProps } from '@coze-arch/coze-design';
import { IconCozArrowDown } from '@coze-arch/bot-icons';
import { type Model } from '@coze-arch/bot-api/developer_api';

import { PopoverModelListView } from '../popover-model-list-view';
import {
  type ModelConfigProps,
  PopoverModelConfigView,
} from '../popover-model-config-view';
import { ModelOptionThumb } from '../model-option-thumb';

export interface ModelSelectUIProps {
  /**
   * 是否禁止弹出 popover
   *
   * 目前内部实现既支持 disabled 时直接不允许弹出 popover（与历史逻辑一致）
   * 也支持允许弹出 popover 和查看详细配置但禁止编辑
   * 需求变更时可灵活修改
   */
  disabled?: boolean;
  /** 当前选中的模型 */
  selectedModelId: string;
  /**
   * 是否展示跳转到模型详情页（/space/:space_id/model/:model_id）按钮
   * @default false
   */
  enableJumpDetail?:
    | {
        spaceId: string;
      }
    | false;
  /**
   * 模型选择的变更事件
   *
   * 返回值表示是否成功切换，对部分后续事件会有影响，比如自动关闭 popover
   * 不显式 return 则视为 true
   */
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- 要实现【要么不用 return，要么必须 return boolean】没别的办法了啊
  onModelChange: (model: Model) => boolean | void;
  modelList: Model[];
  /**
   * 允许业务侧自定义触发器展示，命名对齐 semi select 组件
   *
   * @param model - 当 selectedModelId 找不到对应的 model 时，这里则会传入 undefined
   */
  triggerRender?: (model?: Model, popoverVisible?: boolean) => ReactNode;
  /**
   * workflow 等不允许详细配置的业务会有 clickToHide 的诉求
   * @default false
   */
  clickToHide?: boolean;
  /** @default bottomLeft */
  popoverPosition?: PopoverProps['position'];
  /** @default true */
  popoverAutoAdjustOverflow?: boolean;
  /** trigger 的 className。若传入 triggerRender 则完全由 triggerRender 接管渲染，该参数不再起作用 */
  className?: string;
  popoverClassName?: string;
  /**
   * 若业务侧自行在组件外部插入 Modal，则点击 Modal 也会触发 onClickOutSide 导致 popover 关闭
   * 若不希望 popover 意外关闭，则需要将 Modal 通过 modalSlot 传入
   *
   * （甚至不需要设置 getPopupContainer，此时 Modal 的挂载层和 ModelSelect 的 Popover 的挂载层依然不同，但却神秘地不会再触发 onClickOutSide 了，semi 牛逼）
   */
  modalSlot?: ReactNode;

  /** 模型详细配置信息，不传则隐藏详细配置的按钮入口 */
  modelConfigProps?: ModelConfigProps;

  /** 弹窗有多种渲染场景，提供选项来定制渲染层级已避免覆盖 */
  zIndex?: number;

  /** 模型列表额外头部插槽 */
  modelListExtraHeaderSlot?: ReactNode;

  /** 是否默认展开模型列表 */
  defaultOpen?: boolean;
}

export function ModelSelectUI({
  className,
  disabled,
  enableJumpDetail,
  popoverClassName,
  selectedModelId,
  modelList,
  onModelChange,
  triggerRender,
  modelListExtraHeaderSlot,
  clickToHide = false,
  popoverPosition = 'bottomLeft',
  popoverAutoAdjustOverflow = true,
  modalSlot,
  modelConfigProps,
  zIndex = 999,
  defaultOpen = false,
}: ModelSelectUIProps) {
  /** 为了实现 Popover 跟 Select 宽度一致，通过该 ref 获取 Select 宽度（若传入 triggerRender 则不再需要保持一致） */
  const selectRef = useRef<HTMLDivElement>(null);
  const [popoverVisible, setPopoverVisible] = useState(defaultOpen);
  const [detailConfigVisible, setDetailConfigVisible] = useState(false);

  const selectedModel = modelList.find(
    ({ model_type }) => selectedModelId === String(model_type),
  );

  // 需要实现 group + custom option 效果，Select 组件兼容性不佳，不得不自行实现 Popover
  return (
    <Popover
      zIndex={zIndex}
      stopPropagation
      autoAdjustOverflow={popoverAutoAdjustOverflow}
      visible={popoverVisible}
      trigger="click"
      position={popoverPosition}
      onClickOutSide={() => {
        setPopoverVisible(false);
        setDetailConfigVisible(false);
      }}
      className={cls('!p-0')}
      content={
        <div
          className={cls(
            'w-[480px] max-h-[50vh] !p-0 overflow-hidden',
            popoverClassName,
          )}
          style={
            selectRef.current
              ? { width: selectRef.current.clientWidth }
              : undefined
          }
        >
          {modelConfigProps ? (
            <PopoverModelConfigView
              disabled={disabled}
              visible={detailConfigVisible}
              selectedModel={selectedModel}
              onClose={() => setDetailConfigVisible(false)}
              modelConfigProps={modelConfigProps}
            />
          ) : null}

          <PopoverModelListView
            // 用 hidden 而不是直接条件性挂载以便保留 scrollTop，设计师的小心思
            hidden={detailConfigVisible}
            disabled={disabled}
            selectedModelId={selectedModelId}
            selectedModel={selectedModel}
            modelList={modelList}
            extraHeaderSlot={modelListExtraHeaderSlot}
            onModelClick={(m: Model) => {
              const res = onModelChange(m);
              const success = isBoolean(res) ? res : true;
              if (success && clickToHide) {
                setPopoverVisible(false);
                setDetailConfigVisible(false);
              }
              return success;
            }}
            enableJumpDetail={!!enableJumpDetail}
            onDetailClick={modelId => {
              if (!enableJumpDetail) {
                return;
              }
              window.open(
                `/space/${enableJumpDetail.spaceId}/model/${modelId}`,
                '_blank',
              );
            }}
            enableConfig={!!modelConfigProps}
            onConfigClick={() => {
              if (!modelConfigProps) {
                return;
              }
              setDetailConfigVisible(true);
            }}
          />

          {modalSlot}
        </div>
      }
    >
      {triggerRender ? (
        <span
          className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          onClick={() => {
            if (!disabled) {
              setPopoverVisible(true);
            }
          }}
        >
          {triggerRender(selectedModel, popoverVisible)}
        </span>
      ) : (
        <div
          ref={selectRef}
          className={cls(
            'w-full p-[4px] flex items-center justify-between rounded-[8px]',
            'overflow-hidden cursor-pointer border border-solid',
            'hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
            popoverVisible ? 'coz-stroke-hglt' : 'coz-stroke-primary',
            className,
          )}
          onClick={() => {
            if (!disabled) {
              setPopoverVisible(true);
            }
          }}
        >
          <ModelOptionThumb
            model={selectedModel || { name: selectedModelId }}
          />
          <IconCozArrowDown className="coz-fg-secondary" />
        </div>
      )}
    </Popover>
  );
}
