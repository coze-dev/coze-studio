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

import React from 'react';

import {
  POINT_RADIUS,
  WorkflowLineRenderData,
} from '@flowgram-adapter/free-layout-editor';

import WithPopover from '../popover/with-popover';
import styles from '../index.module.less';
import { type BezierLineProps } from '../bezier-line';
import ArrowRenderer from '../arrow';
import { STROKE_WIDTH, STROKE_WIDTH_SLECTED } from '../../../constants/points';

/**
 * fold line
 */
export const FoldLineRender = React.memo(
  WithPopover((props: BezierLineProps) => {
    const { selected, color, line } = props;
    const { to } = line.position;
    const strokeWidth = selected ? STROKE_WIDTH_SLECTED : STROKE_WIDTH;
    // The location of the point that the real connection line needs to go to
    const arrowToPos = {
      x: to.x - POINT_RADIUS,
      y: to.y,
    };
    const renderData = line.getData(WorkflowLineRenderData);
    // const bounds = line.bezier.foldBounds
    // const points = line.bezier.foldPoints
    //
    // const debug = (
    //   <>
    //     <div
    //       style={{
    //         left: bounds.left,
    //         top: bounds.top,
    //         width: bounds.width,
    //         height: bounds.height,
    //         position: 'absolute',
    //         background: 'red',
    //         zIndex: 1000,
    //         opacity: 0.3,
    //       }}
    //     />
    //     {points.map((p, i) => (
    //       <div
    //         key={i}
    //         style={{
    //           left: p.x,
    //           top: p.y,
    //           width: 10,
    //           height: 10,
    //           marginTop: -5,
    //           marginBottom: -5,
    //           position: 'absolute',
    //           background: 'blue',
    //           zIndex: 1000,
    //         }}
    //       />
    //     ))}
    //   </>
    // )
    return (
      <div
        className="gedit-flow-activity-edge"
        style={{ position: 'absolute' }}
      >
        <svg overflow="visible">
          <defs>
            <linearGradient
              x1="0%"
              y1="100%"
              x2="100%"
              y2="100%"
              id={line.id}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={color} offset="0%" />
              <stop stopColor={color} offset="100%" />
            </linearGradient>
          </defs>
          <g>
            <path
              d={renderData.path}
              fill="none"
              strokeLinecap="round"
              stroke={color}
              strokeWidth={strokeWidth}
              className={line.processing ? styles.processingLine : ''}
            />
            <ArrowRenderer
              id={line.id}
              pos={arrowToPos}
              strokeWidth={strokeWidth}
            />
          </g>
        </svg>
      </div>
    );
  }),
);
