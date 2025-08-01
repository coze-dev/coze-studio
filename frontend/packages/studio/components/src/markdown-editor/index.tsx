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
 * fully controlled component
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
