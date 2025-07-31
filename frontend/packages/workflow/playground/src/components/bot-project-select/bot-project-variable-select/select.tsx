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

import React, { useCallback, useRef, useState } from 'react';

import cls from 'classnames';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozMagnifier } from '@coze-arch/coze-design/icons';
import { Avatar, Select } from '@coze-arch/coze-design';
import { type Select as SemiSelect } from '@coze-arch/bot-semi';

import { useRelatedBotService } from '@/hooks';

import VariablePanel from './variable-panel/variable-panel';
import { type BotProjectVariableSelectProps, type RelatedValue } from './types';
import useRelated from './related-bot-panel/use-related';
import RelatedBotPanel from './related-bot-panel/panel';

const formatRelatedBotValue = (value?: {
  id: string;
  type: 'bot' | 'project';
}): RelatedValue | undefined => {
  if (!value) {
    return value;
  }

  return {
    id: value.id,
    type:
      value.type === 'bot' ? IntelligenceType.Bot : IntelligenceType.Project,
  };
};

export default function BotProjectVariableSelect({
  className,
  variablesFormatter,
  relatedEntityValue: relatedEntityValueFromProps,
  disableBot,
  disableProject,
  disableBotTooltip,
  disableProjectTooltip,
  onVariableSelect,
  variableValue,
  variablePanelStyle,
  relatedBotPanelStyle,
  customVariablePanel,
}: BotProjectVariableSelectProps) {
  const selectRef = useRef<SemiSelect | null>(null);
  const relatedBotService = useRelatedBotService();
  const getRelatedEntityValue = () =>
    relatedEntityValueFromProps ||
    formatRelatedBotValue(relatedBotService.getRelatedBotValue());
  const relatedEntityValue = getRelatedEntityValue();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showBotPanel, setShowBotPanel] = useState(!relatedEntityValue?.id);

  const {
    relatedEntities,
    onRelatedEntitiesSearch,
    isLoadMore,
    loadMoreRelatedEntities,
  } = useRelated({
    relatedEntityValue,
  });

  const handleFocus = useCallback(() => {
    setTimeout(() => {
      setShowBotPanel(true);
    }, 100);
  }, []);

  const handleBlur = useCallback(() => {
    selectRef.current?.clearInput?.();
    selectRef.current?.close?.();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowBotPanel(!getRelatedEntityValue()?.id);
    }, 300);
  }, []);

  return (
    <div className={cls(className, 'w-full flex flex-col p-4px')}>
      <Select
        autoClearSearchValue={true}
        ref={selectRef}
        filter
        inputProps={{
          onBlur: handleBlur,
          onFocusCapture: handleFocus,
        }}
        value={relatedEntityValue?.id}
        className={'w-full'}
        size={'small'}
        placeholder={I18n.t(
          'variable_binding_search_project',
          {},
          '搜索智能体/应用',
        )}
        optionList={[]}
        onSearch={onRelatedEntitiesSearch}
        emptyContent={null}
        prefix={
          <IconCozMagnifier className={'text-[16px] ml-8px coz-fg-secondary'} />
        }
        showArrow={false}
        renderSelectedItem={() => {
          const item = relatedEntities.find(
            e => e.value === relatedEntityValue?.id,
          );
          if (item) {
            return (
              <div className={'flex items-center'}>
                <Avatar
                  className={'w-16px h-16px mr-8px'}
                  shape="square"
                  src={item.avatar}
                />
                <span className={'text-[12px]'}>{item.name}</span>
              </div>
            );
          }
          return null;
        }}
      />

      <div className={'w-full coz-fg-primary'}>
        {showBotPanel ? (
          <RelatedBotPanel
            relatedBotPanelStyle={relatedBotPanelStyle}
            relatedEntityValue={relatedEntityValue}
            relatedEntities={relatedEntities}
            onLoadMore={loadMoreRelatedEntities}
            isLoadMore={isLoadMore}
            disableBot={disableBot}
            disableProject={disableProject}
            disableBotTooltip={disableBotTooltip}
            disableProjectTooltip={disableProjectTooltip}
            onRelatedSelect={() => {
              setShowBotPanel(false);
            }}
          />
        ) : (
          customVariablePanel || (
            <VariablePanel
              variablePanelStyle={variablePanelStyle}
              variableValue={variableValue}
              onVariableSelect={onVariableSelect}
              variablesFormatter={variablesFormatter}
            />
          )
        )}
      </div>
    </div>
  );
}
