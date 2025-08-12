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

import React, { useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
import { useNodeRender } from '@flowgram-adapter/free-layout-editor';

import styles from './node-status-bar.module.less';

interface NodeStatusBarProps {
  header?: React.ReactNode;
  defaultShowDetail?: boolean;
  hasExecuteResult?: boolean;
  needAuth?: boolean;
  /**
   * Is session handling included?
   */
  hasConversation?: boolean;
  onAuth?: () => void;
  onJumpToProjectConversation?: () => void;
  extraBtns?: React.ReactNode[];
}

export const NodeStatusBar: React.FC<
  React.PropsWithChildren<NodeStatusBarProps>
> = ({
  header,
  defaultShowDetail,
  hasExecuteResult,
  needAuth,
  onAuth,
  hasConversation,
  onJumpToProjectConversation,
  children,
  extraBtns = [],
}) => {
  const [showDetail, setShowDetail] = useState(defaultShowDetail);
  const { selectNode } = useNodeRender();

  const handleAuth = e => {
    e.stopPropagation();
    selectNode(e);
    onAuth?.();
  };
  const handleToggleShowDetail = e => {
    e.stopPropagation();
    selectNode(e);
    setShowDetail(!showDetail);
  };
  const handleConversation = e => {
    e.stopPropagation();
    selectNode(e);
    onJumpToProjectConversation?.();
  };

  return (
    <div
      className={styles['node-status-bar']}
      // It is necessary to disable down bubbling to prevent judgment circling and node hovering (polygons are not supported)
      onMouseDown={e => e.stopPropagation()}
      // Other events uniformly go to the click event, and it is also necessary to prevent bubbling.
      onClick={handleToggleShowDetail}
    >
      <div
        className={classNames(styles['status-header'], {
          [styles['status-header-opened']]: showDetail,
        })}
      >
        <div className={styles['status-title']}>
          {header}
          {extraBtns.length > 0 ? extraBtns : null}
          {needAuth ? (
            <Button size="small" color="secondary" onClick={handleAuth}>
              {I18n.t('knowledge_feishu_10')}
            </Button>
          ) : null}
          {hasConversation ? (
            <Button size="small" color="secondary" onClick={handleConversation}>
              {I18n.t('workflow_view_data')}
            </Button>
          ) : null}
        </div>
        <div className={styles['status-btns']}>
          {hasExecuteResult ? (
            <IconCozArrowDown
              className={classNames({
                [styles['is-show-detail']]: showDetail,
              })}
            />
          ) : null}
        </div>
      </div>
      {showDetail ? children : null}
    </div>
  );
};
