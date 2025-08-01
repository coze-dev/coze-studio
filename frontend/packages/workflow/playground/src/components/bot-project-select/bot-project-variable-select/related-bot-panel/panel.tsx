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

import React from 'react';

import cls from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { GlobalVariableService } from '@coze-workflow/variable';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { useRelatedBotService } from '@/hooks';

import { type RelatedEntitiesProps } from '../types';
import s from '../index.module.less';
import { isItemDisabled } from '../../utils';
import type { IBotSelectOption, DisableExtraOptions } from '../../types';
import { RenderFootLoading } from '../../bots';
import OptionItem from './option-item';
import EmptyContent from './empty-content';

interface Options extends DisableExtraOptions {
  onClick: () => void;
  checkedValue?: string;
}

const renderCustomOption = (
  item: IBotSelectOption | undefined,
  extraOptions: Options,
) => {
  if (!item) {
    return null;
  }

  const {
    disableBot,
    disableProject,
    disableBotTooltip,
    disableProjectTooltip,
    onClick,
    checkedValue,
  } = extraOptions;

  const isBot = item.type === IntelligenceType.Bot;
  const disabled = isItemDisabled({ disableBot, disableProject }, item.type);

  const disabledTooltip =
    isBot && disableBot ? disableBotTooltip : disableProjectTooltip;

  const handleClick = () => {
    if (disabled) {
      return;
    }

    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cls(s['related-entities-option'], {
        [s['related-entities-option-disabled']]: disabled,
        [s['related-entities-option-selected']]: checkedValue === item.value,
      })}
    >
      {disabled ? (
        <Tooltip
          keepDOM={true}
          content={disabledTooltip}
          position="left"
          className={'w-full'}
        >
          <div className={'w-full'}>
            <OptionItem
              {...item}
              disabled={disabled}
              checked={checkedValue === item.value}
            />
          </div>
        </Tooltip>
      ) : (
        <OptionItem
          {...item}
          disabled={disabled}
          checked={checkedValue === item.value}
        />
      )}
    </div>
  );
};

export default function Panel({
  relatedEntities = [],
  relatedEntityValue,
  disableProjectTooltip,
  disableProject,
  disableBotTooltip,
  disableBot,
  isLoadMore,
  onLoadMore,
  onRelatedSelect,
  relatedBotPanelStyle,
}: RelatedEntitiesProps) {
  const relatedBotService = useRelatedBotService();

  const globalVariableService = useService<GlobalVariableService>(
    GlobalVariableService,
  );

  return (
    <>
      {relatedEntities && relatedEntities?.length > 0 ? (
        <div
          className={
            'coz-fg-secondary mt-8px mb-4px pl-28px text-[12px] font-medium leading-16px'
          }
        >
          {I18n.t(
            'variable_binding_please_bind_an_agent_or_app_first',
            {},
            '请先绑定智能体或应用',
          )}
        </div>
      ) : null}

      <div className={'h-[292px] overflow-y-auto'} style={relatedBotPanelStyle}>
        {relatedEntities?.map(item =>
          renderCustomOption(item, {
            disableProjectTooltip,
            disableProject,
            disableBotTooltip,
            disableBot,
            onClick: () => {
              relatedBotService.updateRelatedBot({
                id: item.value,
                type: item.type === IntelligenceType.Bot ? 'bot' : 'project',
              });

              globalVariableService.loadGlobalVariables(
                item.type === 1 ? 'bot' : 'project',
                item.value,
              );

              onRelatedSelect?.(item);
            },
            checkedValue: relatedEntityValue?.id,
          }),
        )}

        {isLoadMore ? (
          <div className={s['bot-foot-loading']}>
            <RenderFootLoading onObserver={onLoadMore} />
          </div>
        ) : null}

        {!relatedEntities || relatedEntities?.length <= 0 ? (
          <EmptyContent />
        ) : null}
      </div>
    </>
  );
}
