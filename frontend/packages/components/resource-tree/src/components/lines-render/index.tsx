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

import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import {
  Rectangle,
  useConfigEntity,
} from '@flowgram-adapter/fixed-layout-editor';

import { getLineId } from '../../utils';
import { type CustomLine } from '../../typings';
import { CustomRenderStateConfigEntity } from '../../entities';
import { RenderLine } from './render-line';

export const LinesRenderer = ({
  viewBox,
  lines,
  isViewportVisible,
  version,
}: {
  viewBox: string;
  lines: CustomLine[];
  isViewportVisible: (bounds: Rectangle) => boolean;
  version: number;
}) => {
  // Single line selection
  const [activeLine, setActiveLine] = useState<string[]>([]);

  const renderState = useConfigEntity<CustomRenderStateConfigEntity>(
    CustomRenderStateConfigEntity,
    true,
  );

  useEffect(() => {
    setActiveLine(renderState.activeLines);
  }, [renderState.activeLines]);

  // The offset calculation of the semi pop-up window is wrong, and the lines here are directly displayed.
  const visibleLines = lines.filter(line => {
    const bounds = Rectangle.createRectangleWithTwoPoints(
      line.fromPoint,
      line.toPoint,
    ).pad(10);
    return isViewportVisible(bounds);
  });
  const activatedLines = visibleLines.filter(l =>
    activeLine.some(lineId => lineId === getLineId(l)),
  );
  const normalLines = visibleLines.filter(
    l => !activeLine.some(lineId => lineId === getLineId(l)),
  );

  const allLines = [...normalLines, ...activatedLines];

  return (
    <svg
      className="flow-lines-container"
      width="1000"
      height="1000"
      overflow="visible"
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      // Make sure to force a refresh when the number of lines changes
      key={nanoid(5)}
    >
      {allLines.map(line => {
        const activated = activeLine.some(lineId => lineId === getLineId(line));
        return (
          <RenderLine
            key={`${getLineId(line)}${version}`}
            line={line}
            activated={activated}
          />
        );
      })}
    </svg>
  );
};
