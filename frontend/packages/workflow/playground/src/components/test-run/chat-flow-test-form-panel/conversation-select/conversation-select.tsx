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

import { useMemo, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';
import { IntelligenceType } from '@coze-arch/bot-api/intelligence_api';

import { useGlobalState } from '@/hooks';

import { useChatflowInfo } from '../../hooks/use-chatflow-info';
import { Conversations as OnlyConversationSelect } from '../../../conversation-select/conversations';

import css from './conversation-select.module.less';

export const ConversationSelect = () => {
  const { projectId: myProjectId } = useGlobalState();
  const { sessionInfo } = useChatflowInfo();
  const [value, setValue] = useState<string | undefined>();

  const projectId = useMemo(() => {
    // In the project, use the project's ID directly.
    if (myProjectId) {
      return myProjectId;
    }
    if (sessionInfo?.type === IntelligenceType.Project) {
      return sessionInfo.value;
    }
    return null;
  }, [myProjectId, sessionInfo]);

  // No rendering without projectId
  if (!projectId) {
    return null;
  }

  return (
    <div className={css['conversation-select']}>
      <Typography.Text fontSize="14px">
        {I18n.t('wf_chatflow_74')}
      </Typography.Text>

      <OnlyConversationSelect
        projectId={projectId}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};
