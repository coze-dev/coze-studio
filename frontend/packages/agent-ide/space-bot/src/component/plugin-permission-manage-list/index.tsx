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

import { type FC, useRef } from 'react';

import { useSize } from 'ahooks';
import {
  type OAuthPluginInfo,
  OAuthStatus,
} from '@coze-arch/idl/plugin_develop';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import {
  Button,
  type ColumnProps,
  Popconfirm,
  Table,
  Typography,
  Space,
  Tooltip,
  Modal,
} from '@coze-arch/coze-design';
import { IllustrationConstruction } from '@douyinfe/semi-illustrations';

import { usePluginPermissionManage } from '@/hook/use-plugin-permission-manage';

import s from './index.module.less';

const getColumns = ({
  onCancel,
  needPopconfirm,
}): ColumnProps<OAuthPluginInfo>[] => [
  {
    title: I18n.t('permission_manage_modal_table_name'),
    dataIndex: 'name',
    render: (_, record) => (
      <div className="flex items-center gap-[8px]">
        <img
          alt=""
          src={record.plugin_icon}
          className="h-[32px] w-[32px] rounded-[8px]"
        />
        <div className="flex flex-col min-w-0">
          <Typography.Text
            className="coz-fg-primary text-[14px] font-medium lending-[20px]"
            ellipsis={{ showTooltip: true }}
          >
            {record.name}
          </Typography.Text>
          {record.status === OAuthStatus.Unauthorized && (
            <Typography.Text
              className="coz-fg-secondary text-[12px] lending-[16px]"
              size="small"
              ellipsis={{ showTooltip: true }}
            >
              {I18n.t('permission_manage_modal_reauth_hint')}
            </Typography.Text>
          )}
        </div>
      </div>
    ),
  },
  {
    title: I18n.t('permission_manage_modal_table_action'),
    align: 'left',
    width: 80,
    render: (_, record) => {
      if (record.status === OAuthStatus.Authorized) {
        if (needPopconfirm) {
          return (
            <Popconfirm
              trigger="click"
              okButtonColor="red"
              title={I18n.t(
                'permission_manage_modal_cancel_auth_confirm_modal',
              )}
              content={I18n.t('permission_manage_modal_reauth_hint')}
              onConfirm={() => onCancel(record)}
              okText={I18n.t('confirm')}
              className="w-[240px]"
              position="bottomRight"
            >
              <Button size="small" color="primary">
                {I18n.t('cancel')}
              </Button>
            </Popconfirm>
          );
        } else {
          return (
            <Button
              onClick={() => onCancel(record)}
              size="small"
              color="primary"
            >
              {I18n.t('cancel')}
            </Button>
          );
        }
      }
    },
  },
];

interface PluginPermissionManageProps {
  botId: string;
  scrollY?: string;
  confirmType: 'popconfirm' | 'modal';
}

export const PluginPermissionManageList: FC<PluginPermissionManageProps> = ({
  botId,
  scrollY,
  confirmType,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const size = useSize(listRef);
  const { loading, data, runRevoke } = usePluginPermissionManage({ botId });

  const columns = getColumns({
    onCancel: record => {
      if (confirmType === 'modal') {
        Modal.error({
          title: I18n.t('permission_manage_modal_cancel_auth_confirm_modal'),
          content: I18n.t('permission_manage_modal_reauth_hint'),
          cancelButtonProps: { theme: 'borderless' },
          okButtonProps: { theme: 'solid' },
          cancelText: I18n.t('Cancel'),
          okText: I18n.t('Confirm'),
          style: {
            width: 320,
          },
          onOk: () => runRevoke(record.plugin_id),
        });
      } else {
        return runRevoke(record.plugin_id);
      }
    },
    needPopconfirm: confirmType === 'popconfirm',
  });
  const y = size?.height ? size?.height - 38 : 0;
  return (
    <div className="flex-1 min-h-0 mt-[16px]" ref={listRef}>
      <Table
        useHoverStyle={false}
        wrapperClassName="flex-1 min-h-0"
        tableProps={{
          className: s.plugin_permission_list_table,
          dataSource: data,
          columns,
          loading,
          scroll: {
            y: scrollY ? scrollY : y,
          },
          rowKey: 'plugin_id',
        }}
        empty={<Empty />}
      />
    </div>
  );
};

export const PermissionManageTitle = () => (
  <Space spacing={4}>
    <span>{I18n.t('permission_manage_modal_title')}</span>
    <Tooltip content={I18n.t('permission_manage_modal_title_hover_tip')}>
      <div
        className={
          'flex items-center justify-center hover:coz-mg-secondary-hovered cursor-pointer w-[32px] h-[32px] rounded-[8px] text-[16px]'
        }
      >
        <IconCozInfoCircle className="coz-fg-secondary" />
      </div>
    </Tooltip>
  </Space>
);

const Empty = () => (
  <div className="flex-1 flex justify-center h-full">
    <div className="flex flex-col gap-[16px] justify-center items-center h-[80%]">
      <IllustrationConstruction className="h-[140px] w-[140px]" />
      <span className="coz-fg-plus text-[16px] font-medium leading-[22px]">
        {I18n.t('permission_manage_modal_empty_list')}
      </span>
    </div>
  </div>
);
