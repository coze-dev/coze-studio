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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  List,
  UIButton,
  UIModal,
  Image,
  Typography,
  Space,
} from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface TermServiceModalReturnType {
  node: JSX.Element;
  open: () => void;
  close: () => void;
}

export interface TermServiceInfo {
  name: string;
  icon: string;
  privacy_policy?: string;
  user_agreement?: string;
}

export const useTermServiceModal = ({
  dataSource,
}: {
  dataSource: TermServiceInfo[];
}): TermServiceModalReturnType => {
  const [visible, setVisible] = useState(false);
  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  return {
    node: (
      <UIModal
        type="info"
        title={I18n.t('publish_terms_title')}
        visible={visible}
        centered
        footer={
          <UIButton onClick={handleClose} theme="solid">
            {I18n.t('got_it')}
          </UIButton>
        }
        onCancel={handleClose}
      >
        <List
          dataSource={dataSource}
          renderItem={item => (
            <List.Item
              className={styles.list}
              align="center"
              header={
                <div className="flex items-center w-full">
                  <Image
                    className={'border-1'}
                    src={item.icon}
                    width={24}
                    height={24}
                    preview={false}
                    style={{ flexShrink: 0 }}
                  ></Image>
                  <Typography.Text
                    className="ml-2 font-semibold	"
                    style={{ minWidth: 90 }}
                    ellipsis={{
                      showTooltip: {
                        opts: {
                          content: item.name,
                        },
                      },
                    }}
                  >
                    {item.name}
                  </Typography.Text>
                </div>
              }
              main={
                <Space spacing={0} className="justify-end">
                  {item.privacy_policy ? (
                    <UIButton theme="borderless" className="!px-2">
                      <Typography.Text
                        link={{ href: item.privacy_policy, target: '_blank' }}
                      >
                        {I18n.t('about_privacy_policy')}
                      </Typography.Text>
                    </UIButton>
                  ) : null}
                  {item.user_agreement ? (
                    <UIButton theme="borderless" className="!px-2">
                      <Typography.Text
                        link={{ href: item.user_agreement, target: '_blank' }}
                      >
                        {I18n.t('terms_of_service')}
                      </Typography.Text>
                    </UIButton>
                  ) : null}
                </Space>
              }
            />
          )}
        />
      </UIModal>
    ),
    close: handleClose,
    open: handleOpen,
  };
};
