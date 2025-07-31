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

import { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { IconCrossStroked } from '@douyinfe/semi-icons';
import { json as languageJSON } from '@coze-editor/editor/language-json';
import { I18n } from '@coze-arch/i18n';
import { Button, IconButton, Tooltip, Modal } from '@coze-arch/coze-design';
import {
  IconInfo,
  IconUpdateOutlined,
  IconWarningInfo,
} from '@coze-arch/bot-icons';

import { CodeEditor, EditorProvider } from '@/components/code-editor';

import type { TreeNodeCustomData } from '../custom-tree-node/type';

import styles from './index.module.less';

const uri = 'file:///json-import/data.json';
languageJSON.languageService.configureSchemas({
  uri: 'file:///import-schema.json',
  fileMatch: [uri],
  schema: {
    type: 'object',
    properties: {},
  },
});

interface JSONEditorProps {
  id: string;
  value: string;
  setValue: (value: string) => void;
  onClose: () => void;
  onChange: (value: TreeNodeCustomData[]) => void;
}

export const JSONEditor: FC<JSONEditorProps> = props => {
  const { id, value, setValue, onClose, onChange } = props;
  const [schema, setSchema] = useState<TreeNodeCustomData[] | undefined>();
  const tooltipPopContainerRef = useRef<HTMLDivElement>(null);

  const change = useCallback(async () => {
    if (!schema) {
      return;
    }
    return new Promise(resolve => {
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
        onOk: async () => {
          const outputValue = (await convert(value)) || [];
          onChange(outputValue);
          resolve(true);
        },
        onCancel: () => resolve(false),
      });
    });
  }, [schema]);

  const convert = async (
    jsonString: string,
  ): Promise<TreeNodeCustomData[] | undefined> => {
    const { convertSchema } = await import(
      '@coze-workflow/code-editor-adapter'
    );
    if (!jsonString) {
      return;
    }
    try {
      const json = JSON.parse(jsonString);
      const outputValue = convertSchema(
        json,
      ) as unknown as TreeNodeCustomData[];
      if (
        !outputValue ||
        !Array.isArray(outputValue) ||
        outputValue.length === 0
      ) {
        return;
      }
      return outputValue;
    } catch (e) {
      return;
    }
  };

  // Synchronizing values and schemas
  useEffect(() => {
    const handler = async () => {
      const _schema = await convert(value);
      setSchema(_schema);
    };

    handler();
  }, [value]);

  return (
    <div key={id} className={styles.container}>
      <div className={styles.header}>
        <span className={styles.leftSide}>
          <span className={styles.title}>
            <p>{I18n.t('workflow_json_windows_title')}</p>
          </span>
          <span>
            <Tooltip
              className={styles.tip}
              position="bottom"
              getPopupContainer={() =>
                tooltipPopContainerRef.current as HTMLElement
              }
              content={I18n.t('workflow_json_windows_title_tips')}
            >
              <IconInfo className={styles.info} />
            </Tooltip>
          </span>
        </span>
        <span className={styles.rightSide}>
          <span
            style={{
              display: schema ? 'flex' : 'none',
            }}
          >
            <IconButton
              icon={<IconUpdateOutlined />}
              size="small"
              color="primary"
              onClick={() => change()}
            >
              {I18n.t('workflow_json_button_node_update')}
            </IconButton>
          </span>
          <span>
            <Button
              icon={<IconCrossStroked />}
              size="small"
              color="secondary"
              aria-label="close"
              onClick={() => onClose()}
            />
          </span>
        </span>
        <span
          className={styles.tooltipPopContainer}
          ref={tooltipPopContainerRef}
        ></span>
      </div>
      <div className={styles.content}>
        <EditorProvider>
          <CodeEditor
            key={id}
            domProps={{
              style: {
                width: '100%',
                height: '100%',
              },
            }}
            defaultValue={value}
            options={{
              uri,
              languageId: 'json',
              minHeight: '100%',
              maxHeight: '100%',
              theme: 'coze-dark',
              fontSize: 12,
              borderRadius: '6px',
            }}
            onChange={e => {
              setValue(e.value || '');
            }}
          />
        </EditorProvider>
      </div>
    </div>
  );
};
