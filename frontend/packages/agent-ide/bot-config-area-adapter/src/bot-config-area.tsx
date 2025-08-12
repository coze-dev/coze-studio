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

import { type FC } from 'react';

import { ToolMenu } from '@coze-agent-ide/tool';
import { useRiskWarningStore } from '@coze-agent-ide/space-bot/store';
import { CollapsibleIconButtonGroup } from '@coze-studio/components/collapsible-icon-button';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { BotMode, RiskAlertType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { MonetizeConfigButton } from '@coze-agent-ide/bot-config-area';

import { ModelConfigView } from './model-config-view';

export interface BotConfigAreaProps {
  pageFrom?: BotPageFromEnum;
  editable?: boolean;
  modelListExtraHeaderSlot?: React.ReactNode;
}

export const BotConfigArea: FC<BotConfigAreaProps> = ({
  pageFrom,
  editable,
  modelListExtraHeaderSlot,
}) => {
  const mode = useBotInfoStore(state => state.mode);
  const isReadonly = useBotDetailIsReadonly();

  const toolHiddenModeNewbieGuideIsRead = useRiskWarningStore(
    state => state.toolHiddenModeNewbieGuideIsRead,
  );

  const onNewbieGuidePopoverClose = () => {
    useRiskWarningStore.getState().setToolHiddenModeNewbieGuideIsRead(true);
    PlaygroundApi.UpdateUserConfig({
      risk_alert_type: RiskAlertType.NewBotIDEGuide,
    });
  };

  const isSingleLLM = mode === BotMode.SingleMode;
  const isSingleWorkflow = mode === BotMode.WorkflowMode;

  return (
    <div className="flex items-center justify-end gap-[12px] flex-1 overflow-hidden">
      <CollapsibleIconButtonGroup>
        <ModelConfigView
          mode={mode}
          modelListExtraHeaderSlot={modelListExtraHeaderSlot}
        />
        {pageFrom === BotPageFromEnum.Bot && IS_OVERSEA ? (
          <MonetizeConfigButton />
        ) : null}
      </CollapsibleIconButtonGroup>
      {!isReadonly && (isSingleLLM || isSingleWorkflow) ? (
        <ToolMenu
          newbieGuideVisible={!toolHiddenModeNewbieGuideIsRead}
          onNewbieGuidePopoverClose={onNewbieGuidePopoverClose}
          rePosKey={Math.random()}
        />
      ) : null}
    </div>
  );
};
