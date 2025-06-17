import { type FC, useRef, useEffect } from 'react';

import classNames from 'classnames';
import { PublicScopeProvider } from '@coze-workflow/variable';
import { EditorProvider } from '@coze-editor/editor/react';
import { I18n } from '@coze-arch/i18n';
import { IconCozBroom, IconCozMoon, IconCozSun } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import {
  useEditorThemeState,
  EditorTheme,
} from '@/hooks/use-editor-theme-state';
import { ExpandEditorContainer } from '@/components/editor-container';

import { InnerEditor } from '../inner-editor';
import styles from '../index.module.less';

export const JsonExpandEditor: FC<{
  id: string;
  value: string;
  onChange: (data: string) => void;
  onClose: () => void;
}> = props => {
  const { id, onClose, value, onChange } = props;
  const readonly = useReadonly();
  const editorRef = useRef<{ formatJson: () => Promise<void> }>(null);

  const { isDarkTheme, setEditorTheme } = useEditorThemeState();

  const handleChangeTheme = () => {
    const nextTheme = isDarkTheme ? EditorTheme.Light : EditorTheme.Dark;
    setEditorTheme(nextTheme);
  };

  const handleFormatJson = () => {
    editorRef.current?.formatJson?.();
  };

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current?.formatJson?.();
  }, []);

  return (
    <ExpandEditorContainer
      id={id}
      onClose={onClose}
      closeIconClassName={classNames({
        [styles.themeIconDark]: isDarkTheme,
      })}
      editorTitle={'JSON'}
      headerClassName={classNames(styles['expand-header'], {
        [styles['expand-header-dark']]: isDarkTheme,
      })}
      contentClassName={classNames(styles['expand-content'], {
        [styles['expand-content-dark']]: isDarkTheme,
      })}
      editorContent={
        <PublicScopeProvider>
          <EditorProvider>
            <InnerEditor
              ref={editorRef}
              value={value}
              placeholder={I18n.t('node_http_json_data_input')}
              onChange={v => {
                onChange(v as string);
              }}
              name={id}
              isDarkTheme={isDarkTheme}
              readonly={readonly}
              minHeight="100%"
              maxHeight="100%"
              editerHeight="100%"
              padding="12px"
              editorClassName={styles.editorWrapper}
            />
          </EditorProvider>
        </PublicScopeProvider>
      }
      actions={[
        <Tooltip content={I18n.t('node_http_json_format')}>
          <span>
            <IconButton
              onClick={handleFormatJson}
              icon={
                <IconCozBroom
                  fontSize={18}
                  className={classNames(
                    isDarkTheme ? styles.themeIconDark : styles.themeIconLight,
                  )}
                />
              }
              size="small"
              color="secondary"
              aria-label="format"
            />
          </span>
        </Tooltip>,
        <span>
          <IconButton
            onClick={handleChangeTheme}
            icon={
              isDarkTheme ? (
                <IconCozMoon fontSize={18} className={styles.themeIconDark} />
              ) : (
                <IconCozSun fontSize={18} className={styles.themeIconLight} />
              )
            }
            size="small"
            color="secondary"
            aria-label="close"
          />
        </span>,
      ]}
    />
  );
};
