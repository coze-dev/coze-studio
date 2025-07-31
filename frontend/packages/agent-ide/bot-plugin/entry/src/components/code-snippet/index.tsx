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

import { useState, useEffect } from 'react';

import copy from 'copy-to-clipboard';
import classNames from 'classnames';
import { userStoreService } from '@coze-studio/user-store';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  UIButton,
  UIModal,
  Space,
  UIToast,
  RadioGroup,
} from '@coze-arch/bot-semi';
import { Editor as MonacoEditor } from '@coze-arch/bot-monaco-editor';
import { ProgramLang } from '@coze-arch/bot-api/plugin_develop';
import {
  SpaceType,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/developer_api';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { getEnv } from '../../util';

import styles from './index.module.less';

const LANG_OPTIONS = [
  { label: 'cURL', value: ProgramLang.Curl },
  { label: 'Wget', value: ProgramLang.Wget },
  { label: 'Node.js', value: ProgramLang.NodeJS },
  { label: 'Python', value: ProgramLang.Python },
  { label: 'Golang', value: ProgramLang.Golang },
];

function getReportLang(lang: ProgramLang) {
  switch (lang) {
    case ProgramLang.Curl:
      return 'curl';
    case ProgramLang.Wget:
      return 'wget';
    case ProgramLang.NodeJS:
      return 'javascript';
    case ProgramLang.Python:
      return 'python';
    case ProgramLang.Golang:
      return 'golang';
    default:
      return '';
  }
}
function getEditorMode(lang: ProgramLang) {
  switch (lang) {
    case ProgramLang.Curl:
      return 'javascript';
    case ProgramLang.Wget:
      return 'javascript';
    case ProgramLang.NodeJS:
      return 'javascript';
    case ProgramLang.Python:
      return 'python';
    case ProgramLang.Golang:
      return 'go';
    default:
      return 'javascript';
  }
}

interface CodeSnippetModalProps {
  visible: boolean;
  onCancel?: () => void;
  pluginAPIInfo?: PluginAPIInfo;
}

export const CodeSnippetModal: React.FC<CodeSnippetModalProps> = props => {
  const { onCancel, visible, pluginAPIInfo } = props;
  const [lang, setLang] = useState<ProgramLang>(ProgramLang.Curl);
  const [content, setContent] = useState<string>('');

  const { id: spaceId, space_type } = useSpaceStore(s => s.space);

  const isPersonal = space_type === SpaceType.Personal;

  const userInfo = userStoreService.useUserInfo();

  useEffect(() => {
    setLang(ProgramLang.Curl);
    setContent('');
  }, [visible]);

  useEffect(() => {
    if (pluginAPIInfo) {
      const fetchCode = async () => {
        setContent('');
        const res = await PluginDevelopApi.PluginAPI2Code({
          plugin_id: pluginAPIInfo.plugin_id || '',
          api_id: pluginAPIInfo.api_id || '',
          space_id: spaceId || '',
          dev_id: userInfo?.user_id_str || '',
          program_lang: lang,
        });
        setContent(res?.program_code || '');
      };
      fetchCode();
    }
  }, [lang, pluginAPIInfo]);

  const handleCopy = () => {
    const resp = copy(content);
    const basicParams = {
      environment: getEnv(),
      workspace_id: spaceId || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      tool_id: pluginAPIInfo?.api_id || '',
      code_type: getReportLang(lang) || '',
      status: 1,
    };
    if (resp) {
      UIToast.success({ content: I18n.t('copy_success') });
      sendTeaEvent(EVENT_NAMES.code_snippet_front, {
        ...basicParams,
        status: 0,
      });
    } else {
      UIToast.warning({ content: I18n.t('copy_failed') });
      sendTeaEvent(EVENT_NAMES.code_snippet_front, {
        ...basicParams,
        status: 1,
        error_message: 'copy_failed',
      });
    }
  };

  return (
    <UIModal
      type="base-composition"
      title={I18n.t('code_snippet')}
      visible={visible}
      onCancel={onCancel}
      footer={
        <Space>
          <UIButton theme="solid" type="primary" onClick={handleCopy}>
            {I18n.t('copy')}
          </UIButton>
        </Space>
      }
      maskClosable={false}
    >
      <div className="h-[100%] flex flex-col min-h-0">
        <div>
          <RadioGroup
            type="card"
            options={LANG_OPTIONS}
            defaultValue={lang}
            className={'mb-[16px]'}
            value={lang}
            onChange={e => setLang(e.target.value)}
          />
        </div>
        <div
          className={classNames(styles['editor-container'], 'flex-1 min-h-0')}
        >
          <MonacoEditor
            className={styles.editor}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
            language={getEditorMode(lang)}
            theme={'tomorrow'}
            width="100%"
            value={content}
          />
        </div>
      </div>
    </UIModal>
  );
};
