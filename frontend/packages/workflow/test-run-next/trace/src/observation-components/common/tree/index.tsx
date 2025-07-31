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

/* eslint-disable @typescript-eslint/no-magic-numbers -- there will be many numbers calculated in this component, no need to deal with them*/
import { type FC, useCallback, useMemo, useState } from 'react';

import { isFunction, mergeWith } from 'lodash-es';

import { flattenTreeData } from './util';
import type {
  TreeProps,
  TreeNode,
  TreeNodeExtra,
  MouseEventParams,
  Line,
  LineStyle,
  GlobalStyle,
} from './typing';
import { defaultGlobalStyle, defaultLineStyle } from './config';

import styles from './index.module.less';

export type {
  TreeProps,
  TreeNode,
  TreeNodeExtra,
  MouseEventParams,
  LineStyle,
  GlobalStyle,
};

export const Tree: FC<TreeProps> = ({
  treeData,
  selectedKey,
  indentDisabled = false,
  lineStyle: gLineStyle,
  globalStyle,
  className,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onSelect,
}) => {
  const [hoverKey, setHoverKey] = useState<string>('');

  const { indent, verticalInterval, nodeBoxHeight, offsetX } = useMemo(
    () =>
      Object.assign(
        {},
        defaultGlobalStyle,
        globalStyle,
      ) as Required<GlobalStyle>,
    [globalStyle],
  );

  /**
   * Causes the Line of the specified selectKey to be placed at the top level.
   * By adjusting the line order, the z-index effect is achieved: the line with the key ${selectKey} is at the top
   */
  const adjustLineOrder = useCallback(
    (lines: Line[]): Line[] => {
      let selectedLine, hoverLine;
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (line.endNode.key === selectedKey) {
          selectedLine = lines.splice(i, 1)[0];
        } else if (line.endNode.key === hoverKey) {
          hoverLine = lines.splice(i, 1)[0];
        } else {
          i++;
        }
      }

      // Support controlling height according to zIndex
      lines.sort((lineA, lineB) => {
        const zIndexA = lineA.endNode.zIndex ?? -1;
        const zIndexB = lineB.endNode.zIndex ?? -1;

        if (zIndexA > zIndexB) {
          return 1;
        } else if (zIndexA < zIndexB) {
          return -1;
        } else {
          return 0;
        }
      });

      if (selectedLine) {
        lines.push(selectedLine);
      }
      if (hoverLine) {
        lines.push(hoverLine);
      }

      return lines;
    },
    [selectedKey, hoverKey],
  );

  const genLineStyle = useCallback(
    (lineStyle?: LineStyle): LineStyle => ({
      normal: Object.assign(
        {},
        defaultLineStyle?.normal,
        gLineStyle?.normal,
        lineStyle?.normal,
      ),
      select: Object.assign(
        {},
        defaultLineStyle?.select,
        gLineStyle?.select,
        lineStyle?.select,
      ),
      hover: Object.assign(
        {},
        defaultLineStyle?.hover,
        gLineStyle?.hover,
        lineStyle?.hover,
      ),
    }),
    [gLineStyle],
  );

  /**
   * Generate svg path from line information. colNo, rowNum all start from 0
   */
  const genSvgPath = useCallback(
    (line: Line): string => {
      const {
        startNode: { colNo: startColNo, rowNo: startRowNo },
        endNode: { colNo: endColNo, rowNo: endRowNo, lineStyle },
      } = line;

      const { normal: normalLineStyle = {} } = genLineStyle(lineStyle);

      const { lineRadius = 0, lineGap = 0 } = normalLineStyle;
      const nodeHeight = nodeBoxHeight + verticalInterval;

      // starting point
      const startX = startColNo * indent + offsetX;
      const startY =
        startRowNo * nodeHeight + (nodeBoxHeight + verticalInterval / 2);

      if (startColNo === endColNo) {
        // The length of the vertical line
        const lineASize =
          (endRowNo - startRowNo - 1) * nodeHeight + verticalInterval;
        // Move to the starting point
        const moveToStartPoint = `M ${startX} ${startY + lineGap}`;
        // vertical line
        const lineA = `L ${startX} ${startY + lineASize}`;
        return `${moveToStartPoint} ${lineA}`;
      } else {
        // The length of the vertical line
        const lineASize =
          (endRowNo - startRowNo - 1) * nodeHeight +
          verticalInterval / 2 +
          nodeHeight / 2 -
          lineRadius;
        // The length of the horizontal line
        const lineBSize =
          (endColNo - startColNo) * indent - offsetX - lineRadius;
        // Coordinates of the end point
        const endX = startX + lineBSize + lineRadius;
        const endY = startY + lineASize + lineRadius;

        // Move to the starting point
        const moveToStartPoint = `M ${startX} ${startY + lineGap}`;
        // vertical line
        const lineA = `L ${startX} ${startY + lineASize}`;
        // Quadratic Bézier Curve
        const qbc = `Q ${startX} ${endY} ${startX + lineRadius} ${endY}`;
        // horizontal line
        const lineB = `L ${endX - lineGap} ${endY}`;
        return `${moveToStartPoint} ${lineA} ${qbc} ${lineB}`;
      }
    },
    [genLineStyle, indent, nodeBoxHeight, offsetX, verticalInterval],
  );

  const genLineAttrs = useCallback(
    (nodeKey: string, lineStyle: LineStyle) => {
      if (hoverKey !== selectedKey) {
        if (nodeKey === hoverKey) {
          return mergeWith({}, lineStyle.normal, lineStyle.hover);
        }
        if (nodeKey === selectedKey) {
          return mergeWith({}, lineStyle.normal, lineStyle.select);
        }
        return lineStyle.normal;
      } else {
        if (nodeKey === hoverKey) {
          return mergeWith(
            {},
            lineStyle.normal,
            lineStyle.select,
            lineStyle.hover,
          );
        } else {
          return lineStyle.normal;
        }
      }
    },
    [hoverKey, selectedKey],
  );

  const { nodes, lines: orgLines } = flattenTreeData(treeData, {
    indentDisabled,
  });
  const lines = adjustLineOrder(orgLines);

  return (
    <div className={`${styles.tree} ${className ?? ''}`}>
      <div
        className={styles['tree-container']}
        style={{ marginTop: -verticalInterval / 2 }}
      >
        <div className={styles['tree-path-list']}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {lines.map((line, index) => {
              const path = genSvgPath(line);
              const { lineStyle } = line.endNode;
              const lineStyle0 = genLineStyle(lineStyle);
              const attrs = genLineAttrs(line.endNode.key, lineStyle0);

              return (
                <path
                  d={path}
                  stroke={attrs?.stroke}
                  strokeWidth={attrs?.strokeWidth}
                  strokeDasharray={attrs?.strokeDasharray}
                  fill="none"
                  // strokeLinecap="round"
                  key={line.endNode.key}
                />
              );
            })}
          </svg>
        </div>
        <div className={styles['tree-node-list']}>
          {nodes.map(node => {
            const { key, title, selectEnabled = true, colNo } = node;
            const nodeExtra: TreeNodeExtra = {
              ...node,
              selected: selectedKey === key,
              hover: hoverKey === key,
            };

            return (
              <div
                className={styles['tree-node']}
                style={{
                  paddingTop: verticalInterval / 2,
                  paddingBottom: verticalInterval / 2,
                }}
                key={node.key}
              >
                <div
                  className={styles['tree-node-box']}
                  style={{
                    marginLeft: colNo * indent,
                    height: nodeBoxHeight,
                  }}
                  onClick={event => {
                    if (selectEnabled) {
                      onSelect?.({ node: nodeExtra });
                    }
                    onClick?.({ event, node: nodeExtra });
                  }}
                  onMouseMove={event => {
                    onMouseMove?.({ event, node: nodeExtra });
                  }}
                  onMouseEnter={event => {
                    if (selectEnabled) {
                      setHoverKey(key);
                    }
                    onMouseEnter?.({
                      event,
                      node: { ...nodeExtra, hover: true },
                    });
                  }}
                  onMouseLeave={event => {
                    if (selectEnabled) {
                      setHoverKey('');
                    }
                    onMouseLeave?.({
                      event,
                      node: { ...nodeExtra, hover: false },
                    });
                  }}
                >
                  {isFunction(title) ? title(nodeExtra) : title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
