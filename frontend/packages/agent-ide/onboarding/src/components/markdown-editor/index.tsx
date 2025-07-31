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
  /** Truncated function when maximum length is exceeded */
  getSlicedTextOnExceed?: (value: string) => string;
}

/**
 * fully controlled component
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
