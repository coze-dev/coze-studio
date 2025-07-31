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

import React, { useState, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classnames from 'classnames';
import {
  useSpaceId,
  useProjectId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import {
  useWorkflowResource,
  ResourceRefTooltip,
} from '@coze-project-ide/biz-workflow';
import {
  useResourceList,
  usePrimarySidebarStore,
} from '@coze-project-ide/biz-components';
import { I18n } from '@coze-arch/i18n';
import {
  WorkflowStorageType,
  type DependencyTree,
} from '@coze-arch/bot-api/workflow_api';
import { workflowApi } from '@coze-arch/bot-api';
import { IconCozCross, IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import {
  Modal,
  Button,
  Tooltip,
  Loading,
  Typography,
} from '@coze-arch/coze-design';

import { ResourceContent } from './resource-content';

import s from './styles.module.less';

const { Text } = Typography;

const DEFAULT_DATA = {
  node_list: [],
};

export const ResourceTreeModal = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: (v: boolean) => void;
}) => {
  const { selectedResource } = usePrimarySidebarStore(
    useShallow(store => ({
      selectedResource: store.selectedResource,
    })),
  );
  const { workflowResource } = useResourceList();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DependencyTree>(DEFAULT_DATA);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(
    selectedResource || workflowResource?.[0]?.id,
  );
  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const { version } = useCommitVersion();
  const { iconRender } = useWorkflowResource();
  const handleClose = () => {
    setModalVisible(false);
  };
  const handleSwitchWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
  };

  const getWorkflowDep = async (id: string) => {
    setLoading(true);
    const res = await workflowApi.DependencyTree({
      type: WorkflowStorageType.Project,
      project_info: {
        workflow_id: id,
        space_id: spaceId,
        project_id: projectId,
        draft: version ? false : true,
        project_version: version ? version : undefined,
      },
    });
    // Compatibility Request first and then return to the scene
    if (selectedWorkflowId === id) {
      setData(res?.data || DEFAULT_DATA);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedWorkflowId) {
      getWorkflowDep(selectedWorkflowId);
    }
  }, [selectedWorkflowId]);

  const handleRetry = () => {
    getWorkflowDep(selectedWorkflowId);
  };

  return (
    <Modal
      className={s.modal}
      visible={modalVisible}
      type="dialog"
      hasScroll={false}
    >
      <div className={s['modal-container']}>
        <div className={s['workflow-list']}>
          <div className={s['list-header-container']}>
            {I18n.t('reference_graph_modal_title')}
            <Tooltip theme="dark" content={<ResourceRefTooltip />}>
              <IconCozInfoCircle color="secondary" fontSize={16} />
            </Tooltip>
          </div>
          <div
            style={{
              height: 0,
              flexGrow: 1,
            }}
          >
            <div className={s['list-title']}>
              {I18n.t(
                'reference_graph_modal_subtitle_view_relationship_given_workflow',
              )}
            </div>
            <div className={s.list}>
              {workflowResource.map(workflow => (
                <div
                  className={classnames(
                    s['list-item'],
                    selectedWorkflowId === workflow.id && s.selected,
                  )}
                  key={workflow.id}
                  onClick={() => handleSwitchWorkflow(workflow.id)}
                >
                  {iconRender?.({ resource: workflow })}
                  <Text
                    ellipsis={{
                      showTooltip: {
                        type: 'tooltip',
                        opts: {
                          position: 'right',
                          theme: 'dark',
                        },
                      },
                    }}
                  >
                    {workflow.name}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={s['resource-tree-container']}>
          {loading ? (
            <div className={s['loading-container']}>
              <Loading
                loading
                size="large"
                color="default"
                className={s.loading}
              />
            </div>
          ) : (
            <ResourceContent
              data={data}
              spaceId={spaceId}
              projectId={projectId}
              onRetry={handleRetry}
            />
          )}
        </div>
        <Button
          className={s['close-icon']}
          color="secondary"
          size="large"
          onClick={handleClose}
        >
          <IconCozCross fontSize={20} />
        </Button>
      </div>
    </Modal>
  );
};
