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

import { type FC, useState, useCallback, useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconButton,
  Typography,
  SideSheet,
} from '@coze-arch/coze-design';
import { IconCloseNoCycle } from '@coze-arch/bot-icons';

import { AgentHistoryList } from './agent-history-list';

interface AgentHistoryDrawerProps {
  spaceId: string;
  botId: string;
  visible: boolean;
  onClose?: () => void;
}

export const AgentHistoryDrawer: FC<AgentHistoryDrawerProps> = ({
  spaceId,
  botId,
  visible,
  onClose,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>('current');

  // 每次打开抽屉时将高亮重置为“当前”，避免保留上次选择的历史版本
  useEffect(() => {
    if (visible) {
      setSelectedVersion('current');
    }
  }, [visible]);

  return (
    <SideSheet
      visible={visible}
      onCancel={onClose}
      placement="right"
      width={540}
      headerStyle={{ display: 'none' }}
      bodyStyle={{ padding: '0' }}
      mask={false}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px]">
          <Typography.Title heading={5} style={{ margin: 0 }}>
            {I18n.t('workflow_publish_multibranch_viewhistory')}
          </Typography.Title>
          <div className="flex items-center gap-2">
            <IconButton
              icon={<IconCloseNoCycle />}
              onClick={onClose}
              color="secondary"
              size="small"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AgentHistoryList
            spaceId={spaceId}
            botId={botId}
            activeTab="publish"
            selectedVersion={selectedVersion}
            onVersionSelect={setSelectedVersion}
          />
        </div>
      </div>
    </SideSheet>
  );
};
