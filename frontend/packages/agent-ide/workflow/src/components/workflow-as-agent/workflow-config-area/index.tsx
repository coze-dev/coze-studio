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

import { useEffect, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useSafeState } from 'ahooks';
import { useWorkflowPublishedModel } from '@coze-agent-ide/space-bot/hook';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  type WorkFlowItemType,
  useBotDetailIsReadonly,
} from '@coze-studio/bot-detail-store';
import { useReportTti } from '@coze-arch/report-tti';
import { PluginType, WorkflowMode } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { CustomError } from '@coze-arch/bot-error';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { WorkflowCard } from '@coze-agent-ide/workflow-as-agent-adapter';

import { useBotWorkFlowListModal } from './use-agent-workflow-modal';
const addCardStyle = classNames(
  'w-full h-[120px]',
  'flex items-center justify-center gap-[8px]',
  'border border-solid coz-stroke-primary rounded-[10px]',
  'coz-mg-hglt hover:coz-mg-hglt-hovered active:coz-mg-hglt-pressed',
);

export const WorkflowConfigArea: FC = () => {
  const isReadonly = useBotDetailIsReadonly();
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );
  const { workflowId, pluginId } = useBotSkillStore(
    useShallow(state => ({
      workflowId: state.layoutInfo.workflow_id,
      pluginId: state.layoutInfo.plugin_id,
    })),
  );
  const [workflow, setWorkflow] = useSafeState<WorkFlowItemType | undefined>();

  const onChange = (value: WorkFlowItemType | undefined) => {
    setWorkflow(value);
    useBotSkillStore.getState().updateSkillLayoutInfo({
      workflow_id: value?.workflow_id,
      plugin_id: value?.plugin_id,
    });
  };

  const flowMode = WorkflowMode.ChatFlow;
  const { node, open } = useBotWorkFlowListModal({
    flowMode,
    workflow,
    setWorkflow: onChange,
  });

  useWorkflowPublishedModel({
    flowMode,
    addedWorkflows: workflow ? [workflow] : [],
    onOk: val => {
      onChange(val);
    },
  });

  useEffect(() => {
    if (
      workflow?.workflow_id !== workflowId ||
      workflow?.plugin_id !== pluginId
    ) {
      if (workflowId && pluginId) {
        PluginDevelopApi.GetPlaygroundPluginList({
          space_id: useBotInfoStore.getState().space_id ?? '',
          page: 1,
          size: 1,
          plugin_ids: [pluginId],
          plugin_types: [PluginType.WORKFLOW],
        }).then(resp => {
          const pluginInfos = resp.data?.plugin_list ?? [];
          const target = pluginInfos?.at(0);
          if (target) {
            setWorkflow({
              workflow_id: workflowId || '',
              plugin_id: pluginId || '',
              name: target?.name || '',
              desc: target?.desc_for_human || '',
              parameters: target?.plugin_apis?.at(0)?.parameters ?? [],
              plugin_icon: target?.plugin_icon || '',
              flow_mode:
                target?.plugin_type === PluginType.IMAGEFLOW
                  ? WorkflowMode.Imageflow
                  : flowMode,
            });
          } else {
            throw new CustomError(
              'normal_error',
              'workflow_as_agent_workflow_not_found',
            );
          }
        });
      } else {
        setWorkflow(undefined);
      }
    }
  }, [workflowId, pluginId]);

  useReportTti({
    isLive: true,
    extra: {
      mode: 'single-agent-workflow',
    },
  });

  return (
    <>
      {node}
      <div>
        <div className="text-[14px] font-[500] leading-[20px] coz-fg-plus">
          {I18n.t('workflow_agent_configure')}
        </div>
        <div className="mt-[16px]">
          {workflow ? (
            <WorkflowCard
              botId={botId ?? ''}
              workflow={workflow}
              onRemove={() => {
                onChange(undefined);
              }}
              isReadonly={isReadonly}
            />
          ) : (
            <div
              className={classNames(
                addCardStyle,
                isReadonly
                  ? 'coz-fg-hglt-dim cursor-not-allowed'
                  : 'coz-fg-hglt cursor-pointer',
              )}
              onClick={() => {
                if (!isReadonly) {
                  open();
                }
              }}
            >
              <IconCozPlus className="text-[18px]" />
              <div className="text-[16px] leading-[22px] font-[500]">
                {I18n.t('workflow_agent_add')}
              </div>
            </div>
          )}
        </div>
        <div className="mt-[16px] text-[12px] leading-[16px] coz-fg-secondary">
          {I18n.t('wf_chatflow_132')}
        </div>
      </div>
    </>
  );
};
