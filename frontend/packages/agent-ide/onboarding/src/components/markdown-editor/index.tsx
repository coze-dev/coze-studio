import { type CSSProperties } from 'react';

import classNames from 'classnames';
import { TextArea } from '@coze-arch/coze-design';

import { useMarkdownEditor } from './hooks/use-markdown-editor';
import { UploadProgressMask } from './components/upload-progress-mask';
import { ActionBar } from './components/action-bar';

import styles from './index.module.less';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  getUserId: () => string;
  className?: string;
  style?: CSSProperties;
  maxLength?: number | undefined;
  getValueLength?: (value: string) => number;
  /** 超过最大长度时截断函数 */
  getSlicedTextOnExceed?: (value: string) => string;
}

/**
 * 全受控组件
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  className,
  style,
  maxLength,
  getValueLength,
  getSlicedTextOnExceed,
  getUserId,
  onChange,
}) => {
  const {
    textAreaRef,
    dragTargetRef,
    onTextareaChange,
    onTriggerAction,
    isDragOver,
    uploadState,
  } = useMarkdownEditor({
    value,
    maxLength,
    getValueLength,
    getSlicedTextOnExceed,
    getUserId,
    onChange,
  });

  return (
    <div
      className={classNames(
        styles['markdown-editor'],
        isDragOver && styles['markdown-editor-drag'],
        className,
      )}
      style={style}
      ref={dragTargetRef}
    >
      <ActionBar
        className={styles['markdown-action-bar']}
        onTriggerAction={onTriggerAction}
      />
      <TextArea
        ref={textAreaRef}
        value={value}
        onChange={onTextareaChange}
        className={styles['markdown-editor-content']}
        wrapperClassName={styles['markdown-editor-wrapper']}
        maxLength={maxLength}
        getValueLength={getValueLength}
      />
      {uploadState ? <UploadProgressMask {...uploadState} /> : null}
    </div>
  );
};
