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

import { type FC, type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import copy from 'copy-to-clipboard';
import { ToolItem, ToolItemList } from '@coze-agent-ide/tool';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { SceneType } from '@coze-arch/bot-hooks';
import { CustomError } from '@coze-arch/bot-error';
import { getApiUniqueId } from '@coze-agent-ide/plugin-shared';
import { useNavigateWorkflowEditPage } from '@coze-agent-ide/navigate';
import { Toast } from '@coze-arch/coze-design';

import { useNavigateWorkflowOrBlockwise } from '../../hooks/use-navigate-workflow';
import { Actions } from './workflow-item-actions';

export type RenderSlotParameters = WorkFlowItemType & {
  apiUniqueId: string;
};

export interface ActionsCallback {
  handleCopy: (text: string) => void;
}

export interface WorkflowItemProps {
  list: Array<WorkFlowItemType | undefined>;
  removeWorkFlow: (index: number) => void;
  isReadonly?: boolean;
  pageFrom?: BotPageFromEnum;
  size?: 'default' | 'large';
  sceneType?: SceneType;
  renderToolItemIcon?: (parameters: RenderSlotParameters) => ReactNode;
  renderActionSlot?: (
    parameters: RenderSlotParameters & ActionsCallback,
  ) => ReactNode;
}

export const WorkFlowItemCozeDesign: FC<WorkflowItemProps> = ({
  list,
  removeWorkFlow,
  isReadonly,
  size = 'default',
  sceneType = SceneType.BOT__VIEW__WORKFLOW,
  renderActionSlot,
  renderToolItemIcon,
}) => {
  const handleCopy = (text: string) => {
    try {
      const res = copy(text);
      if (!res) {
        throw new CustomError(
          ReportEventNames.parmasValidation,
          'empty content',
        );
      }
      Toast.success({
        content: I18n.t('copy_success'),
        showClose: false,
        id: 'workflow_copy_id',
      });
    } catch {
      Toast.warning({
        content: I18n.t('copy_failed'),
        showClose: false,
      });
    }
  };

  const { spaceID } = useSpaceStore(
    useShallow(state => ({
      spaceID: state.space.id,
    })),
  );

  const navigateParams = { newWindow: true, spaceID };
  const onNavigate2Edit = useNavigateWorkflowEditPage(
    navigateParams,
    sceneType,
  );
  const { navigateToWorkflow } = useNavigateWorkflowOrBlockwise({
    onNavigate2Edit,
    spaceID,
  });

  return (
    <ToolItemList>
      {list
        .filter((p): p is WorkFlowItemType => Boolean(p))
        .map((item, index) => {
          const apiUniqueId = getApiUniqueId({ apiInfo: item });

          return (
            <ToolItem
              title={item?.name ?? ''}
              description={item?.desc ?? ''}
              avatar={item?.plugin_icon ?? ''}
              icons={renderToolItemIcon?.({
                ...item,
                apiUniqueId,
              })}
              actions={
                <Actions
                  index={index}
                  item={item}
                  removeWorkFlow={removeWorkFlow}
                  isReadonly={isReadonly}
                  slot={renderActionSlot?.({
                    ...item,
                    apiUniqueId,
                    handleCopy,
                  })}
                />
              }
              onClick={() => navigateToWorkflow(item?.workflow_id)}
              size={size}
            />
          );
        })}
    </ToolItemList>
  );
};
