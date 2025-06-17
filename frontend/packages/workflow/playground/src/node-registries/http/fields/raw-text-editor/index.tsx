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
            // 表单内禁止编辑
            readonly={readonly}
          />
        </EditorProvider>
      </InnerEditorContainer>
    );
  },
);
