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
   * Whether to ban popovers
   *
   * The current internal implementation supports both disabled and directly does not allow popovers (consistent with historical logic).
   * Also supports allowing popovers and viewing detailed configuration but prohibiting editing
   * Flexible modification when requirements change
   */
  disabled?: boolean;
  /** The currently selected model */
  selectedModelId: string;
  /**
   * Whether to display the jump to model details page (/space/: space_id/model/: model_id) button
   * @default false
   */
  enableJumpDetail?:
    | {
        spaceId: string;
      }
    | false;
  /**
   * Model-selected change events
   *
   * The return value indicates whether the switch was successful, which will affect some subsequent events, such as automatically closing the popover.
   * No explicit return is considered true
   */
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- there is no other way to implement [either do not return, or must return boolean]
  onModelChange: (model: Model) => boolean | void;
  modelList: Model[];
  /**
   * Allows business side custom trigger display, named alignment semi selected components
   *
   * @Param model - when selectedModelId cannot find the corresponding model, this will pass undefined
   */
  triggerRender?: (model?: Model, popoverVisible?: boolean) => ReactNode;
  /**
   * Businesses such as workflow that do not allow detailed configuration will have clickToHide demands.
   * @default false
   */
  clickToHide?: boolean;
  /** @default bottomLeft */
  popoverPosition?: PopoverProps['position'];
  /** @default true */
  popoverAutoAdjustOverflow?: boolean;
  /** The className of the trigger. If you pass in triggerRender, triggerRender takes over the rendering completely. This parameter no longer has any effect */
  className?: string;
  popoverClassName?: string;
  /**
   * If the business side inserts a Modal outside the component by itself, clicking Modal will also trigger onClickOutSide and cause the popover to close.
   * If you don't want the popover to close unexpectedly, you need to pass Modal through modalSlot
   *
   * (You don't even need to set getPopupContainer, the mount layer of Modal and the mount layer of ModelSelect's Popover are still different, but mysteriously no longer trigger onClickOutSide, semi awesome)
   */
  modalSlot?: ReactNode;

  /** The detailed configuration information of the model will be hidden if the button entrance of the detailed configuration is not passed. */
  modelConfigProps?: ModelConfigProps;

  /** The pop-up window has a variety of rendering scenarios, providing options to customize the rendering hierarchy to avoid overwriting */
  zIndex?: number;

  /** Model List Extra Head Slots */
  modelListExtraHeaderSlot?: ReactNode;

  /** Whether to expand the model list by default */
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
  /** In order to achieve the same width as Select for Popover, get the Select width through this ref (if you pass in triggerRender, you no longer need to keep it consistent) */
  const selectRef = useRef<HTMLDivElement>(null);
  const [popoverVisible, setPopoverVisible] = useState(defaultOpen);
  const [detailConfigVisible, setDetailConfigVisible] = useState(false);

  const selectedModel = modelList.find(
    ({ model_type }) => selectedModelId === String(model_type),
  );

  // Need to implement group + custom option effect, Select component compatibility is not good, have to implement Popover
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
            // Use hidden instead of direct conditional mount to preserve scrollTop, designer's care
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
