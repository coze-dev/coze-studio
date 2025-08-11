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
} from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

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
