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

import React, { useMemo } from 'react';

import {
  LabelService,
  useIDEService,
  useStyling,
} from '@coze-project-ide/core';

import { type StatusBarItem } from '../../types/view';

interface StatusBarProps {
  items: StatusBarItem[];
}

const StatusBarItem: React.FC<{ item: StatusBarItem }> = ({ item }) => {
  const labelService = useIDEService<LabelService>(LabelService);
  const label = useMemo(() => labelService.renderer(item.uri), [item.uri]);
  if (!label) {
    return null;
  }
  return <div className="flowide-status-bar-item">{label}</div>;
};

const StatusBar: React.FC<StatusBarProps> = ({ items }) => {
  useStyling(
    'flowide-status-bar-widget',
    (_, { getColor }) => `
    .flowide-status-bar-widget-container {
      display: flex;
      height: 100%;
      justify-content: space-between;
      padding: 0 8px;
    }
    .flowide-status-bar-side {
      display: flex;
    }
    .flowide-status-bar-item {
      height: 100%;
      cursor: pointer;
      padding: 0 4px;
      margin: 0 2px;
      font-size: 12px;
      color: ${getColor('flowide.color.base.text.0')};
      display: flex;
      align-items: center;
    }
    .flowide-status-bar-item:hover {
      background: ${getColor('flowide.color.base.fill.0')}
    }
  `,
  );

  return (
    <div className="flowide-status-bar-widget-container">
      <div className="flowide-status-bar-side">
        {items
          .filter(item => item.position === 'left')
          .map(item => (
            <StatusBarItem item={item} key={item.uri.toString()} />
          ))}
      </div>
      <div className="flowide-status-bar-side">
        {items
          .filter(item => item.position === 'right')
          .map(item => (
            <StatusBarItem item={item} key={item.uri.toString()} />
          ))}
      </div>
    </div>
  );
};

export { StatusBar };
