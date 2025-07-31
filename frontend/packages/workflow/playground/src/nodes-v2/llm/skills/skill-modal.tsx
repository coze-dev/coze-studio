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

import { type FC, useRef, useState } from 'react';

import classNames from 'classnames';
import { ModalI18nKey } from '@coze-workflow/components/workflow-modal';
import {
  WorkflowModalFrom,
  useWorkflowModalParts,
} from '@coze-workflow/components';
import { KnowledgeListModalContent } from '@coze-data/knowledge-modal-adapter';
import { I18n } from '@coze-arch/i18n';
import { UITabsModal } from '@coze-arch/bot-semi';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { From } from '@coze-agent-ide/plugin-shared';
import { usePluginModalParts } from '@coze-agent-ide/bot-plugin-export/agentSkillPluginModal/hooks';

import { useGlobalState, useSpaceId, useNodeVersionService } from '@/hooks';

import { isDraftByProjectId } from './utils';
import {
  SkillType,
  type BoundSkills,
  type BoundWorkflowItem,
  type BoundPluginItem,
  type BoundKnowledgeItem,
} from './types';
import {
  SkillKnowledgeSider,
  SkillKnowledgeSiderCategory,
} from './skill-knowledge-sider';

import s from './skill-modal.module.less';

export interface SkillModalProps {
  visible: boolean;
  onSkillsChange: (
    type: SkillType,
    data:
      | Array<BoundWorkflowItem>
      | Array<BoundPluginItem>
      | Array<BoundKnowledgeItem>,
  ) => void;
  boundSkills?: BoundSkills;
  onCancel: () => void;
}

