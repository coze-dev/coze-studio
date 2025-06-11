import React, { useState, useCallback } from 'react';

import classnames from 'classnames';
import {
  useIDENavigate,
  useCurrentWidget,
  type SplitWidget,
  URI_SCHEME,
  compareURI,
  SIDEBAR_CONFIG_URI,
  useActivateWidgetContext,
  URI,
} from '@coze-project-ide/framework';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowDown,
  IconCozArrowUp,
  IconCozChatSetting,
  IconCozVariables,
} from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

import { HEADER_HEIGHT } from '../../constants/styles';

import styles from './index.module.less';

export const SESSION_CONFIG_STR = '/session';
const SESSION_CONFIG_URI = new URI(`${URI_SCHEME}:///session`);
const VARIABLE_CONFIG_URI = new URI(`${URI_SCHEME}:///variables`);
const VARIABLES_STR = '/variables';

export const Configuration = () => {
  const navigate = useIDENavigate();
  const widget = useCurrentWidget();

  const context = useActivateWidgetContext();

  const [expand, setExpand] = useState(true);

  const handleOpenSession = useCallback(() => {
    navigate(SESSION_CONFIG_STR);
  }, []);

  const handleOpenVariables = useCallback(() => {
    navigate(VARIABLES_STR);
  }, []);

  const handleSwitchExpand = () => {
    if (widget) {
      (widget as SplitWidget).toggleSubWidget(SIDEBAR_CONFIG_URI);
    }
    setExpand(!expand);
  };

  return (
    <div className={styles['config-container']}>
      <div
        className={classnames(
          styles['primary-sidebar-header'],
          `h-[${HEADER_HEIGHT}px]`,
        )}
      >
        <div className={styles.title}>{I18n.t('wf_chatflow_143')}</div>
        <IconButton
          icon={
            expand ? (
              <IconCozArrowDown className="coz-fg-primary" />
            ) : (
              <IconCozArrowUp className="coz-fg-primary" />
            )
          }
          color="secondary"
          size="small"
          onClick={handleSwitchExpand}
        />
      </div>
      {/* The community version does not currently support conversation management in project, for future expansion */}
      {IS_OPEN_SOURCE ? null : (
        <div
          className={classnames(
            styles.item,
            compareURI(context?.uri, SESSION_CONFIG_URI) && styles.activate,
          )}
          onClick={handleOpenSession}
        >
          <IconCozChatSetting
            className="coz-fg-plus"
            style={{ marginRight: 4 }}
          />
          {I18n.t('wf_chatflow_101')}
        </div>
      )}
      <div
        className={classnames(
          styles.item,
          compareURI(context?.uri, VARIABLE_CONFIG_URI) && styles.activate,
        )}
        onClick={handleOpenVariables}
      >
        <IconCozVariables className="coz-fg-plus" style={{ marginRight: 4 }} />
        {I18n.t('dataide002')}
      </div>
    </div>
  );
};
