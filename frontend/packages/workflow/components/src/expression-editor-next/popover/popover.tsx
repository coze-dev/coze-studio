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

import React, {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';
import {
  CursorMirror,
  useEditor,
  SelectionSide,
} from '@coze-editor/editor/react';
import { type EditorAPI as ExpressionEditorAPI } from '@coze-editor/editor/preset-expression';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { Popover as SemiPopover, Tree } from '@coze-arch/bot-semi';

import { type ExpressionEditorTreeNode } from '@/expression-editor';

import { generateUniqueId, useDeepEqualMemo, useLatest } from '../shared';
import { applyNode, getOptionInfoFromDOM, selectNodeByIndex } from './shared';
import {
  useEmptyContent,
  useFilteredVariableTree,
  useFocused,
  useInterpolationContent,
  usePrunedVariableTree,
  useSelection,
  useTreeRefresh,
  useTreeSearch,
  useKeyboard,
  useOptionsOperations,
  useSelectedValue,
} from './hooks';

import styles from './popover.module.less';

interface Props {
  getPopupContainer?: PopoverProps['getPopupContainer'];
  variableTree: ExpressionEditorTreeNode[];
  className?: string;
  onVisibilityChange?: (visible: boolean) => void;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
function Popover({
  getPopupContainer,
  variableTree: vTree,
  className,
  onVisibilityChange,
}: Props) {
  const variableTree = useDeepEqualMemo(vTree);
  const treeRef = useRef<Tree | null>(null);
  const treeContainerRef = useRef<HTMLDivElement | null>(null);
  const onVisibilityChangeRef = useLatest(onVisibilityChange);
  const [posKey, setPosKey] = useState('');
  const editor = useEditor<ExpressionEditorAPI | undefined>();
  const editorRef = useLatest(editor);
  const selection = useSelection(editor);
  const focused = useFocused(editor);
  const interpolationContent = useInterpolationContent(
    editor,
    selection?.anchor,
  );
  const prunedVariableTree = usePrunedVariableTree(
    editor,
    variableTree,
    interpolationContent,
  );
  const filteredVariableTree = useFilteredVariableTree(
    interpolationContent,
    prunedVariableTree,
  );
  const emptyContent = useEmptyContent(
    variableTree,
    prunedVariableTree,
    interpolationContent,
  );
  const treeRefreshKey = useTreeRefresh(filteredVariableTree);
  useTreeSearch(treeRefreshKey, treeRef, interpolationContent, () => {
    const optionsInfo = getOptionInfoFromDOM(treeContainerRef.current);
    if (!optionsInfo) {
      return;
    }
    const { elements } = optionsInfo;
    selectNodeByIndex(elements, 0);
  });
  // Selected is only used to display the blue selection effect for the corresponding item of the Tree component, and has no other purpose.
  const selected = useSelectedValue(interpolationContent?.text, variableTree);

  // Replace content in {{}} based on user selection
  const handleSelect = useCallback(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    (_, __, node: TreeNodeData) => {
      if (!editor || !interpolationContent) {
        return;
      }

      applyNode(editor, node as ExpressionEditorTreeNode, interpolationContent);
    },
    [editor, interpolationContent],
  );

  const internalVisible =
    focused &&
    ((Boolean(interpolationContent) && filteredVariableTree.length > 0) ||
      Boolean(emptyContent));

  const [allowVisible, setAllowVisible] = useState(false);
  // Clear the lock effect when the selection changes
  useEffect(() => {
    setAllowVisible(true);
  }, [selection]);

  const visible = internalVisible && allowVisible;

  const { prev, next, apply } = useOptionsOperations(
    editor,
    interpolationContent,
    treeContainerRef,
    treeRef,
  );

  // Press the up and down keys to switch the recommended items, and press Enter to fill in.
  useKeyboard(visible, {
    ArrowUp: prev,
    ArrowDown: next,
    Enter: apply,
  });

  // ESC Close
  useKeyboard(visible, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Escape() {
      setAllowVisible(false);
    },
  });

  // When the recommendation panel appears, disable the default behavior of ArrowUp/ArrowDown/Enter (the behavior is changed to up and down keys to switch recommendations & enter to insert)
  useEffect(() => {
    if (visible === true) {
      editorRef.current?.disableKeybindings(['ArrowUp', 'ArrowDown', 'Enter']);
    } else {
      editorRef.current?.disableKeybindings([]);
    }
  }, [visible]);

  useEffect(() => {
    if (typeof onVisibilityChangeRef.current === 'function') {
      onVisibilityChangeRef.current(visible);
    }
  }, [visible]);

  return (
    <SemiPopover
      trigger="custom"
      visible={visible}
      keepDOM={true}
      rePosKey={posKey}
      getPopupContainer={getPopupContainer}
      content={
        <div
          onMouseDown={e => e.preventDefault()}
          style={{ display: visible ? 'block' : 'none' }}
          // The data-attribute is used for other components to ignore some click outside event
          data-expression-popover
        >
          <EmptyContent visible={!!emptyContent} content={emptyContent} />
          <TreeContainer
            ref={treeContainerRef}
            visible={!emptyContent}
            className={className}
          >
            <Tree
              // key={treeRefreshKey}
              className={styles['expression-editor-suggestion-tree']}
              showFilteredOnly
              filterTreeNode
              onChangeWithObject
              ref={treeRef}
              treeData={prunedVariableTree}
              searchRender={false}
              value={selected}
              emptyContent={null}
              onSelect={handleSelect}
            />
          </TreeContainer>
        </div>
      }
    >
      <CursorMirror
        side={SelectionSide.Anchor}
        onChange={() => setPosKey(generateUniqueId())}
      />
    </SemiPopover>
  );
}

interface EmptyContentProps {
  visible: boolean;
  content?: string;
}

function EmptyContent({ visible, content }: EmptyContentProps) {
  return (
    <div
      className={styles['expression-editor-suggestion-empty']}
      style={{ display: visible ? 'block' : 'none' }}
    >
      <p>{content}</p>
    </div>
  );
}

interface TreeContainerProps {
  visible: boolean;
  className?: string;
  children?: ReactNode;
}

const TreeContainer = forwardRef<HTMLDivElement, TreeContainerProps>(
  function TreeContainer({ visible, className, children }, ref) {
    return (
      <div
        className={classNames(
          className,
          styles['expression-editor-suggestion'],
        )}
        style={{ display: visible ? 'block' : 'none' }}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);

export { Popover };
