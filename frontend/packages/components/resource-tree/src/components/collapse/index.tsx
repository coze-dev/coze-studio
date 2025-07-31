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

import { useEffect } from 'react';

import {
  type CollapseProps,
  useService,
  useBaseColor,
  EntityManager,
  useRefresh,
} from '@flowgram-adapter/fixed-layout-editor';

import { getTreeIdFromNodeId } from '../../utils';
import {
  CustomHoverService,
  CustomLinesManager,
  TreeService,
} from '../../services';
import { Arrow } from './arrow';

import s from './index.module.less';

export function Collapse(props: Omit<CollapseProps, 'collapsed'>): JSX.Element {
  const { collapseNode, hoverActivated } = props;

  const hoverService = useService<CustomHoverService>(CustomHoverService);
  const treeService = useService<TreeService>(TreeService);
  const linesManager = useService<CustomLinesManager>(CustomLinesManager);
  const entityManager = useService<EntityManager>(EntityManager);

  const refresh = useRefresh();

  const treeNode = treeService.getNodeByIdFromTree(
    getTreeIdFromNodeId(collapseNode.id),
  );

  const { edges: originEdges } = treeService;
  const edges = treeService.getUnCollapsedEdges();
  // If there are no child elements, it is collapsed.
  // Also determine whether there are lines connecting
  const collapsed =
    !collapseNode?.children?.length &&
    !collapseNode.next &&
    !edges.some(edge => edge.from === collapseNode.id);

  const { baseActivatedColor } = useBaseColor();

  const rerenderLines = () => {
    setTimeout(() => {
      linesManager.renderLines();
    }, 50);
  };

  const collapseBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (treeNode) {
      originEdges
        .filter(_e => _e.from === treeNode.id && !_e.collapsed)
        .forEach(edge => (edge.collapsed = true));
      treeNode.children?.forEach(c => {
        if (c.type !== 'blockIcon') {
          c.data!.collapsed = true;
        }
      });
    }
    // Node redraw
    treeService.treeToFlowNodeJson();
    // Line redrawing
    rerenderLines();
  };

  const openBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (treeNode) {
      originEdges
        .filter(_e => _e.from === treeNode.id && _e.collapsed)
        .forEach(edge => (edge.collapsed = false));
      treeNode.children?.forEach(c => {
        if (c.type !== 'blockIcon') {
          c.data!.collapsed = false;
        }
      });
    }
    // Node redraw
    treeService.treeToFlowNodeJson();
    rerenderLines();
  };

  // flow-labels-layer is not updated
  useEffect(() => {
    const disposable = entityManager.onEntityChange(() => {
      refresh();
    });
    return () => {
      disposable.dispose();
    };
  }, []);

  // expand
  if (collapsed) {
    let childCount = 0;
    if (treeNode) {
      childCount = treeNode.children?.length || 0;
    }
    if (originEdges?.length) {
      const num = originEdges.reduce((sum, e) => {
        if (e.from === collapseNode.id) {
          return (sum += 1);
        }
        return sum;
      }, 0);
      childCount += num;
    }

    return (
      <div
        className={s.container}
        onClick={openBlock}
        style={{
          background: hoverActivated ? '#82A7FC' : '#BBBFC4',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            transform: 'rotate(-90deg)',
          }}
        >
          {childCount}
        </span>
      </div>
    );
  }

  // dark: var(--semi-color-black)
  // light: var(--semi-color-white)
  const color = baseActivatedColor;

  const handleHover = () => {
    hoverService.hoverCollapse(collapseNode);
  };

  const handleLeave = () => {
    hoverService.hoverCollapse(undefined);
  };

  // collapse
  return (
    <div
      className={s.container}
      onClick={collapseBlock}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      aria-hidden="true"
      onMouseMove={e => e.stopPropagation()}
    >
      <Arrow color={color} />
    </div>
  );
}
