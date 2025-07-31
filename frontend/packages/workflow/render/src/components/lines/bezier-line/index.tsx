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
  type WorkflowLineEntity,
  POINT_RADIUS,
  WorkflowLineRenderData,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';

import WithPopover from '../popover/with-popover';
import styles from '../index.module.less';
import ArrowRenderer from '../arrow';
import { STROKE_WIDTH_SLECTED, STROKE_WIDTH } from '../../../constants/points';

// import { AddPoint } from '@/components/add-point';

const PADDING = 12;

export interface BezierLineProps {
  fromColor?: string;
  toColor?: string;
  color?: string; // Highlight color, highest priority
  selected?: boolean;
  showControlPoints?: boolean;
  line: WorkflowLineEntity;
  version: string; // Used to control memo refresh
}

export const BezierLineRender = React.memo(
  WithPopover((props: BezierLineProps) => {
    const { line, color, fromColor, toColor, selected } = props;
    const renderData = line.getData(WorkflowLineRenderData);
    const { bounds: bbox } = renderData;
    const { position } = line;
    // relative position
    const toRelative = (p: IPoint) => ({
      x: p.x - bbox.x + PADDING,
      y: p.y - bbox.y + PADDING,
    });
    const fromPos = toRelative(position.from);
    const toPos = toRelative(position.to);
    // The location of the point that the real connection line needs to go to
    const arrowToPos = {
      x: toPos.x - POINT_RADIUS,
      y: toPos.y,
    };
    const linearStartColor = fromPos.x < arrowToPos.x ? fromColor : toColor;
    const linerarEndColor = fromPos.x < arrowToPos.x ? toColor : fromColor;

    const strokeWidth = selected ? STROKE_WIDTH_SLECTED : STROKE_WIDTH;
    const path = (
      <path
        d={renderData.path}
        fill="none"
        stroke={`url(#${line.id})`}
        strokeWidth={strokeWidth}
        className={line.processing ? styles.processingLine : ''}
      />
    );

    // const cls = clx('gedit-mindmap-line', {
    //   hovered,
    //   drawing,
    //   processing: props.processing
    // });
    return (
      <>
        <div
          className="gedit-flow-activity-edge"
          style={{
            left: bbox.x - PADDING,
            top: bbox.y - PADDING,
            position: 'absolute',
          }}
        >
          <svg
            width={bbox.width + PADDING * 2}
            height={bbox.height + PADDING * 2}
          >
            <defs>
              <linearGradient
                x1="0%"
                y1="100%"
                x2="100%"
                y2="100%"
                id={line.id}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={color || linearStartColor} offset="0%" />
                <stop stopColor={color || linerarEndColor} offset="100%" />
              </linearGradient>
            </defs>
            <g>
              {path}
              <ArrowRenderer
                id={line.id}
                pos={arrowToPos}
                strokeWidth={strokeWidth}
              />
            </g>
          </svg>
        </div>
      </>
    );
  }),
);
