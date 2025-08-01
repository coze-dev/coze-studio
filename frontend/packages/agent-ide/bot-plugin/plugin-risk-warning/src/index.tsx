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

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/bot-semi';
import {
  IconApiOutlined,
  IconCommunityTabOutlined,
  IconDiscussOutlined,
} from '@coze-arch/bot-icons';
import { RiskAlertType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { useRiskWarningStore } from './store';

import styles from './index.module.less';
export interface UsePluginRiskReturnValue {
  node: JSX.Element;
  open: () => void;
  close: () => void;
}
const ContentMap = [
  {
    icon: <IconCommunityTabOutlined />,
    text: I18n.t('plugin_quote_tip_1'),
  },
  {
    icon: <IconDiscussOutlined />,
    text: I18n.t('plugin_quote_tip_2'),
  },
  {
    icon: <IconApiOutlined />,
    text: I18n.t('plugin_quote_tip_3'),
  },
];

export const handlePluginRiskWarning = () => {
  const { pluginRiskIsRead, setPluginRiskIsRead } =
    useRiskWarningStore.getState();

  const handleClose = () => {
    PlaygroundApi.UpdateUserConfig({
      risk_alert_type: RiskAlertType.Plugin,
    });
  };

  if (!pluginRiskIsRead) {
    setPluginRiskIsRead(true);

    Modal.warning({
      icon: null,
      title: I18n.t('About_Plugins_tip'),
      content: (
        <div className={styles['modal-wrap']}>
          {ContentMap.map(item => (
            <div className={styles['modal-item']}>
              {item.icon}
              <span className={styles['modal-text']}>{item.text}</span>
            </div>
          ))}
        </div>
      ),
      onOk: handleClose,
      onCancel: handleClose,
      hasCancel: false,
      maskClosable: false,
      className: styles['ui-modal'],
      okText: I18n.t('Confirm'),
      okButtonProps: {
        style: {
          minWidth: '96px',
        },
      },
    });
  }
};
