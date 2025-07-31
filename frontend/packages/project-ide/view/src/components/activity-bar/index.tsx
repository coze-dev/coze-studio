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

import React, { useCallback } from 'react';

import { clsx } from 'clsx';
import {
  LabelService,
  OpenerService,
  type URI,
  useIDEService,
} from '@coze-project-ide/core';

import { codicon } from '../../utils';
import { type ActivityBarItem, LayoutPanelType } from '../../types/view';
import { HoverService } from '../../services/hover-service';
import { useCurrentWidgetFromArea } from '../../hooks';
import { useStyling } from './styles';

interface ActivityBarProps {
  list: ActivityBarItem[];
  currentUri?: URI;
  setCurrentUri: (uri: URI) => void;
}

/**
 * Activitybar has two states
 * - Select state with both highlight and blue vertical bar on the left
 * - active only highlighted
 */
export const ActivityBar: React.FC<ActivityBarProps> = ({
  list,
  currentUri,
  setCurrentUri,
}) => {
  const labelService = useIDEService<LabelService>(LabelService);
  const hoverService = useIDEService<HoverService>(HoverService);
  const openerService = useIDEService<OpenerService>(OpenerService);

  const mainPanelUri = useCurrentWidgetFromArea(
    LayoutPanelType.MAIN_PANEL,
  )?.uri;

  const renderIcon = (item: ActivityBarItem) => {
    const icon = labelService.getIcon(item.uri);
    if (typeof icon !== 'string') {
      return icon;
    }
    return <i className={codicon(icon)} />;
  };

  const handleItemClick = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: ActivityBarItem,
  ) => {
    if (item?.onClick) {
      item.onClick(e);
    } else if (item.position === 'top') {
      setCurrentUri(item.uri);
    } else {
      openerService.open(item.uri);
    }
    hoverService.cancelHover();
  };

  const handleTooltip = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, content?: string) => {
      if (!content) {
        return;
      }
      hoverService.requestHover({
        content,
        target: e.currentTarget,
        position: 'right',
      });
    },
    [],
  );

  const renderListItem = (item: ActivityBarItem) => {
    const title = labelService.getName(item.uri);
    const isSelect = currentUri && item.uri.isEqualOrParent(currentUri);
    const isActive = mainPanelUri && item.uri.isEqualOrParent(mainPanelUri);
    return (
      <div
        key={title}
        className={clsx(
          'item-container',
          isSelect && 'selected',
          isActive && 'active',
        )}
        onClick={e => handleItemClick(e, item)}
        onMouseEnter={e => !isSelect && handleTooltip(e, item.tooltip)}
      >
        {renderIcon(item)}
      </div>
    );
  };

  useStyling();

  return (
    <div className="activity-bar-widget-container">
      <div className="top-container">
        {list
          .filter(item => item.position === 'top')
          .map(item => renderListItem(item))}
      </div>
      <div className="bottom-container">
        {list
          .filter(item => item.position === 'bottom')
          .map(item => renderListItem(item))}
      </div>
    </div>
  );
};
