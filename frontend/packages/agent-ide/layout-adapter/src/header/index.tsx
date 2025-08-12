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

import { useShallow } from 'zustand/react/shallow';
import { Divider } from '@coze-arch/bot-semi';
import { DuplicateBot } from '@coze-studio/components';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import {
  type BotHeaderProps,
  DeployButton,
  MoreMenuButton,
  OriginStatus,
} from '@coze-agent-ide/layout';

export type HeaderAddonAfterProps = Omit<
  BotHeaderProps,
  'modeOptionList' | 'deployButton'
>;

export const HeaderAddonAfter: React.FC<HeaderAddonAfterProps> = ({
  isEditLocked,
}) => {
  const isReadonly = useBotDetailIsReadonly();
  const editable = usePageRuntimeStore(state => state.editable);
  const { botId, botInfo } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      botInfo: state,
    })),
  );
  return (
    <div className="flex items-center gap-2">
      {/** 3.1 State Zone */}
      <div className="flex items-center gap-2">
        {/*  3.1.1 Draft Status | Collaboration Status */}
        {!isReadonly ? <OriginStatus /> : null}
      </div>
      {/** TODO: hzf implicitly associated button, which can be extracted later */}
      {editable ? (
        <Divider layout="vertical" style={{ height: '20px' }} />
      ) : null}
      {/** 3.2 Button area */}
      <div className="flex items-center gap-2">
        {!isEditLocked ? (
          <>
            <div className="flex items-center gap-2">
              {/** Function button area */}
              <MoreMenuButton />
            </div>
            {/** Submit post related button */}
            <div className="flex items-center gap-2">
              {editable ? <DeployButton /> : null}
              {!editable && botInfo && botId ? (
                <DuplicateBot botID={botId} />
              ) : null}
              <div id="diff-task-button-container"></div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
