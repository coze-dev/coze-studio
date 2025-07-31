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

/* eslint-disable complexity -- ignore */
import { type PropsWithChildren, useRef } from 'react';

import cls from 'classnames';
import { useHover } from 'ahooks';
import {
  useBenefitAvailable,
  PremiumPaywallScene,
  usePremiumPaywallModal,
} from '@coze-studio/premium-components-adapter';
import { I18n } from '@coze-arch/i18n';
import { type Model, ModelTagClass } from '@coze-arch/bot-api/developer_api';
import {
  useBotCreatorContext,
  BotCreatorScene,
} from '@coze-agent-ide/bot-creator-context';
import {
  IconCozLongArrowTopRight,
  IconCozSetting,
  IconCozLongArrowUpCircle,
  IconCozDiamondFill,
} from '@coze-arch/coze-design/icons';
import { IconButton, Tag, Tooltip, Typography } from '@coze-arch/coze-design';
import { OverflowList } from '@blueprintjs/core';

import { ModelOptionAvatar } from '../model-option-avatar';

import styles from './index.module.less';

export type ModelOptionProps = {
  model: Model;
  selected?: boolean;
  disabled?: boolean;
  /** Return whether the switch was successful */
  onClick: () => boolean;
} & (
  | {
      enableConfig?: false;
    }
  | {
      enableConfig: true;
      onConfigClick: () => void;
    }
) &
  (
    | {
        enableJumpDetail?: false;
      }
    | {
        enableJumpDetail: true;
        /**
         * Click to jump to the model management page
         *
         * Because the component positioning is a pure UI component, and the way to obtain the space id of different modules is different, the splicing of jump behavior and url is not built-in
         */
        onDetailClick: (modelId: string) => void;
      }
  );

