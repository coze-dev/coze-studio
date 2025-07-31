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

import React, { useEffect } from 'react';

import { TabBar } from '@coze-arch/coze-design';
import { useProjectRole } from '@coze-common/auth';
import {
  useProjectId,
  useCommitVersion,
  useCurrentWidgetContext,
} from '@coze-project-ide/framework';

import { useConnectorList } from './hooks';
import { ConversationContent } from './conversation-content';
import { DEBUG_CONNECTOR_ID, COZE_CONNECTOR_ID } from './constants';

import css from './main.module.less';

const Conversation = () => {
  const projectId = useProjectId();
  const { version: commitVersion } = useCommitVersion();
  const { widget: uiWidget } = useCurrentWidgetContext();

  const { connectorList, activeKey, createEnv, onTabChange } =
    useConnectorList();

  const projectRoles = useProjectRole(projectId);
  const readonly = !projectRoles?.length || !!commitVersion;

  useEffect(() => {
    uiWidget.setUIState('normal');
  }, []);

  return (
    <>
      <TabBar
        type="text"
        mode="select"
        className={css['connector-tab']}
        activeKey={activeKey}
        onTabClick={onTabChange}
      >
        {connectorList.map(connector => (
          <TabBar.TabPanel
            tab={connector.connectorName}
            itemKey={connector.connectorId}
          />
        ))}
      </TabBar>
      <ConversationContent
        canEdit={!readonly}
        connectorId={
          activeKey === DEBUG_CONNECTOR_ID ? COZE_CONNECTOR_ID : activeKey
        }
        createEnv={createEnv}
      />
    </>
  );
};

export default Conversation;
