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

/**
 * Node side window
 */
import {
  type PropsWithChildren,
  type FC,
  useEffect,
  useState,
  useMemo,
} from 'react';

import classnames from 'classnames';
import { type NodeMeta } from '@coze-workflow/base/types';
import { concatNodeTestId } from '@coze-workflow/base';
import {
  FlowNodeFormData,
  NodeRender,
} from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import {
  NodeFormPanelContext,
  useNodeFormPanelState,
} from '@/hooks/use-node-side-sheet-store';
import {
  useTestFormState,
  useFloatLayoutSize,
  useFloatLayoutService,
} from '@/hooks';
import { useSidePanelWidth } from '@/components/resizable-side-panel/use-side-panel-width';
import { ResizableSidePanel } from '@/components/resizable-side-panel';

import {
  TestNodeForm,
  TestNodeResultNotice,
  useShowResultNotice,
} from '../test-run/test-form-sheet-v2/test-node-form';
import { NodeContextProvider } from '../node-context-provider';
import { PanelWrap } from '../float-layout';
import { EditorThemeProvider } from '../editor-container';

import styles from './index.module.less';

const PADDING = 16;

const NodeFormPanelProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [fullscreenPanel, setFullscreenPanel] = useState<React.ReactNode>(null);

  return (
    <NodeFormPanelContext.Provider
      value={{ fullscreenPanel, setFullscreenPanel }}
    >
      {children}
    </NodeFormPanelContext.Provider>
  );
};

const NodeSideSheetPanel: FC<
  PropsWithChildren<{
    width?: number | string;
    className?: string;
  }>
> = props => {
  const { width, children, className } = props;
  return (
    <div
      className={classnames(className, 'h-full flex-none overflow-auto')}
      style={{
        width,
      }}
    >
      {children}
    </div>
  );
};

export interface NodeFormPanelProps {
  node: FlowNodeEntity;
  showTestNodeForm?: boolean;
}

export const NodeSideSheet: React.FC<NodeFormPanelProps> = ({
  node,
  showTestNodeForm,
}) => {
  const testFormState = useTestFormState();
  const floatLayoutService = useFloatLayoutService();
  const showTestRunResultNotice = useShowResultNotice(node);
  const {
    config: { testNodeFormVisible },
  } = testFormState;

  const { width: layoutWidth } = useFloatLayoutSize();

  const { fullscreenPanel } = useNodeFormPanelState();

  const { width: sideWidth } = useSidePanelWidth();

  const leftFullWidth = useMemo(
    () => layoutWidth - sideWidth - PADDING,
    [layoutWidth, sideWidth],
  );

  useEffect(() => {
    if (showTestNodeForm) {
      testFormState.showTestNodeForm();
    } else {
      testFormState.closeTestNodeForm();
    }
  }, [showTestNodeForm, node]);

  // This panel needs to be closed when a node is deleted
  useEffect(() => {
    const disposable = node.onDispose(() => {
      floatLayoutService.close();
    });
    return () => disposable.dispose();
  }, [node, floatLayoutService]);

  if (!node) {
    return null;
  }

  const nodeMeta: NodeMeta = node.getNodeMeta();

  if (nodeMeta.disableSideSheet) {
    return null;
  }

  const { formModel } = node.getData(FlowNodeFormData);
  const { initialized } = formModel;

  if (!initialized) {
    return null;
  }

  return (
    <PanelWrap layout="vertical">
      <NodeContextProvider
        key={node?.id?.toString()}
        node={node}
        scene="node-side-sheet"
      >
        <EditorThemeProvider>
          <ResizableSidePanel bypass={!!fullscreenPanel}>
            <div
              className={classnames(
                styles['node-side-sheet'],
                'rounded-lg coz-bg-plus flex h-full overflow-hidden',
              )}
            >
              {fullscreenPanel ? (
                <NodeSideSheetPanel
                  className="coz-stroke-primary border-0 border-r border-solid !flex-1"
                  width={leftFullWidth}
                >
                  {fullscreenPanel}
                </NodeSideSheetPanel>
              ) : null}
              <ResizableSidePanel
                className="relative h-full flex-none"
                bypass={!fullscreenPanel}
              >
                <NodeSideSheetPanel width={sideWidth}>
                  <div
                    className={classnames(
                      'px-3 pb-4',
                      styles['node-side-sheet-form'],
                      {
                        [styles['has-result-notice']]:
                          showTestRunResultNotice || testNodeFormVisible,
                      },
                    )}
                    data-testid={concatNodeTestId(node, 'node-side-sheet-form')}
                  >
                    <NodeRender node={node} />
                  </div>
                  <TestNodeForm node={node} />
                  {showTestRunResultNotice ? (
                    <TestNodeResultNotice node={node} />
                  ) : null}
                </NodeSideSheetPanel>
              </ResizableSidePanel>
            </div>
          </ResizableSidePanel>
        </EditorThemeProvider>
      </NodeContextProvider>
    </PanelWrap>
  );
};

export const NodeFormPanel: React.FC<NodeFormPanelProps> = props => (
  <NodeFormPanelProvider>
    <NodeSideSheet {...props} />
  </NodeFormPanelProvider>
);
