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
import { I18n } from '@coze-arch/i18n';

import { useEditorThemeState } from '@/hooks/use-editor-theme-state';
import { useField, withField } from '@/form';
import { InnerEditorContainer } from '@/components/editor-container';

import { InnerEditor } from './inner-editor';

import styles from './index.module.less';

export const JsonExtensionEditorField = withField(() => {
  const { value, errors, readonly } = useField<string>();

  const { isDarkTheme } = useEditorThemeState();

  return (
    <InnerEditorContainer
      name={'http-field-json-container'}
      className={styles['json-editor-container']}
      isError={!readonly && !!errors?.length}
    >
      <EditorProvider>
        <InnerEditor
          name={'http-field-json-editor'}
          placeholder={I18n.t('node_http_json_input')}
          value={value as string}
          minHeight={78}
          // Forbid editing in the form
          readonly={true}
          borderRadius={8}
          isDarkTheme={isDarkTheme}
        />
      </EditorProvider>
    </InnerEditorContainer>
  );
});
