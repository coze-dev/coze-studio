/* eslint-disable @coze-arch/no-deep-relative-import */
import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconButton, Tooltip } from '@coze/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { IconHistory } from '@coze-arch/bot-icons';

import { useGlobalState } from '../../../../hooks';
import { useHistoryDrawer } from './components/history-drawer';

const WorkflowHistory = () => {
  const globalState = useGlobalState();
  const { info } = globalState;
  const vcsPermission = info.vcsData?.can_edit;
  // 1. 协作模式 2. 协作模式权限
  const showHistory = vcsPermission;

  const { node: historyDrawer, show: showHistoryDrawer } = useHistoryDrawer({
    spaceId: globalState.spaceId,
    workflowId: globalState.workflowId,
    enablePublishPPE: Boolean(
      globalState.isDevSpace && globalState.hasPublished,
    ),
  });

  if (!showHistory) {
    return null;
  }

  return (
    <>
      <Tooltip
        content={I18n.t('workflow_publish_multibranch_viewhistory')}
        position="bottom"
      >
        <IconButton
          icon={<IconHistory />}
          color="secondary"
          onClick={() => {
            sendTeaEvent(EVENT_NAMES.workflow_submit_version_history, {
              workflow_id: globalState.workflowId,
              workspace_id: globalState.spaceId,
            });
            showHistoryDrawer();
          }}
        />
      </Tooltip>
      {historyDrawer}
    </>
  );
};

export const HistoryButton = () => <WorkflowHistory />;
