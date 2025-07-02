import { type CSSProperties } from 'react';

import classNames from 'classnames';

import { type CustomUploadParams, type CustomUploadRes } from './type';
import { useMarkdownEditor } from './hooks/use-markdown-editor';
import { UploadProgressMask } from './components/upload-progress-mask';
import { ActionBar } from './components/action-bar';

import styles from './index.module.less';

export interface MarkdownEditorProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  getUserId?: () => string;
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
  customUpload?: (params: CustomUploadParams) => CustomUploadRes;
}

/**
 * 全受控组件
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  placeholder = '',
  className,
  disabled,
  style,
  ...props
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
    ...props,
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
        disabled={disabled}
      />
      <textarea
        ref={textAreaRef}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={onTextareaChange}
        className={styles['markdown-editor-content']}
      />
      {uploadState && <UploadProgressMask {...uploadState} />}
    </div>
  );
};
