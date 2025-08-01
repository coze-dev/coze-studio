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

import { useState, useEffect } from 'react';

import { type WsMessageProps } from '@coze-project-ide/framework/src/types';
import {
  useIDEService,
  ErrorService,
  LayoutRestorer,
  useIDENavigate,
  useCommitVersion,
  useWsListener,
  useGetUIWidgetFromId,
  getURIPathByPathname,
} from '@coze-project-ide/framework';
import {
  BizResourceTypeEnum,
  ProjectResourceGroupType,
  usePrimarySidebarStore,
} from '@coze-project-ide/biz-components';
import {
  MessageBizType,
  MessageOperateType,
} from '@coze-arch/idl/workflow_api';
import { useFlags } from '@coze-arch/bot-flags';

import { type LayoutRestoreService } from '../../plugins/create-app-plugin/layout-restore-service';

const leftPanelResourceType = [
  MessageBizType.Database,
  MessageBizType.Dataset,
  MessageBizType.Plugin,
  MessageBizType.Workflow,
];

/**
 * IDE global logic processing
 */
export const GlobalHandler = ({
  spaceId,
  projectId,
}: {
  spaceId: string;
  projectId: string;
}) => {
  const [error, setError] = useState(false);
  const navigate = useIDENavigate();
  const errorService = useIDEService<ErrorService>(ErrorService);
  const restoreService = useIDEService<LayoutRestoreService>(LayoutRestorer);
  const { version } = useCommitVersion();
  const [FLAGS] = useFlags();
  const path = getURIPathByPathname(window.location.pathname);

  if (error) {
    throw new Error('project ide global handler error');
  }

  const fetchResource = usePrimarySidebarStore(state => state.fetchResource);
  const refetchResource = usePrimarySidebarStore(state => state.refetch);

  const [workflowId, setWorkflowId] = useState('');
  const [refreshKey, setRefreshKey] = useState('');
  const widget = useGetUIWidgetFromId(
    `/${BizResourceTypeEnum.Workflow}/${workflowId}`,
  );

  useEffect(() => {
    if (!workflowId) {
      return;
    }

    refetchResource(tree => {
      const workflowResource =
        tree?.find(
          group => group.groupType === ProjectResourceGroupType.Workflow,
        )?.resourceList || [];
      const nextName = workflowResource?.find(
        workflow => workflow.id === workflowId,
      )?.name;
      if (nextName && widget) {
        widget.context.widget?.setTitle(nextName);
      }
    });
  }, [workflowId, widget, refreshKey]);

  useWsListener((props: WsMessageProps) => {
    if (
      // Support soon, so stay tuned.
      !FLAGS['bot.automation.project_multi_tab'] ||
      !leftPanelResourceType.includes(props.bizType)
    ) {
      return;
    }

    const isUpdateOperate = props.operateType === MessageOperateType.Update;
    const isRollbackProject = props?.extra?.Scene === 'RollbackProject';
    if (isUpdateOperate && isRollbackProject) {
      window.location.reload();
      return;
    }

    const isCreateOperate = props.operateType === MessageOperateType.Create;
    // Just create workflow and refresh the resource list
    const isCreateWorkflow = props?.extra?.methodName === 'CreateWorkflow';
    // The encapsulation and unsealing scene needs to refresh the resource list.
    const isEncapsulateWorkflow =
      props?.extra?.methodName === 'EncapsulateWorkflow';

    if (isCreateOperate && (isCreateWorkflow || isEncapsulateWorkflow)) {
      refetchResource();
      return;
    }

    if (!props?.resId) {
      return;
    }
    setWorkflowId(props?.resId);
    setRefreshKey(new Date().getTime().toString());
  });

  useEffect(() => {
    fetchResource(spaceId, projectId, version, tree => {
      const workflowResource =
        (tree || []).find(
          group => group.groupType === ProjectResourceGroupType.Workflow,
        )?.resourceList || [];
      const firstWorkflow = workflowResource?.[0];
      if (!path && restoreService.openFirstWorkflow && firstWorkflow) {
        navigate(`/workflow/${firstWorkflow.id}`);
        restoreService.openFirstWorkflow = false;
      }
    });
  }, [spaceId, projectId]);

  useEffect(() => {
    const errorListener = errorService.onError(() => {
      setError(true);
    });
    return () => {
      errorListener?.dispose();
    };
  }, []);

  return null;
};
