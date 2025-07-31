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

import { useParams } from 'react-router-dom';
import React, { type FC, useState, useEffect } from 'react';

import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  AddButton,
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { OpenBlockEvent, emitEvent } from '@coze-arch/bot-utils';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { DataErrorBoundary, DataNamespace } from '@coze-data/reporter';

import { MemoryList } from './memory-list';
import { MemoryAddModal } from './memory-add-modal';

import s from './index.module.less';

const MAX_SIZE = 10;

type IDataMemoryProps = ToolEntryCommonProps;

const BaseDataMemory: FC<IDataMemoryProps> = ({ title }) => {
  const setToolValidData = useToolValidData();
  const variables = useBotSkillStore($store => $store.variables);
  const [visible, setVisible] = useState(false);
  const isReadonly = useBotDetailIsReadonly();
  const [activeId, setActiveId] = useState<undefined | string>();

  const params = useParams<DynamicParams>();

  const onOpenMemoryAdd = ($activeId?: string) => {
    if (isReadonly) {
      return;
    }
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      bot_id: params?.bot_id || '',
      resource_type: 'variable',
      action: 'turn_on',
      source: 'bot_detail_page',
      source_detail: 'memory_manage',
    });
    setVisible(true);
    setActiveId($activeId);
  };

  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.DATA_MEMORY_BLOCK,
    configured: variables.length > 0,
  });

  useEffect(() => {
    setToolValidData(Boolean(variables?.length));
  }, [variables?.length]);

  return (
    <>
      <ToolContentBlock
        blockEventName={OpenBlockEvent.DATA_MEMORY_BLOCK_OPEN}
        showBottomBorder
        header={title}
        defaultExpand={defaultExpand}
        // icon={userInfo}
        actionButton={
          <>
            <AddButton
              tooltips={
                variables.length < MAX_SIZE
                  ? I18n.t('bot_edit_variable_add_tooltip')
                  : I18n.t('bot_edit_variable_add_tooltip_edit')
              }
              onClick={() => onOpenMemoryAdd()}
              enableAutoHidden={true}
              data-testid="bot.editor.tool.data-memory.add-button"
            />
          </>
        }
      >
        <div className={s['memory-content']}>
          <MemoryList onOpenMemoryAdd={onOpenMemoryAdd} />
        </div>
      </ToolContentBlock>
      <MemoryAddModal
        visible={visible}
        activeId={activeId}
        onCancel={() => {
          setVisible(false);
          sendTeaEvent(EVENT_NAMES.memory_click_front, {
            bot_id: params?.bot_id || '',
            resource_type: 'variable',
            action: 'turn_off',
            source: 'bot_detail_page',
            source_detail: 'memory_manage',
          });
        }}
        onOk={() => {
          setVisible(false);
          emitEvent(OpenBlockEvent.DATA_MEMORY_BLOCK_OPEN);
        }}
      />
    </>
  );
};

export const DataMemory: FC<IDataMemoryProps> = props => (
  <DataErrorBoundary namespace={DataNamespace.VARIABLE}>
    <BaseDataMemory {...props} />
  </DataErrorBoundary>
);
