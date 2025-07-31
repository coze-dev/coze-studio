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

import React, { useMemo, useState, useCallback } from 'react';

import cls from 'classnames';
import {
  IconCozCrossFill,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { Typography, Loading, Skeleton } from '@coze-arch/coze-design';
import {
  type TitlePropsType,
  DISABLE_HANDLE_EVENT,
  Command,
  type ProjectIDEWidget,
} from '@coze-project-ide/framework';

import styles from './styles.module.less';

export const WidgetTitle: React.FC<TitlePropsType> = ({
  commandRegistry,
  title,
  widget,
  uiState,
  registry,
}) => {
  const [tabHovered, setTabHovered] = useState(false);
  const renderIcon = useMemo(() => {
    if (!registry?.renderIcon || typeof registry?.renderIcon !== 'function') {
      return null;
    }
    return registry.renderIcon((widget as ProjectIDEWidget).context);
  }, [registry]);

  const renderTitle = useMemo(() => {
    if (tabHovered) {
      return (
        <IconCozCrossFill
          className="coz-fg-secondary"
          style={{ fontSize: 16 }}
          onClick={e => {
            e.stopPropagation();
            commandRegistry.executeCommand(
              Command.Default.VIEW_SAVING_WIDGET_CLOSE_CONFIRM,
              [widget?.title],
            );
          }}
        />
      );
    }
    // No title, still in the skeleton screen stage.
    if (!title) {
      return null;
    } else if (uiState === 'saving') {
      return <Loading size="mini" loading={true} />;
    } else if (uiState === 'error') {
      return <IconCozWarningCircleFill className="text-lg coz-fg-hglt-red" />;
    }
    return null;
  }, [uiState, widget, tabHovered, commandRegistry, title]);

  const handleTabHover = useCallback(() => {
    setTabHovered(true);
  }, []);

  const handleTabBlur = useCallback(() => {
    setTabHovered(false);
  }, []);

  return (
    <div
      className={styles['title-container']}
      onMouseOver={handleTabHover}
      onMouseLeave={handleTabBlur}
    >
      {uiState === 'loading' || !title ? (
        <div className={styles['widget-title']}>
          <div className={styles['title-label']}>
            <Skeleton.Title style={{ width: '100px' }} />
          </div>
          <div className={cls(styles['close-icon'], DISABLE_HANDLE_EVENT)}>
            {renderTitle}
          </div>
        </div>
      ) : (
        <div className={styles['widget-title']}>
          <div className={styles['title-label']}>
            <div className={styles['label-icon']}>{renderIcon}</div>
            <div className={styles['label-text']}>
              <Typography.Text ellipsis={{ showTooltip: true }}>
                {title}
              </Typography.Text>
            </div>
          </div>
          <div className={cls(styles['close-icon'], DISABLE_HANDLE_EVENT)}>
            {renderTitle}
          </div>
        </div>
      )}
    </div>
  );
};

export const widgetTitleRender = props => <WidgetTitle {...props} />;
