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

import { Tree, type NodeRendererProps, type CursorProps } from 'react-arborist';
import { useState, type CSSProperties } from 'react';

import useResizeObserver from 'use-resize-observer';
import cls from 'classnames';
import { type ILevelSegment } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { IconButton, Toast } from '@coze-arch/coze-design';

import {
  findDescendantIDs,
  getTreeNodes,
  handleDeleteNode,
  handleMergeNodes,
  handleTreeNodeMove,
} from './utils/level-tree-op';
import { useSegmentContextMenu } from './use-context-menu';
import { type LevelDocumentTree } from './types';

interface ISegmentTreeProps {
  segments: ILevelSegment[];
  setLevelSegments?: (segments: ILevelSegment[]) => void;
  setSelectionIDs?: (ids: string[]) => void;
  disabled?: boolean;
}

export const SegmentTree: React.FC<ISegmentTreeProps> = ({
  segments,
  setLevelSegments,
  setSelectionIDs,
  disabled,
}) => {
  /**
   * select function
   */
  const [selected, setSelected] = useState(new Set<string>());
  // Sharding id
  const [selectedThroughParent, setSelectedThroughParent] = useState(
    new Set<string>(),
  );
  const { ref, width, height } = useResizeObserver<HTMLDivElement>();

  const onSelect = (node: LevelDocumentTree) => {
    setSelected(new Set([node.id]));
    setSelectedThroughParent(findDescendantIDs(node));
    setSelectionIDs?.([node.id, ...findDescendantIDs(node)]);
  };

  /**
   * render
   */
  const Node = ({
    node,
    style,
    dragHandle,
  }: NodeRendererProps<LevelDocumentTree>) => {
    const { isOpen, data } = node;
    const isLeaf = !data.children?.length;
    const expandIcon = (
      <IconButton
        size="small"
        color="secondary"
        icon={
          <IconCozArrowRight
            className={cls(
              isOpen && 'rotate-90',
              'transition duration-150 ease-in-out',
            )}
          />
        }
        onClick={e => {
          e.stopPropagation();
          node.toggle();
        }}
        className={cls('bg-transparent ml-[4px] shrink-0')}
      />
    );

    return (
      <div
        className={cls(
          'flex items-center gap-[4px]',
          'h-[32px] py-[4px] pr-[8px] mb-[2px]',
          'hover:coz-mg-primary cursor-pointer',
          'transition duration-150 ease-in-out',
          'rounded-[8px]',
          (selected.has(data.id) || selectedThroughParent.has(data.id)) &&
            'coz-mg-primary',
        )}
        onClick={() => {
          onSelect(data);
        }}
        onContextMenu={e => {
          if (disabled) {
            return;
          }
          onContextMenu(e, node);
        }}
        style={style}
        ref={dragHandle}
      >
        {isLeaf ? <span className="w-6 ml-[4px] shrink-0" /> : expandIcon}
        <span
          className={cls('text-[14px] leading-[20px] coz-fg-primary truncate')}
        >
          {data.type !== 'image'
            ? data.text.slice(0, 50)
            : I18n.t('knowledge_level_110')}
        </span>
      </div>
    );
  };

  /**
   * context menu
   */
  const { popoverNode, onContextMenu } = useSegmentContextMenu({
    onMerge: node => {
      const { segments: newSegments, errMsg } = handleMergeNodes(
        node.id,
        Array.from(findDescendantIDs(node)),
        segments,
      );
      if (errMsg) {
        Toast.error(errMsg);
      }
      if (newSegments?.length) {
        setLevelSegments?.(newSegments);
      }
    },
    onDelete: node => {
      const newSegments = handleDeleteNode(
        [node.id, ...findDescendantIDs(node)],
        segments,
      );
      setLevelSegments?.(newSegments);
    },
  });

  return (
    <div ref={ref} className="w-full h-full relative translate-z-0">
      <Tree
        data={getTreeNodes(segments)}
        disableDrag={disabled}
        disableDrop={disabled}
        onMove={({ dragIds, parentId, index }) => {
          const { segments: newSegments, errMsg } = handleTreeNodeMove(
            { dragIDs: dragIds, parentID: parentId, dropIndex: index },
            segments,
          );
          if (errMsg) {
            Toast.error(errMsg);
          }
          if (newSegments?.length) {
            setLevelSegments?.(newSegments);
          }
        }}
        rowHeight={34}
        paddingTop={4}
        paddingBottom={4}
        width={width}
        height={height}
        renderCursor={Cursor}
      >
        {Node}
      </Tree>
      {popoverNode}
    </div>
  );
};

const Cursor = ({ top, left, indent }: CursorProps) => {
  const placeholderStyle = {
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  };
  const style: CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    top: `${top - 2}px`,
    left: `${left}px`,
    right: `${indent}px`,
  };
  return (
    <div style={{ ...placeholderStyle, ...style }}>
      <div className={cls('flex-1 h-[2px] coz-mg-hglt-plus')}></div>
    </div>
  );
};
