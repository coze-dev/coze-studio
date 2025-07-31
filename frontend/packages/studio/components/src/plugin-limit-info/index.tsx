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

import React, { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Avatar, Typography, UITable, useUIModal } from '@coze-arch/bot-semi';
import {
  type PluginPricingRule,
  PluginPricingStrategy,
} from '@coze-arch/bot-api/plugin_develop';

import styles from './index.module.less';

export const PluginLimitName: FC<{
  name: string;
  url: string;
}> = ({ name, url }) => (
  <span className="flex items-center">
    <Avatar
      size="small"
      className="h-6 flex-none flex-shrink-0 mr-2 w-6"
      shape="square"
      src={url}
    ></Avatar>
    <Typography.Text ellipsis={{ showTooltip: true }}>{name}</Typography.Text>
  </span>
);

export interface UsePluginLimitModalProps {
  content: React.ReactNode;
  dataSource: Array<{
    info: {
      name: string;
      url: string;
    };
    price: number;
  }>;
}

export const transPricingRules = (
  pluginPricingRules?: Array<PluginPricingRule>,
) =>
  Array.isArray(pluginPricingRules)
    ? pluginPricingRules
        .filter(item => item.PricingStrategy !== PluginPricingStrategy.Free)
        .map(item => ({
          info: {
            name: item?.PluginInfo?.name,
            url: item?.PluginInfo?.plugin_icon,
          },
          price: parseInt(item?.PriceResult?.TokensForOnce ?? '0'),
        }))
    : [];

export const usePluginLimitModal = ({
  content,
  dataSource,
}: UsePluginLimitModalProps) => {
  const { modal, open, close } = useUIModal({
    okText: I18n.t('plugin_usage_limits_modal_got_it_button'),
    onOk: () => {
      close();
    },
    title: I18n.t('plugin_usage_limits_modal_title'),
    hasCancel: false,
    onCancel: () => {
      close();
    },
  });
  return {
    node: modal(
      <>
        {content ? content : null}
        <UITable
          tableProps={{
            className: styles['plugin-limit-table'],
            columns: [
              {
                width: 192,
                title: I18n.t('plugin_usage_limits_modal_table_header_plugin'),
                dataIndex: 'info',
                render: info => (
                  <PluginLimitName name={info.name} url={info.url} />
                ),
              },
              {
                title: I18n.t('plugin_usage_limits_modal_table_header_price'),
                dataIndex: 'price',
                render: text => <span>{text} Coze tokens</span>,
              },
            ],
            dataSource,
            size: 'small',
          }}
        />
      </>,
    ),
    open: () => {
      open();
    },
    close,
  };
};
