import React, { useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze/coze-design/icons';
import { Button } from '@coze/coze-design';
import { useNodeRender } from '@flowgram-adapter/free-layout-editor';

import styles from './node-status-bar.module.less';

interface NodeStatusBarProps {
  header?: React.ReactNode;
  defaultShowDetail?: boolean;
  hasExecuteResult?: boolean;
  needAuth?: boolean;
  /**
   * 是否包含会话处理
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
      // 必须要禁止 down 冒泡，防止判定圈选和 node hover（不支持多边形）
      onMouseDown={e => e.stopPropagation()}
      // 其他事件统一走点击事件，且也需要阻止冒泡
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
