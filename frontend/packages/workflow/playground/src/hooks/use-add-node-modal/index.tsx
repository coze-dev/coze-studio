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

import { useRef } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import {
  isSelectProjectCategory,
  useOpenWorkflowDetail,
  useWorkflowModal,
  WorkflowModalFrom,
  type WorkFlowModalModeProps,
} from '@coze-workflow/components';
import { type Workflow } from '@coze-workflow/base/api';
import {
  StandardNodeType,
  WorkflowMode,
  type WorkflowNodeJSON,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Button, Space, Toast, Typography } from '@coze-arch/coze-design';
import { From } from '@coze-agent-ide/plugin-shared';
import { usePluginApisModal } from '@coze-agent-ide/bot-plugin/components/plugin-apis/use-plugin-apis-modal';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { WorkflowEditService } from '@/services';
import { useSpaceId } from '@/hooks/use-space-id';
import { useGlobalState } from '@/hooks/use-global-state';
import { useNodeVersionService } from '@/hooks';

import { createApiNodeInfo, createSubWorkflowNodeInfo } from './helper';

const { Text } = Typography;

/**
 * Result when subprocess, plug-in node is closed
 */
export enum AddNodeModalCloseResult {
  /**
   * Added node successfully
   */
  NodeAdded = 'node-added',
  /**
   * cancel
   */
  Cancel = 'cancel',
  /**
   * Open a new tab for the project
   */
  OpenNewTab = 'new-tab',
}

