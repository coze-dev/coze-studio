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

/* eslint-disable complexity */
import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip } from '@coze-arch/coze-design';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { useGlobalState } from '@/hooks';
import { FormCard } from '@/form-extensions/components/form-card';

import {
  SubWorkflowSkillVersion,
  ApiSkillVersion,
} from '../../../components/reference-node-info';
import { WorkflowSetting } from './workflow-setting';
import { isSkillsEmpty, getSkillsQueryParams } from './utils';
import { useQuerySettingDetail } from './use-query-setting-detail';
import { useModelSkillDisabled } from './use-model-skill-disabled';
import {
  SkillType,
  type BoundSkills,
  type BoundWorkflowItem,
  type BoundPluginItem,
  type BoundKnowledgeItem,
  type PluginFCSetting,
  type KnowledgeGlobalSetting,
} from './types';
import { PluginSetting } from './plugin-setting';
import { KnowledgeSetting } from './knowledge-setting';
import { EmptySkill } from './empty-skill';
import { defaultKnowledgeGlobalSetting } from './constants';
import { BoundItemCard } from './bound-item-card';
import { AddSkill } from './add-skill';

interface SkillsProps {
  value?: BoundSkills;
  onChange?: (data: BoundSkills) => void;
}

export const Skills: FC<SkillsProps> = props => {
  const { value = {}, onChange } = props;
  const isEmpty = isSkillsEmpty(value);
  const globalState = useGlobalState();
  const node = useCurrentEntity();
  const readonly = useReadonly();
  const modelSkillDisabled = useModelSkillDisabled();
  const disabledTooltip = modelSkillDisabled
    ? I18n.t('workflow_250310_03', undefined, '该模型不支持绑定技能')
    : '';

  const { data: skillsDetail, refetch } = useQuerySettingDetail({
    workflowId: globalState.workflowId,
    spaceId: globalState.spaceId,
    nodeId: node.id,
    ...getSkillsQueryParams(value),
  });

  const handleSkillsChange = (
    type: SkillType,
    data:
      | Array<BoundWorkflowItem>
      | Array<BoundPluginItem>
      | Array<BoundKnowledgeItem>,
  ) => {
    if (type === SkillType.Plugin) {
      onChange?.({
        ...value,
        pluginFCParam: {
          pluginList: data as Array<BoundPluginItem>,
        },
      });
    } else if (type === SkillType.Workflow) {
      onChange?.({
        ...value,
        workflowFCParam: {
          workflowList: data as Array<BoundWorkflowItem>,
        },
      });
    } else if (type === SkillType.Knowledge) {
      onChange?.({
        ...value,
        knowledgeFCParam: {
          ...value.knowledgeFCParam,
          knowledgeList: data as Array<BoundKnowledgeItem>,
          global_setting:
            value.knowledgeFCParam?.global_setting ??
            defaultKnowledgeGlobalSetting,
        },
      });
    }

    // The onChange value passing of the form is asynchronous, so there is a delay here
    setTimeout(() => {
      refetch();
    }, 10);
  };

  const handleRemovePlugin = (plugin: BoundPluginItem) => () => {
    onChange?.({
      ...value,
      pluginFCParam: {
        pluginList: value?.pluginFCParam?.pluginList?.filter(
          item => item.api_id !== plugin.api_id,
        ),
      },
    });
  };

  const handleRemoveWorkflow = (workflow: BoundWorkflowItem) => () => {
    onChange?.({
      ...value,
      workflowFCParam: {
        workflowList: value?.workflowFCParam?.workflowList?.filter(
          item => item.workflow_id !== workflow.workflow_id,
        ),
      },
    });
  };

  const handleRemoveKnowledge = (knowledge: BoundKnowledgeItem) => () => {
    onChange?.({
      ...value,
      knowledgeFCParam: {
        knowledgeList: value?.knowledgeFCParam?.knowledgeList?.filter(
          item => item.id !== knowledge.id,
        ),
      },
    });
  };

  const handlePluginItemSettingChange =
    (plugin: BoundPluginItem) => (setting: PluginFCSetting | undefined) => {
      onChange?.({
        ...value,
        pluginFCParam: {
          pluginList: value.pluginFCParam?.pluginList?.map(item => {
            if (item.api_id === plugin.api_id) {
              return {
                ...item,
                fc_setting: setting,
              };
            } else {
              return item;
            }
          }),
        },
      });
    };

  const handleWorkflowItemSettingChange =
    (workflow: BoundWorkflowItem) => (setting: PluginFCSetting | undefined) => {
      onChange?.({
        ...value,
        workflowFCParam: {
          workflowList: value.workflowFCParam?.workflowList?.map(item => {
            if (item.workflow_id === workflow.workflow_id) {
              return {
                ...item,
                fc_setting: setting,
              };
            } else {
              return item;
            }
          }),
        },
      });
    };

  const handleKnowledgeGlobalSettingChange = (
    setting: KnowledgeGlobalSetting | undefined,
  ) => {
    onChange?.({
      ...value,
      knowledgeFCParam: {
        ...value?.knowledgeFCParam,
        global_setting: setting,
      },
    });
  };

  return (
    <FormCard
      header={I18n.t('chatflow_agent_skill_name')}
      actionButton={
        readonly ? null : (
          <AddSkill
            boundSkills={value}
            onSkillsChange={handleSkillsChange}
            disabledTooltip={disabledTooltip}
          />
        )
      }
    >
      {isEmpty ? <EmptySkill /> : null}
      {value.pluginFCParam?.pluginList?.map(item => {
        const pluginDetail = skillsDetail?.plugin_detail_map?.[item.plugin_id];
        const apiDetail = skillsDetail?.plugin_api_detail_map?.[item.api_id];
        const title =
          pluginDetail && apiDetail
            ? `${pluginDetail?.name} / ${apiDetail?.name}`
            : '';

        return (
          <BoundItemCard
            title={title}
            pasteTitle={apiDetail?.name}
            description={apiDetail?.description}
            iconUrl={pluginDetail?.icon_url}
            onRemove={handleRemovePlugin(item)}
            params={apiDetail?.parameters ?? []}
            readonly={readonly}
            hideActions={modelSkillDisabled}
            versionRender={
              <div className="flex gap-1">
                <ApiSkillVersion
                  versionTs={item.plugin_version}
                  versionName={pluginDetail?.version_name}
                  latestVersionName={pluginDetail?.latest_version_name}
                  latestVersionTs={pluginDetail?.latest_version_ts}
                  pluginId={item.plugin_id}
                />
                {disabledTooltip ? (
                  <Tooltip content={disabledTooltip}>
                    <Tag size="mini" color="yellow">
                      {I18n.t('workflow_250310_02', undefined, '已失效')}
                    </Tag>
                  </Tooltip>
                ) : null}
              </div>
            }
            settingRender={
              <PluginSetting
                {...item}
                setting={item.fc_setting}
                onChange={handlePluginItemSettingChange(item)}
              />
            }
          />
        );
      })}
      {value.workflowFCParam?.workflowList?.map(item => {
        const detail = skillsDetail?.workflow_detail_map?.[item.workflow_id];
        return (
          <BoundItemCard
            title={detail?.name ?? ''}
            description={detail?.description}
            iconUrl={detail?.icon_url}
            onRemove={handleRemoveWorkflow(item)}
            params={detail?.api_detail?.parameters ?? []}
            versionRender={
              <SubWorkflowSkillVersion
                versionName={item.workflow_version}
                latestVersionName={detail?.latest_version_name}
                workflowId={item.workflow_id}
              />
            }
            settingRender={
              <WorkflowSetting
                {...item}
                setting={item.fc_setting}
                onChange={handleWorkflowItemSettingChange(item)}
              />
            }
          />
        );
      })}
      {value.knowledgeFCParam?.knowledgeList?.map(item => {
        const detail = skillsDetail?.dataset_detail_map?.[item.id];
        return (
          <BoundItemCard
            title={detail?.name ?? ''}
            iconUrl={detail?.icon_url}
            onRemove={handleRemoveKnowledge(item)}
            settingRender={
              <KnowledgeSetting
                setting={value.knowledgeFCParam?.global_setting}
                onChange={handleKnowledgeGlobalSettingChange}
              />
            }
          />
        );
      })}
    </FormCard>
  );
};
