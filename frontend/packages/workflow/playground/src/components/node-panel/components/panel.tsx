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

import {
  type FC,
  useRef,
  useMemo,
  useEffect,
  type MouseEvent,
  type RefObject,
} from 'react';

import { get, set } from 'lodash-es';
import type { NodePanelRenderProps } from '@flowgram-adapter/free-layout-editor';
import {
  usePlayground,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';
import { reporter } from '@coze-arch/logger';
import { handlePluginRiskWarning } from '@coze-agent-ide/plugin-risk-warning';
import { Popover } from '@coze-arch/coze-design';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import {
  isPluginApiNodeTemplate,
  isPluginCategoryNodeTemplate,
  isSubWorkflowNodeTemplate,
} from '@/utils';
import {
  type AddNodePanelProps,
  type UnionNodeTemplate,
  type PluginCategoryNodeTemplate,
} from '@/typing';
import { getNodeV2Registry } from '@/nodes-v2';
import { useTemplateService } from '@/hooks/use-template-service';
import {
  type AddNodeCallback,
  AddNodeModalCloseResult,
} from '@/hooks/use-add-node-modal';
import { useDependencyEntity } from '@/hooks';
import { useAddNodeModalContext } from '@/contexts/add-node-modal-context';

import { NodePlaceholder } from './node-placeholder';
import { NodeList, type NodeListRefType } from './list';

export const NodePanel: FC<NodePanelRenderProps> = props => {
  const { onSelect, position, onClose, containerNode } = props;
  const context = useService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );

  const onSelectAsync = async ({
    nodeType,
    selectEvent,
    nodeJSON,
  }: {
    nodeType: StandardNodeType;
    nodeJSON?: WorkflowNodeJSON;
    selectEvent: React.MouseEvent;
  }) => {
    const nodeV2Registry = getNodeV2Registry(nodeType);

    try {
      await nodeV2Registry?.onInit?.(nodeJSON as WorkflowNodeJSON, context);
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_registry_v2_on_init_error',
        namespace: 'workflow',
        error,
      });
    }

    onSelect({
      nodeType,
      selectEvent,
      nodeJSON,
    });
  };

  const panelProps = props.panelProps as AddNodePanelProps;
  const playground = usePlayground();
  // Node is being added, when true, closing the node panel is not allowed
  const isAddingNodeRef = useRef(false);
  const { openPlugin, openWorkflow, openImageflow, updateAddNodePosition } =
    useAddNodeModalContext();

  const templateState = useTemplateService();
  const dependencyEntity = useDependencyEntity();

  const adaptiveHeight = useMemo(() => {
    const docHeight = document.body.clientHeight;
    let targetHeight: number;
    const MAXMIUM_HEIGHT = 580;
    const ADD_NODE_BTN_TOP = 32 + 24 + 8;
    if (panelProps.fromAddNodeBtn) {
      targetHeight = Math.min(MAXMIUM_HEIGHT, docHeight - ADD_NODE_BTN_TOP);
    } else {
      const positionRelToWindow = playground.config.toFixedPos(position);
      const topHeight = positionRelToWindow.y;
      const bottomHeight = document.body.clientHeight - topHeight;
      targetHeight = Math.min(
        MAXMIUM_HEIGHT,
        Math.max(topHeight, bottomHeight),
      );
    }
    // When the maximum height is met, the height is not specified, and it is automatically stretched by the element
    if (targetHeight === MAXMIUM_HEIGHT) {
      return MAXMIUM_HEIGHT;
    }
    return targetHeight;
  }, [position, playground, panelProps.fromAddNodeBtn]);

  const nodeListRef = useRef<NodeListRefType>();
  const nodesService = useService<WorkflowNodesService>(WorkflowNodesService);

  const handleSelectNode = async ({
    event,
    nodeTemplate,
  }: {
    event: MouseEvent<HTMLElement>;
    nodeTemplate: UnionNodeTemplate;
  }) => {
    const { type: nodeType } = nodeTemplate;
    if (
      isPluginApiNodeTemplate(nodeTemplate) ||
      isSubWorkflowNodeTemplate(nodeTemplate)
    ) {
      if (nodeType === StandardNodeType.Api) {
        handlePluginRiskWarning();
      }
      const { nodeJSON } = nodeTemplate;
      const nodeTitle = get(nodeJSON, 'data.nodeMeta.title');
      if (nodeTitle) {
        set(
          nodeJSON,
          'data.nodeMeta.title',
          nodesService.createUniqTitle(nodeTitle),
        );
      }
      await onSelectAsync({
        nodeType,
        selectEvent: event,
        nodeJSON: nodeJSON as WorkflowNodeJSON,
      });
      return;
    }

    if (
      nodeType &&
      [
        StandardNodeType.Api,
        StandardNodeType.SubWorkflow,
        StandardNodeType.Imageflow,
      ].includes(nodeType as StandardNodeType)
    ) {
      updateAddNodePosition?.({ ...position, isDrag: false });
      const onAdd: AddNodeCallback = async ({ nodeJSON }) => {
        await onSelectAsync({
          nodeType,
          selectEvent: event,
          nodeJSON: nodeJSON as WorkflowNodeJSON,
        });
        isAddingNodeRef.current = false;
      };
      const onCloseModal = closeResult => {
        isAddingNodeRef.current = false;
        if (closeResult === AddNodeModalCloseResult.OpenNewTab) {
          handleClose();
        } else if (nodeType === StandardNodeType.Api) {
          nodeListRef.current?.refetch();
        }
      };

      isAddingNodeRef.current = true;
      if (nodeType === StandardNodeType.Api) {
        handlePluginRiskWarning();
        let categoryInfo:
          | PluginCategoryNodeTemplate['categoryInfo']
          | undefined;
        if (isPluginCategoryNodeTemplate(nodeTemplate)) {
          categoryInfo = nodeTemplate.categoryInfo;
        }
        openPlugin?.({
          onAdd,
          onClose: onCloseModal,
          closeOnAdd: !panelProps?.enableModalMultiAdd,
          modalProps: {
            initQuery: {
              type: categoryInfo?.categoryId,
              isOfficial: categoryInfo?.onlyOfficial ? true : undefined,
            },
          },
        });
      } else {
        ({
          [StandardNodeType.Imageflow]: openImageflow,
          [StandardNodeType.SubWorkflow]: openWorkflow,
        })[nodeType]?.({
          onAdd,
          onClose: onCloseModal,
          closeOnAdd: !panelProps?.enableModalMultiAdd,
        });
      }
    } else {
      await onSelectAsync({ nodeType, selectEvent: event });
    }
  };

  const handleClose = () => {
    if (isAddingNodeRef.current) {
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!panelProps.enableScrollClose) {
      // Do not listen for scroll events when scrolling off is not enabled
      return;
    }
    const disposer = playground.onScroll(() => {
      handleClose();
    });
    return () => disposer.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- custom
  }, [panelProps, playground]);

  useEffect(() => {
    const disposable = templateState.onPreviewUpdated(({ previewVisible }) => {
      if (previewVisible) {
        handleClose();
      }
    });

    return () => {
      disposable?.dispose?.();
    };
  }, [templateState]);

  useEffect(() => {
    //Close the new button popover when refreshing the pop-up window display
    if (dependencyEntity?.refreshModalVisible) {
      handleClose();
    }
  }, [dependencyEntity?.refreshModalVisible]);

  return (
    <Popover
      visible={true}
      showArrow={false}
      trigger="custom"
      position="bottomLeft"
      motion={false}
      onClickOutSide={e => {
        const isClickAnchor = panelProps.anchorElement
          ? Boolean(
              (e.target as HTMLDivElement).closest(panelProps.anchorElement),
            )
          : false;
        if (!isClickAnchor) {
          handleClose();
        }
      }}
      onEscKeyDown={handleClose}
      style={{
        borderRadius: 'var(--coze-12)',
        boxShadow:
          '0 2px 6px 0 rgba(var(--coze-shadow-0),.04),0 4px 12px 0 rgba(var(--coze-shadow-0),.02)',
        border: '1px solid var(--coz-stroke-primary)',
        padding: 0,
        background: 'var(--coz-bg-plus)',
      }}
      zIndex={999}
      content={
        <NodeList
          ref={nodeListRef as RefObject<NodeListRefType>}
          adaptiveHeight={adaptiveHeight}
          enableDrag={panelProps?.enableDrag}
          onSelect={handleSelectNode}
          containerNode={containerNode}
          onAddingNode={isAdding => (isAddingNodeRef.current = isAdding)}
        />
      }
    >
      <div
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          transform: panelProps.enableNodePlaceholder
            ? 'translateY(-50%)'
            : undefined,
          zIndex: 999,
        }}
      >
        {panelProps.enableNodePlaceholder ? <NodePlaceholder /> : null}
      </div>
    </Popover>
  );
};
