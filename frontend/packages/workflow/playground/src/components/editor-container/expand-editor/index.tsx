import type { FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozSideCollapse } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

import styles from './index.module.less';

interface ExpandEditorContainerProps {
  id: string;
  onClose?: () => void;
  editorTitle?: React.ReactNode;
  editorTooltip?: string;
  actions?: React.ReactNode[];
  closeButton?: React.ReactNode;
  closeIconClassName?: string;
  editorContent?: React.ReactNode;
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * 弹窗编辑器容器
 * @param editorTitle 弹窗标题
 * @param editorTooltip 弹窗说明
 * @param actions 标题工具栏
 * @param closeButton 自定义关闭按钮
 * @param closeIconClassName 关闭按钮样式
 * @param editorContent 弹窗编辑器区域
 * @param containerClassName 容器样式
 * @param headerClassName 标题样式
 * @param contentClassName 编辑器区域样式
 */
export const ExpandEditorContainer: FC<ExpandEditorContainerProps> = props => {
  const {
    id,
    onClose,
    closeButton,
    editorTitle,
    editorTooltip,
    actions,
    editorContent,
    containerClassName,
    headerClassName,
    contentClassName,
    closeIconClassName,
  } = props;

  return (
    <div key={id} className={classNames(styles.container, containerClassName)}>
      <div className={classNames(headerClassName, styles.header)}>
        <span className={styles.leftSide}>
          {editorTitle}
          {editorTooltip ? (
            <span>
              <Tooltip
                className={styles.tip}
                position="bottom"
                content={editorTooltip}
              >
                <IconInfo className={styles.info} />
              </Tooltip>
            </span>
          ) : null}
        </span>
        <span className={styles.rightSide}>
          {actions?.map((action, index) => <span key={index}>{action}</span>)}
          {closeButton ?? (
            <Tooltip content={I18n.t('node_http_json_collapse')}>
              <span>
                <IconButton
                  icon={
                    <IconCozSideCollapse
                      fontSize={18}
                      className={classNames(
                        closeIconClassName,
                        styles.iconLight,
                      )}
                    />
                  }
                  size="small"
                  color="secondary"
                  aria-label="close"
                  onClick={() => onClose?.()}
                />
              </span>
            </Tooltip>
          )}
        </span>
      </div>
      <div className={classNames(contentClassName, styles.content)}>
        {editorContent}
      </div>
    </div>
  );
};
