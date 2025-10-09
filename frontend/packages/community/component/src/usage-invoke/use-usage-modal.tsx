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

/* eslint-disable complexity */

import { useState } from 'react';

import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { Modal, Space, Tag } from '@coze-arch/coze-design';
import { formatPercent } from '@coze-arch/bot-utils';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

import { formatNumber } from './format-number';

interface UsageModalProps {
  entity_id?: string;
}

//账号付费插件调用量弹窗hook
export const useUsageModal = ({ entity_id }: UsageModalProps) => {
  const [visible, setVisible] = useState(false);

  const { data } = useRequest(
    async () =>
      await ProductApi.PublicGetProductCallInfo({
        entity_type: ProductEntityType.Plugin,
        entity_id,
        enterprise_id: '',
      }),
    {
      ready: visible,
      refreshDeps: [visible, entity_id],
    },
  );

  const onClose = () => {
    setVisible(false);
  };

  // 获取消耗比例
  const getUseRadio = () => {
    if (
      !data?.data?.call_count_limit?.used_count ||
      !data?.data?.call_count_limit?.total_count
    ) {
      return 0;
    }
    return (
      data?.data?.call_count_limit?.used_count /
      data?.data?.call_count_limit?.total_count
    );
  };

  return {
    node: (
      <Modal
        visible={visible}
        onCancel={onClose}
        maskClosable={false}
        closeOnEsc={true}
        title="账号付费插件调用量1"
        width={525}
        footer={null}
      >
        <div className="coz-fg-primary">
          <div>
            <div>
              <Space spacing={4} className="mb-[16px]">
                <span className="w-[110px] font-[500]">账号信息</span>
                <Tag color="primary" size="mini">
                  {data?.data?.user_level}
                </Tag>
              </Space>
            </div>

            <Space spacing={4} className="mb-[16px]">
              <span className="w-[110px] font-[500]">订阅版本</span>
              <Tag color="primary" size="mini">
                {data?.data?.user_level}
              </Tag>
            </Space>

            <div className="mb-[16px]">
              <Space spacing={4}>
                <span className="w-[110px] font-[500]">调用次数</span>
                {data?.data?.call_count_limit?.is_unlimited ? (
                  <span>无上限</span>
                ) : (
                  <>
                    <span>
                      {`${formatNumber(data?.data?.call_count_limit?.used_count)}/${formatNumber(data?.data?.call_count_limit?.total_count)}`}
                    </span>
                    <span className="coz-fg-secondary">
                      {`（${dayjs
                        .unix(
                          Number(data?.data?.call_count_limit?.reset_datetime),
                        )
                        .format('YYYY-MM-DD')} 重置）`}
                    </span>
                    {getUseRadio() > 0.8 && (
                      <Tag color="yellow" size="mini">
                        {formatPercent(getUseRadio())}
                      </Tag>
                    )}
                  </>
                )}
              </Space>
            </div>
            <Space spacing={4}>
              <span className="w-[110px] font-[500]">QPS</span>
              <span>{formatNumber(data?.data?.call_rate_limit?.qps)}</span>
            </Space>
          </div>
        </div>
      </Modal>
    ),
    open: () => {
      setVisible(true);
    },
    close: onClose,
  };
};
