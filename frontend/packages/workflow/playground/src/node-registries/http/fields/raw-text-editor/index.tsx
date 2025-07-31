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

import { EditorProvider } from '@coze-editor/editor/react';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { useField, withField } from '@/form';
import { InnerEditorContainer } from '@/components/editor-container';

import { InnerEditor } from './inner-editor';

import styles from './index.module.less';

export const RawTextEditorField = withField(
  ({
    placeholder,
    minHeight,
  }: {
    placeholder?: string;
    minHeight?: string | number;
  }) => {
    const { name, value, onChange, onBlur, errors } = useField<string>();
    const readonly = useReadonly();

    return (
      <InnerEditorContainer
        name={name}
        onBlur={() => onBlur?.()}
        className={styles['raw-editor-container']}
        isError={!readonly && !!errors?.length}
      >
        <EditorProvider>
          <InnerEditor
            name={'http-field-json-editor'}
            placeholder={placeholder}
            value={value as string}
            onChange={onChange}
            minHeight={minHeight}
            // Forbid editing in the form
            readonly={readonly}
          />
        </EditorProvider>
      </InnerEditorContainer>
    );
  },
);
