import cx from 'classnames';
import { useWorkflowNode } from '@coze-workflow/base';
import { ErrorBoundary, logger } from '@coze-arch/logger';
import {
  useNodeRender,
  type WorkflowNodeRenderProps,
} from '@flowgram-adapter/free-layout-editor';

import { useNodeSideSheetStore } from '@/hooks/use-node-side-sheet-store';
import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import { useGlobalState, useTestFormState } from '@/hooks';
import { WorkflowExecStatus } from '@/entities';
import { LayoutPanelKey } from '@/constants';

import { ExecuteStatusBarV2 } from '../../test-run/execute-status-bar-v2';
import { Wrapper } from './wrapper';
import { Ports } from './ports';
import { Placeholder } from './placeholder';
import { Header } from './header';
import { Error } from './error';
import { Content } from './content';

import styles from './index.module.less';

export function NodeRenderNew(props: WorkflowNodeRenderProps) {
  const { node } = props;
  const globalState = useGlobalState(false);
  const testFormState = useTestFormState();
  const { selected, selectNode } = useNodeRender();
  const { isError, isInitialized } = useWorkflowNode();
  const openNodeSideSheet = useNodeSideSheetStore(
    state => state.openNodeSideSheet,
  );
  const floatLayoutService = useFloatLayoutService();

  const handleNodeClick = e => {
    selectNode(e);
    // 处于执行中的流程禁止切换面板
    if (globalState.viewStatus !== WorkflowExecStatus.EXECUTING && !isError) {
      testFormState.closeCommonSheet();
      openNodeSideSheet();
      floatLayoutService.open(LayoutPanelKey.NodeForm, 'right', { node });
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={() => <Error />}
      errorBoundaryName="workflow-node-render"
      logger={logger}
    >
      <Wrapper
        className={cx(styles['node-render'], {
          [styles.selected]: selected,
        })}
        onClick={handleNodeClick}
      >
        {isError ? <Error /> : null}

        {!isError && !isInitialized ? <Placeholder /> : null}

        {!isError && isInitialized ? (
          <>
            <ExecuteStatusBarV2 node={node} />

            <Header />

            <Content />
          </>
        ) : null}

        <Ports />
      </Wrapper>
    </ErrorBoundary>
  );
}
