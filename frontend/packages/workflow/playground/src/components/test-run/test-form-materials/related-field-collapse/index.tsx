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

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { GlobalVariableService } from '@coze-workflow/variable';
import {
  FormBaseGroupCollapse,
  useCurrentFieldState,
  FormBaseFieldItem,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';
import { IntelligenceType } from '@coze-arch/bot-api/intelligence_api';

import { useGlobalState } from '@/hooks';

import { ConversationSelect } from '../../../conversation-select';
import { BotProjectSelect } from '../../../bot-project-select';

interface RelatedFieldCollapseProps {
  value: any;
  isNeedBot: boolean;
  isNeedConversation?: boolean;
  hasVariableAssignNode?: boolean;
  hasLTMNode?: boolean;
  disableBot?: boolean;
  disableBotTooltip?: string;
  disableProject?: boolean;
  disableProjectTooltip?: string;
  onChange: (v?: any) => void;
  onBlur: () => void;
}

export const RelatedFieldCollapse: React.FC<RelatedFieldCollapseProps> = ({
  value,
  isNeedBot,
  isNeedConversation,
  onChange,
  onBlur,
  ...props
}) => {
  const { errors } = useCurrentFieldState();
  const botErrors = (errors || [])
    .filter(i => i?.type === 'bot')
    .map(i => i.message);
  const conversationErrors = (errors || [])
    .filter(i => i?.type === 'conversation')
    .map(i => i.message);
  const globalState = useGlobalState();
  const globalVariableService = useService<GlobalVariableService>(
    GlobalVariableService,
  );
  const globalProjectId = globalState.projectId;

  const botValue = value?.[TestFormFieldName.Bot];
  const conversationValue = value?.[TestFormFieldName.Conversation];
  const projectId = useMemo(() => {
    if (globalProjectId) {
      return globalProjectId;
    }
    if (botValue?.type === IntelligenceType.Project) {
      return botValue?.id;
    }
  }, [globalProjectId, botValue]);

  const isConversationVisible = isNeedConversation && !!projectId;
  const handleBotProjectValueChange = next => {
    const nextValue = {
      [TestFormFieldName.Bot]: next,
    };
    onChange(nextValue);
    onBlur();
    globalVariableService.loadGlobalVariables(
      next.type === IntelligenceType.Bot ? 'bot' : 'project',
      next.id,
    );
  };
  const handleConversationValueChange = next => {
    const nextValue = {
      ...value,
      [TestFormFieldName.Conversation]: next,
    };
    onChange(nextValue);
    onBlur();
  };

  return (
    <FormBaseGroupCollapse label={I18n.t('wf_testrun_form_related_title')}>
      {isNeedBot ? (
        <FormBaseFieldItem
          title={I18n.t('wf_chatflow_72')}
          required
          feedback={botErrors.join(',')}
        >
          <BotProjectSelect
            size="small"
            hideLabel={true}
            value={botValue}
            onChange={handleBotProjectValueChange}
            {...props}
            // @ts-expect-error
            validateStatus={botErrors.length ? 'error' : undefined}
          />
        </FormBaseFieldItem>
      ) : null}
      {isConversationVisible ? (
        <FormBaseFieldItem
          title={I18n.t('wf_chatflow_74')}
          required
          tooltip={I18n.t('wf_chatflow_154')}
          feedback={conversationErrors.join(',')}
        >
          <ConversationSelect
            size="small"
            value={conversationValue}
            projectId={projectId}
            onChange={handleConversationValueChange}
            {...props}
            // @ts-expect-error
            validateStatus={conversationErrors.length ? 'error' : undefined}
          />
        </FormBaseFieldItem>
      ) : null}
    </FormBaseGroupCollapse>
  );
};
