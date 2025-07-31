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

/* eslint-disable @coze-arch/no-deep-relative-import */
import classNames from 'classnames';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { ShortcutToolConfig } from '@coze-common/chat-area-plugins-chat-shortcuts/shortcut-tool';
import { I18n } from '@coze-arch/i18n';
import { LayoutContext, PlacementEnum } from '@coze-arch/bot-hooks';
import { FormatType } from '@coze-arch/bot-api/knowledge';
import { BotMode, WorkflowMode } from '@coze-arch/bot-api/developer_api';
import {
  WorkflowCard,
  WorkflowModalFrom,
} from '@coze-agent-ide/workflow-card-adapter';
import { ToolGroupKey } from '@coze-agent-ide/tool-config';
import { GroupingContainer, ToolKey, ToolView } from '@coze-agent-ide/tool';
import { useDataSetArea } from '@coze-agent-ide/space-bot/hook';
import {
  ChatBackground,
  DataMemory,
  Setting as DataSetSetting,
  settingAreaScrollId,
  SuggestionBlock,
} from '@coze-agent-ide/space-bot/component';
import { PluginApisArea } from '@coze-agent-ide/plugin-area-adapter';
import { OnboardingMessage } from '@coze-agent-ide/onboarding-message-adapter';

import s from '../../../../index.module.less';
import { SkillsModal } from '../../../../components/shortcut-skills-modal';

export interface ToolAreaProps {
  isAllToolHidden: boolean;
  skillToolSlot?: React.ReactNode;
  knowledgeToolSlot?: React.ReactNode;
  memoryToolSlot?: React.ReactNode;
  dialogToolSlot?: React.ReactNode;
  debugToolSlot?: React.ReactNode;
  extraToolSlot?: React.ReactNode;
}

export const ToolArea: React.FC<ToolAreaProps> = props => {
  const {
    isAllToolHidden,
    skillToolSlot,
    knowledgeToolSlot,
    memoryToolSlot,
    dialogToolSlot,
    extraToolSlot,
  } = props;
  const { node: DataSetArea, initRef: DataSetAreaRef } = useDataSetArea();
  const modelId = useModelStore(state => state.config.model);
  return (
    <LayoutContext value={{ placement: PlacementEnum.CENTER }}>
      <div
        className={classNames(s['setting-area'], 'coz-bg-plus', {
          [s['tool-hidden']]: isAllToolHidden,
        })}
      >
        <div className="p-[12px] overflow-auto flex-1" id={settingAreaScrollId}>
          <ToolView>
            <GroupingContainer
              title={I18n.t('bot_edit_type_skills')}
              toolGroupKey={ToolGroupKey.SKILL}
            >
              {/* tool */}
              <PluginApisArea
                toolKey={ToolKey.PLUGIN}
                title={I18n.t('Plugins')}
              />
              {/* Workflow */}
              <WorkflowCard
                flowMode={WorkflowMode.Workflow}
                toolKey={ToolKey.WORKFLOW}
                title={I18n.t('Workflows')}
                from={WorkflowModalFrom.BotSkills}
              />
              {skillToolSlot}
            </GroupingContainer>
            <GroupingContainer
              toolGroupKey={ToolGroupKey.KNOWLEDGE}
              title={I18n.t('bot_edit_type_knowledge')}
              actionNodes={<DataSetSetting modelId={modelId ?? ''} />}
            >
              {/* Knowledge Base */}
              <DataSetArea
                initRef={DataSetAreaRef}
                toolKey={ToolKey.DOCUMENT}
                title={I18n.t('dataset_detail_type_text')}
                desc={I18n.t('bot_ide_knowledge_text_desc')}
                formatType={FormatType.Text}
              />

              <DataSetArea
                initRef={DataSetAreaRef}
                toolKey={ToolKey.TABLE}
                title={I18n.t('dataset_detail_type_table')}
                formatType={FormatType.Table}
                desc={I18n.t('bot_ide_knowledge_table_desc')}
              />

              <DataSetArea
                initRef={DataSetAreaRef}
                toolKey={ToolKey.PHOTO}
                title={I18n.t('knowledge_photo_025')}
                formatType={FormatType.Image}
                desc={I18n.t('knowledge_photo_027')}
              />
              {knowledgeToolSlot}
            </GroupingContainer>
            <GroupingContainer
              toolGroupKey={ToolGroupKey.MEMORY}
              title={I18n.t('bot_edit_type_memory')}
            >
              {/* variable storage */}
              <DataMemory
                toolKey={ToolKey.VARIABLE}
                title={I18n.t('user_profile')}
              />
              {memoryToolSlot}
            </GroupingContainer>
            <GroupingContainer
              toolGroupKey={ToolGroupKey.DIALOG}
              title={I18n.t('bot_edit_type_dialog')}
            >
              {/* opening statement */}
              <OnboardingMessage
                toolKey={ToolKey.ONBOARDING}
                title={I18n.t('bot_preview_opening_remarks')}
              />
              {/* Suggestion switch */}
              <SuggestionBlock
                toolKey={ToolKey.SUGGEST}
                title={I18n.t('bot_edit_suggestion')}
              />
              {/* Shortcut shortcut */}
              <ShortcutToolConfig
                skillModal={SkillsModal}
                toolKey={ToolKey.SHORTCUT}
                botMode={BotMode.SingleMode}
                title={I18n.t('bot_ide_shortcut')}
              />
              {/* Chat background image */}
              <ChatBackground
                toolKey={ToolKey.BACKGROUND}
                title={I18n.t('bgi_title')}
              />
              {dialogToolSlot}
            </GroupingContainer>
            {extraToolSlot}
          </ToolView>
        </div>
      </div>
    </LayoutContext>
  );
};
