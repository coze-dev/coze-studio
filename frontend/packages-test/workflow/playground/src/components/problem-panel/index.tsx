import React, { useCallback } from 'react';

import { useMemoizedFn } from 'ahooks';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';
import { ProblemPanel as ProblemPanelCore } from '@coze-workflow/test-run';
import { type ValidateError } from '@coze-workflow/base/services';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { useWatchValidateWorkflow } from '@/hooks/use-validate-workflow';
import { useTemplateService } from '@/hooks/use-template-service';
import {
  useFloatLayoutService,
  useFloatLayoutSize,
  useGlobalState,
} from '@/hooks';
import { LayoutPanelKey } from '@/constants';

import { useScrollToError } from '../test-run/execute-result/execute-result-side-sheet/hooks/use-scroll-to-error';
import { PanelWrap, PANEL_PADDING } from '../float-layout';

export const ProblemPanel = () => {
  const floatLayoutService = useFloatLayoutService();
  const globalState = useGlobalState();
  const templateState = useTemplateService();
  const { height: layoutHeight } = useFloatLayoutSize();
  const scrollToError = useScrollToError();
  const playground = usePlayground();

  const handleScroll = useCallback(
    async (problem: ValidateError) => {
      const scrolled = await scrollToError(problem);
      if (!scrolled) {
        Toast.error(I18n.t('workflow_node_has_delete'));
        return;
      }
      if (problem.errorType === 'node' && problem.nodeId) {
        const node = playground.entityManager.getEntityById<FlowNodeEntity>(
          problem.nodeId,
        );
        if (node) {
          floatLayoutService.open(LayoutPanelKey.NodeForm, 'right', { node });
        }
      }
    },
    [scrollToError],
  );

  const handleJump = useMemoizedFn(
    (problem: ValidateError, workflowId: string) => {
      const isInProject = !!globalState.projectId;
      const projectApi = globalState.getProjectApi();
      if (isInProject && projectApi) {
        projectApi.sendMsgOpenWidget(`/workflow/${workflowId}`, {
          name: 'debug',
          data: {
            nodeId: problem.nodeId,
          },
        });
        return;
      }
      const url =
        `/work_flow?space_id=${globalState.spaceId}&workflow_id=${globalState.workflowId}` +
        `&node_id=${problem.nodeId}`;
      window.open(url);
    },
  );

  const handleClose = useCallback(() => {
    floatLayoutService.close('bottom');
    if (templateState.templateVisible) {
      floatLayoutService.open('templatePanel', 'bottom');
    }
  }, [floatLayoutService]);

  useWatchValidateWorkflow();

  return (
    <PanelWrap>
      <ProblemPanelCore
        workflowId={globalState.workflowId}
        maxHeight={layoutHeight - PANEL_PADDING * 2}
        onScroll={handleScroll}
        onJump={handleJump}
        onClose={handleClose}
      />
    </PanelWrap>
  );
};
