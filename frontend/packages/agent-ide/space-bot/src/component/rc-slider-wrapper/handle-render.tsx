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

import { type SliderProps } from 'rc-slider';
import { Tooltip } from '@coze-arch/bot-semi';

interface HandleTooltipProps {
  value: number;
  children: React.ReactElement;
  visible: boolean;
  tipFormatter?: (value: number) => React.ReactNode;
}

export const HandleTooltip: React.FC<HandleTooltipProps> = props => {
  const {
    value,
    children,
    visible,
    tipFormatter = val => `${val}`,
    ...restProps
  } = props;

  const rafRef = React.useRef<number | null>(null);

  // To update the location of Tooltip
  const [refreshKey, setRefreshKey] = React.useState('1');

  function cancelKeepAlign() {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
    }
  }

  function keepAlign() {
    rafRef.current = window.requestAnimationFrame(() => {
      setRefreshKey(Math.random().toString());
    });
  }

  React.useEffect(() => {
    if (visible) {
      keepAlign();
    } else {
      cancelKeepAlign();
    }

    return cancelKeepAlign;
  }, [value, visible]);

  return (
    <Tooltip
      placement="top"
      content={tipFormatter(value)}
      overlayInnerStyle={{ minHeight: 'auto' }}
      rePosKey={refreshKey}
      visible={visible}
      {...restProps}
    >
      {children}
    </Tooltip>
  );
};

export const handleRender: SliderProps['handleRender'] = (node, props) => (
  <HandleTooltip
    value={props.value as number}
    visible={props.dragging as boolean}
  >
    {node}
  </HandleTooltip>
);
