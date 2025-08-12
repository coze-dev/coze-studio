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

import React, { useState, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import {
  CustomCommand,
  useShortcuts,
  type ProjectIDEWidget,
} from '@coze-project-ide/framework';

import s from '../full-screen-button/styles.module.less';

export const ReloadButton = ({ widget }: { widget: ProjectIDEWidget }) => {
  const { keybinding } = useShortcuts(CustomCommand.RELOAD);

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const content = useMemo(
    () => (
      <div className={s.shortcut}>
        <div className={s.label}>{I18n.t('refresh_project_tags')}</div>
        <div className={s.keybinding}>{keybinding}</div>
      </div>
    ),
    [keybinding],
  );

  const handleReload = () => {
    widget.refresh();
    widget.context.widget.setUIState('loading');
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
        icon={<IconCozRefresh />}
        color="secondary"
        onClick={handleReload}
        onMouseOver={() => setTooltipVisible(true)}
        onMouseOut={() => setTooltipVisible(false)}
      />
    </Tooltip>
  );
};
