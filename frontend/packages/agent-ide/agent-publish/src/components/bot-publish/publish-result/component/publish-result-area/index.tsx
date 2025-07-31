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

import ReactMarkdown from 'react-markdown';

import copy from 'copy-to-clipboard';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, UIButton, UITag, UIToast, Space } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { BindType } from '@coze-arch/bot-api/developer_api';
import { IconInfoCircle } from '@douyinfe/semi-icons';

import { type ConnectResultInfo } from '../../typings';

import styles from './index.module.less';

interface PublishStatusProp {
  record: ConnectResultInfo;
}

export const PublishResultArea = (props: PublishStatusProp) => {
  const { record } = props;

  const onCopy = (text: string) => {
    const res = copy(text);
    if (!res) {
      throw new CustomError('normal_error', 'custom error');
    }
    UIToast.success({
      content: I18n.t('copy_success'),
      showClose: false,
    });
  };

  return (
    <>
      <Space className={styles['config-status']}>
        {record.fail_text ? (
          <Tooltip
            content={
              record.fail_text ? (
                <ReactMarkdown
                  skipHtml={true}
                  className={styles.markdown}
                  linkTarget="_blank"
                >
                  {record.fail_text}
                </ReactMarkdown>
              ) : null
            }
          >
            <UITag color={'green'}>
              {I18n.t('Success')}
              <IconInfoCircle />
            </UITag>
          </Tooltip>
        ) : (
          <UITag color={'green'}>{I18n.t('Success')}</UITag>
        )}
        {record.share_link ? (
          <UIButton
            theme="borderless"
            onClick={() => {
              window.open(record.share_link);
            }}
          >
            {I18n.t('bot_list_open_button', {
              platform: record.name,
            })}
          </UIButton>
        ) : null}
        {record.share_link ? (
          <UIButton
            theme="borderless"
            onClick={() => {
              onCopy(record.share_link);
            }}
          >
            {I18n.t('bot_publish_result_copy_bot_link')}
          </UIButton>
        ) : null}
        {record.bind_type === BindType.ApiBind ? (
          <UIButton
            theme="borderless"
            onClick={() => window.open('/docs/developer_guides')}
          >
            {I18n.t('coze_api_instru')}
          </UIButton>
        ) : null}
      </Space>
    </>
  );
};
