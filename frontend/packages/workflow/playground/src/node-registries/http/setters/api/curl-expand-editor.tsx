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

import { type FC, useCallback, useState } from 'react';

import classNames from 'classnames';
import { EditorProvider } from '@coze-editor/editor/react';
import { I18n } from '@coze-arch/i18n';
import { IconWarningInfo } from '@coze-arch/bot-icons';
import {
  IconCozImport,
  IconCozMoon,
  IconCozSun,
} from '@coze-arch/coze-design/icons';
import { IconButton, Modal, Toast } from '@coze-arch/coze-design';

import { CURLParser, type ParsedResult } from '@/utils';
import {
  useEditorThemeState,
  EditorTheme,
} from '@/hooks/use-editor-theme-state';
import { ExpandEditorContainer } from '@/components/editor-container';

import { HttpMethod } from '../constants';
import { BaseBashEditor } from '../../components/base-editor';

import styles from './index.module.less';

export const CurlExpandEditor: FC<{
  id: string;
  onChange: (data: ParsedResult) => void;
  onClose: () => void;
}> = props => {
  const { id, onClose, onChange } = props;

  const [curlStr, setCurlStr] = useState('');

  const { isDarkTheme, setEditorTheme } = useEditorThemeState();

  const handleChangeTheme = () => {
    const nextTheme = isDarkTheme ? EditorTheme.Light : EditorTheme.Dark;
    setEditorTheme(nextTheme);
  };

  const onConfirmImport = useCallback(
    async () =>
      new Promise(resolve => {
        Modal.warning({
          icon: (
            <IconWarningInfo
              className={styles.warningIcon}
              style={{
                width: 22,
                height: 22,
              }}
            />
          ),
          title: I18n.t('workflow_json_node_update_tips_title'),
          content: I18n.t('workflow_json_node_update_tips_content'),
          okType: 'warning',
          okText: I18n.t('Confirm'),
          cancelText: I18n.t('Cancel'),
          onOk: () => {
            try {
              const curlObj = new CURLParser(curlStr);
              const nextFormData = curlObj.parse();
              if (!HttpMethod?.[nextFormData?.method]) {
                throw new Error('cURL Method Error');
              }
              onChange(nextFormData);
            } catch (e) {
              Toast.warning({
                content: 'cURL Format Error',
                duration: 3,
              });
              console.warn('cURL Format Error', e);
            }
            resolve(true);
          },
          onCancel: () => resolve(false),
        });
      }),
    [curlStr],
  );

  return (
    <ExpandEditorContainer
      id={id}
      onClose={onClose}
      closeIconClassName={classNames({
        [styles.themeIconDark]: isDarkTheme,
      })}
      editorTitle={I18n.t('node_http_import_curl', {}, '导入 cURL')}
      headerClassName={classNames(styles['expand-header'], {
        [styles['expand-header-dark']]: isDarkTheme,
      })}
      contentClassName={classNames(styles['expand-content'], {
        [styles['expand-content-dark']]: isDarkTheme,
      })}
      editorContent={
        <EditorProvider>
          <BaseBashEditor
            className={styles.editorWrapper}
            placeholder={I18n.t(
              'node_http_import_curl_placeholder',
              {},
              '请输入cURL',
            )}
            value={curlStr}
            onChange={v => setCurlStr(v as string)}
            minHeight="100%"
            maxHeight="100%"
            editerHeight="100%"
            padding="12px"
            isDarkTheme={isDarkTheme}
          />
        </EditorProvider>
      }
      actions={[
        <IconButton
          color="highlight"
          className={classNames(styles.importButton, {
            [styles.importButtonDark]: isDarkTheme,
          })}
          icon={<IconCozImport className={styles.buttonIcon} />}
          onClick={onConfirmImport}
        >
          {I18n.t('import', {}, '导入')}
        </IconButton>,
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
