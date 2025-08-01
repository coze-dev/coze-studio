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

import { createPortal } from 'react-dom';
import { type CSSProperties } from 'react';

import { useNodeRenderData } from '../../hooks';

/**
 * Custom port components, support expand/retract;
 * When a node is stowed, the port dom is proxied to the node-render layer to avoid being affected by display: none.
 */
export const CustomPort = ({
  portId,
  portType,
  className,
  style,
  collapsedClassName,
  collapsedStyle,
  testId,
}: {
  portId: string;
  portType: 'input' | 'output';
  className?: string;
  style?: CSSProperties;
  collapsedClassName?: string;
  collapsedStyle?: CSSProperties;
  testId?: string;
}) => {
  const { expanded, node: nodeElement } = useNodeRenderData();

  if (expanded) {
    return (
      <div
        className={className}
        data-port-id={portId}
        data-port-type={portType}
        data-testid={testId}
        style={style}
      />
    );
  }

  return createPortal(
    <div
      data-port-id={portId}
      data-port-type={portType}
      data-testid={testId}
      className={`${collapsedClassName} absolute top-[50%] ${
        portType === 'output' ? 'right-0' : 'left-0'
      }`}
      style={collapsedStyle}
    />,
    nodeElement,
  );
};