// eslint-disable-next-line @coze-arch/max-line-per-function
export function ModelOption({
  model,
  selected,
  disabled,
  onClick,
  ...props
}: ModelOptionProps) {
  /** This ref is purely for judging whether to hover or not. */
  const ref = useRef<HTMLElement>(null);
  const isHovering = useHover(ref);
  const { scene } = useBotCreatorContext();

  const featureTags = model.model_tag_list
    ?.filter(t => t.tag_class === ModelTagClass.ModelFeature && t.tag_name)
    .map(t => t.tag_name);
  const functionTags = model.model_tag_list
    ?.filter(t => t.tag_class === ModelTagClass.ModelFunction && t.tag_name)
    .map(t => t.tag_name);

  // Paywall, open source version does not support this feature
  const isProModel =
    model.model_status_details?.is_new_model ||
    model.model_status_details?.is_advanced_model;
  const isNewModelAvailable = useBenefitAvailable({
    scene: PremiumPaywallScene.NewModel,
  });
  const { node: premiumPaywallModal, open: openPremiumPaywallModal } =
    usePremiumPaywallModal({ scene: PremiumPaywallScene.NewModel });

  return (
    <>
      <article
        ref={ref}
        className={cls(
          'pl-[16px] pr-[12px] w-full relative',
          'flex gap-[16px] items-center rounded-[12px]',
          selected
            ? 'coz-mg-hglt hover:coz-mg-hglt-hovered'
            : 'hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          // The following cls only hide the upper and lower dividing lines when implementing hover, active, and last (note that the dividing lines are in model-info-border, the designer's careful thought)
          styles['model-option'],
          // @ts-expect-error -- I don't know why the error is reported.
          { [styles['model-option_selected']]: selected },
        )}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (isProModel && !isNewModelAvailable) {
            openPremiumPaywallModal();
            return;
          }
          onClick();
        }}
      >
        <ModelOptionAvatar model={model} />
        <div
          className={cls(
            'h-[80px] py-[12px] w-full',
            'flex flex-col overflow-hidden',
            'border-0 border-b border-solid coz-stroke-primary',
            styles['model-info-border'],
          )}
          style={
            isHovering
              ? {
                  mask: calcMaskStyle([
                    props.enableConfig,
                    props.enableJumpDetail,
                  ]),
                }
              : undefined
          }
        >
          <div className="w-full flex items-center gap-[6px] overflow-hidden">
            <Typography.Title fontSize="14px" ellipsis={{ showTooltip: true }}>
              {model.name}
            </Typography.Title>
            <div className="shrink-0 flex gap-[6px]">
              {model.model_status_details?.is_free_model &&
              scene !== BotCreatorScene.DouyinBot ? (
                <Tag size="mini" color="primary" className="!coz-mg-plus">
                  {I18n.t('model_list_free')}
                </Tag>
              ) : null}
              {isProModel && !isNewModelAvailable ? (
                <IconCozDiamondFill className="coz-fg-hglt" />
              ) : null}
              {featureTags?.length
                ? featureTags.map(feature => (
                    <Tag
                      key={feature}
                      size="mini"
                      color="primary"
                      className="!bg-transparent !border border-solid coz-stroke-plus"
                    >
                      {feature}
                    </Tag>
                  ))
                : null}
            </div>
          </div>
          <div className="flex items-center text-[12px] leading-[16px] coz-fg-dim overflow-hidden">
            <ModelTag isFirst>
              {((model.model_quota?.token_limit || 0) / 1024).toFixed(0)}K
            </ModelTag>
            <ModelTag
              isLast={!functionTags?.length}
              className="flex items-center gap-[4px]"
            >
              <span>{model.model_name}</span>
              {model.model_status_details?.update_info ? (
                <Tooltip content={model.model_status_details.update_info}>
                  <IconCozLongArrowUpCircle className="ml-[2px] coz-fg-hglt-green" />
                </Tooltip>
              ) : null}
            </ModelTag>
            {functionTags?.length ? (
              <Tooltip content={functionTags.join(IS_OVERSEA ? ', ' : '、')}>
                <span className="overflow-hidden">
                  <OverflowList
                    items={functionTags}
                    visibleItemRenderer={(item, idx) => (
                      <ModelTag
                        key={idx}
                        isLast={idx === functionTags.length - 1}
                      >
                        {item}
                      </ModelTag>
                    )}
                    overflowRenderer={restItems => (
                      <span className="pl-[6px] flex items-center">{`+${restItems.length}`}</span>
                    )}
                    collapseFrom="end"
                  />
                </span>
              </Tooltip>
            ) : null}
          </div>
          <Typography.Text
            className="mt-[4px] text-[12px] leading-[16px] coz-fg-secondary"
            ellipsis={{ showTooltip: true }}
          >
            {model.model_brief_desc}
          </Typography.Text>
        </div>
        {isHovering ? (
          <div className="absolute right-[12px] h-full flex items-center gap-[3px]">
            {props.enableConfig ? (
              <IconButton
                icon={<IconCozSetting />}
                color="secondary"
                size="default"
                data-testid="model_select_option.config_btn"
                onClick={e => {
                  e.stopPropagation();

                  // paywall blocking
                  if (isProModel && !isNewModelAvailable) {
                    openPremiumPaywallModal();
                    return;
                  }

                  if (selected) {
                    props.onConfigClick();
                    return;
                  }
                  const success = onClick();
                  if (success) {
                    setTimeout(() => props.onConfigClick());
                  }
                }}
              />
            ) : null}
            {props.enableJumpDetail ? (
              <IconButton
                icon={<IconCozLongArrowTopRight />}
                color="secondary"
                size="default"
                data-testid="model_select_option.detail_btn"
                onClick={e => {
                  e.stopPropagation();
                  props.onDetailClick(String(model.model_type));
                }}
              />
            ) : null}
          </div>
        ) : null}
      </article>
      {premiumPaywallModal}
    </>
  );
}

function ModelTag({
  isFirst,
  isLast,
  className,
  children,
}: PropsWithChildren<{
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}>) {
  return (
    <div
      className={cls(
        { 'pl-[6px]': !isFirst },
        'shrink-0 flex items-center gap-[6px]',
      )}
    >
      <span className={className}>{children}</span>
      {isLast ? null : (
        <span className="h-[9px] border-0 border-r border-solid coz-stroke-primary" />
      )}
    </div>
  );
}

/**
 * When hovering to display several icons (such as jumping to the model details page and detailed configuration), there should be a gradual change mask effect on the content under the icon
 * This method is used to calculate the mask style
 */
function calcMaskStyle(buttonVisible: Array<boolean | undefined>) {
  const btnNum = buttonVisible.reduce(
    (prevNum, showBtn) => prevNum + (showBtn ? 1 : 0),
    0,
  );
  if (btnNum === 0) {
    return 'none';
  }

  const BTN_WIDTH = 32;
  const BTN_GAP = 3;
  /** Fixed width of mask that does not vary with the number of buttons */
  const PRESET_PADDING = 16;
  /** A gradual change in the width of the mask */
  const MASK_WIDTH = 24;

  const gradientStart =
    btnNum * BTN_WIDTH + (btnNum - 1) * BTN_GAP + PRESET_PADDING;
  const gradientEnd = gradientStart + MASK_WIDTH;
  return `linear-gradient(to left, rgba(0,0,0,0), rgba(0,0,0,0) ${gradientStart}px, #fff ${gradientEnd}px)`;
}
