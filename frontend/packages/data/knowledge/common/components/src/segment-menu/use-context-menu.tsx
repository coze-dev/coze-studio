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

import { type NodeApi } from 'react-arborist';
import { useState } from 'react';

import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { Menu, MenuSubMenu } from '@coze-arch/coze-design';

import { type LevelDocumentTree } from './types';

interface IUseSegmentContextMenuProps {
  onDelete: (node: LevelDocumentTree) => void;
  onMerge: (node: LevelDocumentTree) => void;
}

export function useSegmentContextMenu({
  onDelete,
  onMerge,
}: IUseSegmentContextMenuProps): {
  popoverNode: React.ReactNode;
  onContainerScroll: () => void;
  onContextMenu: (
    e: React.MouseEvent<HTMLDivElement>,
    treeNode: NodeApi<LevelDocumentTree>,
  ) => void;
} {
  const [treeNode, setTreeNode] = useState<NodeApi<LevelDocumentTree> | null>();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const params = useKnowledgeParams();

  return {
    popoverNode: (
      <Menu
        visible={visible}
        onVisibleChange={setVisible}
        onClickOutSide={() => {
          setVisible(false);
          setTreeNode(null);
        }}
        trigger="custom"
        position="bottomLeft"
        render={
          <MenuSubMenu mode="menu">
            {treeNode && !treeNode.children?.length ? (
              <>
                <Menu.Item
                  isMenu
                  onClick={() => {
                    onDelete(treeNode.data);
                    setVisible(false);
                  }}
                >
                  {I18n.t('knowledge_level_028')}
                </Menu.Item>
              </>
            ) : null}
            {treeNode && treeNode.children?.length ? (
              <>
                <Menu.Item
                  isMenu
                  onClick={() => {
                    onMerge(treeNode.data);
                    setVisible(false);
                  }}
                >
                  {I18n.t('knowledge_level_029')}
                </Menu.Item>
                <Menu.Item
                  isMenu
                  onClick={() => {
                    onDelete(treeNode.data);
                    setVisible(false);
                  }}
                >
                  {I18n.t('knowledge_level_028')}
                </Menu.Item>
              </>
            ) : null}
          </MenuSubMenu>
        }
      >
        <div
          style={{
            height: 0,
            width: 0,
            position: 'fixed',
            top: position.top,
            left: position.left,
          }}
        />
      </Menu>
    ),
    onContainerScroll: () => {
      if (visible) {
        setVisible(false);
      }
    },
    onContextMenu: (e, node: NodeApi<LevelDocumentTree>) => {
      e.preventDefault();
      setTreeNode(node);
      /** In the project ide, the ide container is set to contain: strict, which will cause a fixed position.
       *  The base of the offset is wrong, so you need to subtract the left and top values of the ide container here
       */
      let clickX = e.pageX;
      let clickY = e.pageY;
      const ideDom = document.getElementById(
        `coze-project:///knowledge/${params.datasetID}`,
      );

      if (ideDom) {
        const { left, top } = ideDom.getBoundingClientRect();
        clickX = clickX - left;
        clickY = clickY - top;
      }

      setPosition({ left: clickX, top: clickY });
      setVisible(true);
    },
  };
}
