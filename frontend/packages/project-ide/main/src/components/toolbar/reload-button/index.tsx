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
      // 点击后布局变化，tooltip 需要手动控制消失
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