export type AddNodeCallback = (params: {
  nodeType: StandardNodeType;
  nodeJSON: Partial<WorkflowNodeJSON>;
}) => void;
export const useAddNodeModal = (prevAddNodeRef: {
  current: { x: number; y: number; isDrag: boolean };
}) => {
  const spaceId = useSpaceId();
  const globalState = useGlobalState();
  const playgroundContext = useService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );

  const nodeVersionService = useNodeVersionService();

  const projectApi = globalState.getProjectApi();

  const addNodeCallbackRef = useRef<AddNodeCallback>();
  const onCloseRef = useRef<(result?: AddNodeModalCloseResult) => void>();
  const addNodeModalCloseResultRef = useRef<AddNodeModalCloseResult>();
  const editService = useService<WorkflowEditService>(WorkflowEditService);
  const nodesService = useService<WorkflowNodesService>(WorkflowNodesService);
  const openWorkflowDetail = useOpenWorkflowDetail();
  const createOpenWorkflowModalCallback =
    (isImageflow): WorkFlowModalModeProps['onAdd'] =>
    async (val, config) => {
      if (!val) {
        return false;
      }

      if (
        !(await nodeVersionService.addSubWorkflowCheck(
          val.workflow_id,
          val.version_name,
        ))
      ) {
        return false;
      }

      const { name } = val;

      const templateIcon = playgroundContext.getTemplateList([
        isImageflow ? StandardNodeType.Imageflow : StandardNodeType.SubWorkflow,
      ])?.[0]?.icon_url;

      const nodeJSON = createSubWorkflowNodeInfo({
        workflowItem: val,
        spaceId,
        templateIcon,
        isImageflow,
      });

      const position = {
        clientX: prevAddNodeRef.current.x,
        clientY: prevAddNodeRef.current.y,
      };
      const { isDrag } = prevAddNodeRef.current;

      if (addNodeCallbackRef.current) {
        addNodeCallbackRef.current({
          nodeType: StandardNodeType.SubWorkflow,
          nodeJSON,
        });
      } else {
        // This may fail, the underlying call released_workflows interface
        editService.addNode(
          StandardNodeType.SubWorkflow,
          nodeJSON,
          position,
          isDrag,
        );
      }
      Toast.success({
        content: (
          <Space spacing={6}>
            <Text>
              {isImageflow
                ? I18n.t('workflow_add_imageflow_toast_success', { name })
                : I18n.t('wf_node_add_wf_modal_toast_wf_added', {
                    workflowName: name,
                  })}
            </Text>
            {config.isDup ? (
              <Button
                color="primary"
                onClick={() => {
                  window.open(
                    `/work_flow?space_id=${spaceId}&workflow_id=${val.workflow_id}`,
                  );
                }}
              >
                {I18n.t('workflowstore_continue_editing')}
              </Button>
            ) : null}
          </Space>
        ),
      });
    };

  const openWorkflowModalCallback = createOpenWorkflowModalCallback(false);
  const openImageflowModalCallback = createOpenWorkflowModalCallback(true);
  const onCloseModal = () => {
    onCloseRef.current?.(addNodeModalCloseResultRef.current);
    addNodeModalCloseResultRef.current = undefined;
  };
  //  Workflow Add pop-up window
  const workflowModalFrom = globalState.projectId
    ? WorkflowModalFrom.ProjectWorkflowAddNode
    : WorkflowModalFrom.WorkflowAddNode;
  const {
    node: workflowModal,
    open: openWorkflow,
    close: closeWorkflow,
  } = useWorkflowModal({
    from: workflowModalFrom,
    flowMode: WorkflowMode.Workflow,
    onAdd: openWorkflowModalCallback,
    bindBizId: globalState.config?.bindBizID,
    bindBizType: globalState.config?.bindBizType,
    excludedWorkflowIds: [globalState.workflowId],
    projectId: globalState.projectId,
    onDupSuccess: () => null,
    onClose: onCloseModal,
    onCreateSuccess: val => {
      addNodeModalCloseResultRef.current = AddNodeModalCloseResult.OpenNewTab;
      closeWorkflow();
      if (workflowModalFrom === WorkflowModalFrom.ProjectWorkflowAddNode) {
        globalState.playgroundProps.refetchProjectResourceList?.();
      }
      openWorkflowDetail({
        workflowId: val.workflowId,
        spaceId: val.spaceId,
        projectId: globalState.projectId,
        ideNavigate: projectApi?.navigate,
      });
    },
    onItemClick: ({ item }, modalState) => {
      if (isSelectProjectCategory(modalState)) {
        addNodeModalCloseResultRef.current = AddNodeModalCloseResult.OpenNewTab;
        closeWorkflow();
        projectApi?.navigate?.(`/workflow/${(item as Workflow).workflow_id}`);
        return { handled: true };
      }
      return { handled: false };
    },
  });

  // image stream pop-up
  const {
    node: imageFlowModal,
    open: openImageflow,
    close: closeImageflow,
  } = useWorkflowModal({
    from: WorkflowModalFrom.WorkflowAddNode,
    flowMode: WorkflowMode.Imageflow,
    onAdd: openImageflowModalCallback,
    excludedWorkflowIds: [globalState.workflowId],
    onDupSuccess: () => null,
    onClose: onCloseModal,
  });

  // Plugin Add pop-up window
  const pluginModalFrom = globalState.projectId
    ? From.ProjectWorkflow
    : From.WorkflowAddNode;
  const {
    node: pluginModal,
    open: openPlugin,
    close: closePlugin,
  } = usePluginApisModal({
    from: pluginModalFrom,
    projectId: globalState.projectId,
    closeCallback: onCloseModal,
    clickProjectPluginCallback: pluginInfo => {
      addNodeModalCloseResultRef.current = AddNodeModalCloseResult.OpenNewTab;
      closePlugin();
      projectApi?.navigate(`/plugin/${pluginInfo?.id}`);
    },
    openModeCallback: async val => {
      if (!val) {
        return false;
      }

      if (
        !(await nodeVersionService.addApiCheck(val.plugin_id, val.version_ts))
      ) {
        return false;
      }

      const templateIcon = playgroundContext.getNodeTemplateInfoByType(
        StandardNodeType.Api,
      )?.icon;
      const nodeJSON = createApiNodeInfo(val, templateIcon);
      const position = {
        clientX: prevAddNodeRef.current.x,
        clientY: prevAddNodeRef.current.y,
      };
      const { isDrag } = prevAddNodeRef.current;

      // Plugin panel pop-up - click Add Plugin, request the api-detail interface in advance, get the plugin details, and call the handleSelectNode method of panel.tsx.
      if (addNodeCallbackRef.current) {
        addNodeCallbackRef.current({
          nodeType: StandardNodeType.Api,
          nodeJSON,
        });
      } else {
        // Dragging the "plug-in", or the "subprocess" node itself, will follow the logic here, at which point isDrag is true
        editService.addNode(StandardNodeType.Api, nodeJSON, position, isDrag);
      }
      Toast.success(
        I18n.t('bot_edit_tool_added_toast', {
          api_name: val?.name,
        }) as string,
      );
    },
    onCreateSuccess:
      pluginModalFrom === From.ProjectWorkflow
        ? val => {
            addNodeModalCloseResultRef.current =
              AddNodeModalCloseResult.OpenNewTab;
            closePlugin();
            if (val?.pluginId && pluginModalFrom === From.ProjectWorkflow) {
              globalState.playgroundProps.refetchProjectResourceList?.();
              projectApi?.navigate(`/plugin/${val.pluginId}`);
            }
          }
        : undefined,
  });
  const wrapOpenFunc = function <T>(
    openFunc: (modalProps?: T) => void,
    closeFunc?: () => void,
  ) {
    return ({
      onAdd,
      closeOnAdd,
      onClose,
      modalProps,
    }: {
      onAdd?: AddNodeCallback;
      onClose?: (closeResult?: AddNodeModalCloseResult) => void;
      closeOnAdd?: boolean;
      modalProps?: T;
    } = {}) => {
      if (onAdd) {
        addNodeCallbackRef.current = (...args) => {
          const nodeJSON = args?.[0]?.nodeJSON as WorkflowNodeJSON<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Record<string, any>
          >;
          if (nodeJSON?.data?.nodeMeta?.title) {
            nodeJSON.data.nodeMeta.title = nodesService.createUniqTitle(
              nodeJSON.data.nodeMeta.title,
            );
          }
          addNodeModalCloseResultRef.current =
            AddNodeModalCloseResult.NodeAdded;
          onAdd?.(...args);
          closeOnAdd ? closeFunc?.() : null;
        };
      } else {
        addNodeCallbackRef.current = undefined;
      }
      onCloseRef.current = onClose;
      openFunc?.(modalProps);
    };
  };
  return {
    workflowModal,
    openWorkflow: wrapOpenFunc(openWorkflow, closeWorkflow),

    imageFlowModal,
    openImageflow: wrapOpenFunc(openImageflow, closeImageflow),

    pluginModal,
    openPlugin: wrapOpenFunc(openPlugin, closePlugin),
  };
};
