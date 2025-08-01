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
import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { IconHistory } from '@coze-arch/bot-icons';

import { useGlobalState } from '../../../../hooks';
import { useHistoryDrawer } from './components/history-drawer';

const WorkflowHistory = () => {
  const globalState = useGlobalState();
  const { info } = globalState;
  const vcsPermission = info.vcsData?.can_edit;
  // 1. Collaboration mode 2. Collaboration mode permissions
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
