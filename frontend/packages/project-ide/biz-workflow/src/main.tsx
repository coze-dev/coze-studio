import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  WorkflowPlayground,
  type WorkflowGlobalStateEntity,
  type WorkflowPlaygroundRef,
} from '@coze-workflow/playground';
import type { WsMessageProps } from '@coze-project-ide/framework/src/types';
import {
  useSpaceId,
  useProjectId,
  useCommitVersion,
  useCurrentWidgetContext,
  useCurrentWidget,
  type ProjectIDEWidget,
  useWsListener,
} from '@coze-project-ide/framework';
import {
  CustomResourceFolderShortcutService,
  usePrimarySidebarStore,
} from '@coze-project-ide/biz-components';
import { useFlags } from '@coze-arch/bot-flags';

import { useRefresh } from './hooks/use-refresh';
import { useProjectApi, useListenWFMessageEvent } from './hooks';

const Main = () => {
  const workflowRef = useRef<WorkflowPlaygroundRef>(null);
  const spaceId = useSpaceId();
  const projectId = useProjectId();
  const { version: commitVersion } = useCommitVersion();
  const [FLAGS] = useFlags();

  const refetchProjectResourceList = usePrimarySidebarStore(
    state => state.refetch,
  );
  const { uri, widget: uiWidget } = useCurrentWidgetContext();
  const widget = useCurrentWidget<ProjectIDEWidget>();

  const workflowId = useMemo(() => uri?.displayName, [uri]);

  const getProjectApi = useProjectApi();

  const handleInit = useCallback(
    (workflowState: WorkflowGlobalStateEntity) => {
      const name = workflowState.info?.name;
      if (name) {
        uiWidget.setTitle(name);
        uiWidget.setUIState('normal');
      }
      uiWidget.setIconType(String(workflowState.flowMode));
    },
    [uiWidget],
  );

  const handleReload = () => {
    widget.refresh();
    widget.context.widget.setUIState('loading');
  };

  useWsListener((props: WsMessageProps) => {
    if (!FLAGS['bot.automation.project_multi_tab']) {
      return;
    }
    workflowRef.current?.onResourceChange(props, handleReload);
  });

  useEffect(() => {
    const disposable = uiWidget.onFocus(() => {
      workflowRef.current?.triggerFitView();
      workflowRef.current?.loadGlobalVariables();
    });
    return () => {
      disposable?.dispose?.();
    };
  }, []);

  useRefresh(workflowRef);
  useListenWFMessageEvent(uri!, workflowRef);

  if (!spaceId || !workflowId) {
    return null;
  }

  return (
    <WorkflowPlayground
      ref={workflowRef}
      spaceId={spaceId}
      workflowId={workflowId}
      projectCommitVersion={commitVersion}
      renderHeader={() => null}
      onInit={handleInit}
      projectId={projectId}
      getProjectApi={getProjectApi}
      // parentContainer={widget.container}
      className="project-ide-workflow-playground"
      refetchProjectResourceList={refetchProjectResourceList}
      renameProjectResource={(resourceId: string) => {
        const shortcutService = widget.container.get(
          CustomResourceFolderShortcutService,
        );
        shortcutService.renameResource(resourceId);
      }}
    />
  );
};

export default Main;
