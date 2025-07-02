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
    // 处于项目中，直接使用项目的 id
    if (myProjectId) {
      return myProjectId;
    }
    if (sessionInfo?.type === IntelligenceType.Project) {
      return sessionInfo.value;
    }
    return null;
  }, [myProjectId, sessionInfo]);

  // 没有 projectId 时不渲染
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
