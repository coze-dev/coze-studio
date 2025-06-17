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
          // 表单内禁止编辑
          readonly={true}
          borderRadius={8}
          isDarkTheme={isDarkTheme}
        />
      </EditorProvider>
    </InnerEditorContainer>
  );
});
