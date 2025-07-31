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

import React, { useState, useEffect, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozExpand, IconCozMinimize } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import {
  type TabBarToolbar,
  useCurrentWidget,
  useProjectIDEServices,
  useSplitScreenArea,
  Command,
  useShortcuts,
} from '@coze-project-ide/framework';

import s from './styles.module.less';

export const FullScreenButton = () => {
  const projectIDEServices = useProjectIDEServices();
  const currentWidget = useCurrentWidget<TabBarToolbar>();
  const { keybinding } = useShortcuts(Command.Default.VIEW_FULL_SCREEN);
  const direction = useSplitScreenArea(
    currentWidget.currentURI,
    currentWidget.tabBar,
  );

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const [fullScreen, setFullScreen] = useState(
    projectIDEServices.view.isFullScreenMode,
  );

  useEffect(() => {
    const disposable = projectIDEServices.view.onFullScreenModeChange(
      isFullScreen => {
        setFullScreen(isFullScreen);
      },
    );
    return () => {
      disposable.dispose();
    };
  }, []);

  const icon = useMemo(() => {
    if (fullScreen) {
      return <IconCozMinimize />;
    } else {
      return <IconCozExpand />;
    }
  }, [fullScreen]);

  const content = useMemo(
    () => (
      <div className={s.shortcut}>
        <div className={s.label}>
          {fullScreen
            ? I18n.t('project_ide_restore')
            : I18n.t('project_ide_maximize')}
        </div>
        <div className={s.keybinding}>{keybinding}</div>
      </div>
    ),
    [fullScreen, keybinding],
  );

  // The left split screen does not display the full screen button.
  if (direction === 'left') {
    return null;
  }
  const handleSwitchFullScreen = () => {
    projectIDEServices.view.switchFullScreenMode();
    setTooltipVisible(false);
  };

  return (
    <Tooltip
      content={content}
      position="bottom"
      // After clicking, the layout changes, and the tooltip needs to be manually controlled to disappear.
      trigger="custom"
      visible={tooltipVisible}
    >
      <IconButton
        className={s['icon-button']}
        icon={icon}
        color="secondary"
        onClick={handleSwitchFullScreen}
        onMouseOver={() => setTooltipVisible(true)}
        onMouseOut={() => setTooltipVisible(false)}
      />
    </Tooltip>
  );
};
