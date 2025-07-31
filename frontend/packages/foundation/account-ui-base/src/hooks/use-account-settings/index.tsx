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

import { type ReactElement, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography, Space } from '@coze-arch/coze-design';
import { UITabBar, Divider } from '@coze-arch/bot-semi';

import { useModal } from './use-modal';

import s from './index.module.less';

export interface TabItem {
  id: string;
  tabName: string;
  /**
   * @param close settings pop-up
   * @returns ReactElement
   */
  content: (close?: () => void) => ReactElement;
}

export const useAccountSettings = ({
  tabs,
  onClose,
}: {
  tabs: Array<TabItem | 'divider'>;
  onClose?: () => void;
}) => {
  const realTabs = tabs.filter(item => item !== 'divider');

  const [currentTab, setCurrentTab] = useState(() => realTabs[0]?.id);

  const { content, tabName } =
    realTabs.find(item => String(item.id) === currentTab) || {};

  const tabList = tabs.map(item => {
    if (item === 'divider') {
      return {
        tab: <Divider className="disabled pt-[1px] pb-[1px]" />,
        itemKey: 'general',
        disabled: true,
      };
    }
    return {
      tab: item.tabName,
      itemKey: String(item.id),
    };
  });

  const { open, close, modal } = useModal({
    title: null,
    centered: true,
    onCancel: () => {
      onClose?.();
      close();
    },
    className: s['profile-modal'],
    height: 600,
    width: 1120,
    linearGradientMask: true,
  });

  const Content = (
    <Space align="start" spacing={24} className="flex">
      <Space vertical align="start" spacing={16} className={s['profile-left']}>
        <Typography.Text className={`${s['text-20']} pl-[8px]`}>
          {I18n.t('profile_settings')}
        </Typography.Text>
        <UITabBar
          wrapperClass={s['profile-tab']}
          tabList={tabList}
          activeKey={currentTab}
          onChange={setCurrentTab}
          tabPosition="left"
          type="button"
        />
      </Space>
      <div className={s.divider}></div>
      <Space vertical className={'w-full' + ` ${s['profile-right']}`}>
        <Typography.Text className={`${s.title}`}>{tabName}</Typography.Text>
        <div className={s.container}>{content?.(close)}</div>
      </Space>
    </Space>
  );

  return {
    node: <>{modal(Content)}</>,
    open: (tabId?: string) => {
      if (tabId && realTabs.find(item => String(item.id) === tabId)) {
        setCurrentTab(tabId);
      }
      open();
    },
    close: () => {
      close();
    },
  };
};