export const SkillModal: FC<SkillModalProps> = props => {
  const { visible, onSkillsChange, boundSkills, onCancel } = props;

  const { projectId, getProjectApi, playgroundProps } = useGlobalState();
  const windowRef = useRef<WindowProxy | null>();
  const spaceID = useSpaceId();

  const nodeVersionService = useNodeVersionService();
  const [category, setCategory] = useState<SkillKnowledgeSiderCategory>(
    SkillKnowledgeSiderCategory.Library,
  );

  // Plugin Add pop-up window
  const pluginModalFrom = projectId
    ? From.ProjectWorkflow
    : From.WorkflowAddNode;

  const getOnSkillsChange = (type: SkillType) => data =>
    onSkillsChange(type, data);

  const [activeKey, setActiveKey] = useState<SkillType>(SkillType.Plugin);
  const pluginModalParts = usePluginModalParts({
    pluginApiList: boundSkills?.pluginFCParam?.pluginList ?? [],
    onPluginApiListChange: getOnSkillsChange(SkillType.Plugin),
    from: pluginModalFrom,
    projectId,
    openModeCallback: async val => {
      if (!val) {
        return;
      }
      if (
        !(await nodeVersionService.addApiCheck(val.plugin_id, val.version_ts))
      ) {
        return;
      }
      onSkillsChange(SkillType.Plugin, [
        ...(boundSkills?.pluginFCParam?.pluginList ?? []),
        {
          plugin_id: val.plugin_id as string,
          api_id: val.api_id as string,
          api_name: val.name as string,
          plugin_version: val.version_ts || '',
          is_draft: isDraftByProjectId(val.project_id),
        },
      ]);
    },
  });

  const sourceTitle = I18n.t('workflow_241119_01');
  const workflowModalParts = useWorkflowModalParts({
    from: projectId
      ? WorkflowModalFrom.ProjectWorkflowAddNode
      : WorkflowModalFrom.WorkflowAddNode,
    projectId,
    workFlowList: (boundSkills?.workflowFCParam?.workflowList ?? []).map(
      item => ({
        workflow_id: item.workflow_id,
        plugin_id: item.plugin_id,
        name: '',
        desc: '',
        parameters: [],
        plugin_icon: '',
      }),
    ),
    onWorkFlowListChange: () => null,
    onAdd: async (val, config) => {
      if (!val) {
        return;
      }
      if (
        !(await nodeVersionService.addSubWorkflowCheck(
          val.workflow_id,
          val.version_name,
        ))
      ) {
        return;
      }
      onSkillsChange(SkillType.Workflow, [
        ...(boundSkills?.workflowFCParam?.workflowList ?? []),
        {
          plugin_id: val.plugin_id,
          workflow_id: val.workflow_id,
          plugin_version: '',
          workflow_version: val.version_name || '',
          is_draft: isDraftByProjectId(val.project_id),
        },
      ]);
    },
    onRemove: val => {
      onSkillsChange(
        SkillType.Workflow,
        (boundSkills?.workflowFCParam?.workflowList ?? []).filter(
          item => item.workflow_id !== val.workflow_id,
        ),
      );
    },
    i18nMap: {
      [ModalI18nKey.ListItemRemove]: {
        key: 'scene_workflow_delete_workflow_button',
        options: { source: sourceTitle },
      },
      [ModalI18nKey.ListItemRemoveConfirmTitle]: {
        key: 'scene_workflow_delete_workflow_popup_title',
        options: { source: sourceTitle },
      },
      [ModalI18nKey.ListItemRemoveConfirmDescription]: {
        key: 'scene_workflow_delete_workflow_popup_subtitle',
        options: { source: sourceTitle },
      },
    },
  });

  const handleKnowledgeListChange = (data: Dataset[]) => {
    onSkillsChange(
      SkillType.Knowledge,
      data?.map(item => ({
        id: item.dataset_id as string,
        name: item.name as string,
      })),
    );
  };

  return (
    <UITabsModal
      visible={visible}
      onCancel={onCancel}
      tabs={{
        tabsProps: {
          lazyRender: true,
          activeKey,
          onChange: (key: string) => setActiveKey(key as SkillType),
        },
        tabPanes: [
          {
            tabPaneProps: {
              tab: I18n.t('Tools'),
              itemKey: SkillType.Plugin,
            },
            content: (
              <div className={s.main}>
                <div className={s.sider}>{pluginModalParts.sider}</div>
                <div className={s.content}>
                  <div className={s.filter}>{pluginModalParts.filter}</div>
                  <div className={s['content-inner']}>
                    {pluginModalParts.content}
                  </div>
                </div>
              </div>
            ),
          },
          {
            tabPaneProps: {
              tab: I18n.t('Workflow'),
              itemKey: SkillType.Workflow,
            },
            content: (
              <div className={s.main}>
                <div className={s.sider}>{workflowModalParts.sider}</div>
                <div className={s.content}>
                  <div className={s.filter}>{workflowModalParts.filter}</div>
                  <div className={s['content-inner']}>
                    {workflowModalParts.content}
                  </div>
                </div>
              </div>
            ),
          },
          {
            tabPaneProps: {
              tab: I18n.t('Datasets'),
              itemKey: SkillType.Knowledge,
            },
            content: (
              <div className={s.main}>
                {projectId ? (
                  <div className={s.sider}>
                    <SkillKnowledgeSider
                      projectId={projectId}
                      category={category}
                      setCategory={setCategory}
                    />
                  </div>
                ) : null}

                <div className={classNames(s.content, s['data-sets-content'])}>
                  <div className={s['content-inner']}>
                    <KnowledgeListModalContent
                      projectID={
                        category === SkillKnowledgeSiderCategory.Project
                          ? projectId
                          : undefined
                      }
                      datasetList={(
                        boundSkills?.knowledgeFCParam?.knowledgeList ?? []
                      ).map(item => ({
                        dataset_id: item.id,
                        name: item.name,
                      }))}
                      onDatasetListChange={handleKnowledgeListChange}
                      beforeCreate={shouldUpload => {
                        if (shouldUpload && !projectId) {
                          windowRef.current = window.open();
                        }
                      }}
                      onClickAddKnowledge={(id, unitType, shouldUpload) => {
                        if (shouldUpload) {
                          if (projectId) {
                            const IDENav = getProjectApi()?.navigate;
                            IDENav?.(
                              `/knowledge/${id}?module=upload&type=${unitType}`,
                            );
                          } else if (windowRef.current) {
                            if (id) {
                              windowRef.current.location = `/space/${spaceID}/knowledge/${id}/upload?type=${unitType}`;
                            } else {
                              windowRef.current.close();
                            }
                          }
                        }
                        if (projectId) {
                          playgroundProps.refetchProjectResourceList?.();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ),
          },
        ],
      }}
    />
  );
};
