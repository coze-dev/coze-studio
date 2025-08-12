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

/* eslint-disable @coze-arch/max-line-per-function */
import { type MutableRefObject, useEffect, useMemo } from 'react';

import dayjs from 'dayjs';
import { useMemoizedFn, useSize } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEdit,
  IconCozMore,
  IconCozPlus,
} from '@coze-arch/coze-design/icons';
import {
  Dropdown,
  IconButton,
  Spin,
  Space,
  Empty,
  type ColumnProps,
  Table,
  Tooltip,
} from '@coze-arch/coze-design';
import { type ConnectorMetaInfo } from '@coze-arch/bot-api/connector_api';
import { NavLink } from 'react-router-dom';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';

import { useCustomPlatformController } from '@/hook/publish-platform-setting/use-custom-platform-controller';

import { EStatus, TagWithStatus } from './tag-with-status';
import { OauthSettingModal } from './oauth-setting-modal';
import { NameWithIcon } from './name-with-icon';
import { IdWithCopy } from './id-with-cp';
import { CustomPlatformSettingModal } from './custom-platform-setting-modal';

const GAP = 150;

const CustomPlatform = ({
  contentRef,
}: {
  contentRef: MutableRefObject<HTMLDivElement>;
}) => {
  const {
    dataSource,
    actionTarget,
    loading,
    doSetActionTarget,
    doCopy,
    doRefreshDatasource,
  } = useCustomPlatformController();

  const size = useSize(contentRef);

  const scroll = useMemo(
    () => ({ y: (size?.height ?? 0) - GAP }),
    [size?.height],
  );

  const onCancel = useMemoizedFn(() => {
    doSetActionTarget(undefined);
  });

  const doSetUpdatePayload = (record: ConnectorMetaInfo) => {
    doSetActionTarget({
      target: 'platform',
      action: 'update',
      payload: {
        id: record?.id,
        connector_title: record?.name,
        connector_desc: record?.desc,
        oauth_app_id: record?.oauth_app_id,
        avatar: [
          {
            uid: record?.icon_uri ?? '',
            url: record?.icon_url ?? '',
          },
        ],
        callback_url: record?.callback_url,
        space_id_list: record?.space_id_list,
      },
    });
  };

  const doSetUpdateConfig = (record: ConnectorMetaInfo) => {
    let config;

    try {
      config = JSON.parse(record?.oauth_config);
    } catch (error) {
      console.error(error);

      config = undefined;
    }

    doSetActionTarget({
      target: 'oauth',
      action: 'update',
      payload: {
        id: record?.id,
        config,
      },
    });
  };

  const doSetTokenPayload = (record: ConnectorMetaInfo) => {
    if (record.callback_token) {
      doSetActionTarget({
        target: 'platform',
        action: 'view',
        payload: {
          token: record.callback_token,
        },
      });
    }
  };

  const onOk = useMemoizedFn((token?: string) => {
    doRefreshDatasource();

    if (token) {
      doSetActionTarget({
        target: 'platform',
        action: 'view',
        payload: {
          token,
        },
      });
    } else {
      doSetActionTarget(undefined);
    }
  });

  const columns: ColumnProps<ConnectorMetaInfo>[] = [
    {
      title: I18n.t('coze_custom_publish_platform_6'),
      dataIndex: 'name',
      width: 160,
      render: (name, record) => (
        <NameWithIcon name={name} icon={record.icon_url} />
      ),
    },
    {
      title: I18n.t('coze_custom_publish_platform_7'),
      dataIndex: 'id',
      width: 120,
      render: idString => <IdWithCopy id={idString} doCopy={doCopy} />,
    },
    {
      title: I18n.t('coze_custom_publish_platform_8'),
      dataIndex: 'public_type',
      width: 100,
      render: publicType => (
        <TagWithStatus prefix="publicType" status={publicType} />
      ),
    },
    {
      title: I18n.t('coze_custom_publish_platform_9'),
      dataIndex: 'oauth_config',
      width: 126,
      render: (oauth, record) => (
        <Space spacing={4}>
          <TagWithStatus
            status={oauth ? EStatus.CONF : EStatus.NOT_CONF}
            prefix={'config'}
          />
          <Tooltip content={I18n.t('coze_custom_publish_platform_41')}>
            <IconButton
              color="secondary"
              icon={<IconCozEdit className="text-base" />}
              size="mini"
              onClick={() => doSetUpdateConfig(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: I18n.t('coze_custom_publish_platform_10'),
      dataIndex: 'create_time',
      width: 126,
      render: createTime =>
        `${dayjs(Number(createTime) * 1000).format('YYYY-MM-DD HH:mm')}`,
    },
    {
      title: I18n.t('coze_custom_publish_platform_11'),
      align: 'right',
      width: 70,
      render: (_, record) => (
        <Dropdown
          position="bottomRight"
          render={
            <div className="px-[4px] py-[3px]">
              <Dropdown.Item
                disabled={!record.callback_token}
                className="w-[112px] h-[32px] rounded-[4px] justify-start"
                onClick={() => doSetTokenPayload(record)}
              >
                Token
              </Dropdown.Item>
              <Dropdown.Item
                className="w-[112px] h-[32px] rounded-[4px] justify-start"
                onClick={() => doSetUpdatePayload(record)}
              >
                {I18n.t('coze_custom_publish_platform_37')}
              </Dropdown.Item>
              <Dropdown.Item
                className="w-[112px] h-[32px] rounded-[4px] justify-start"
                onClick={() =>
                  doSetActionTarget({
                    target: 'platform',
                    action: 'delete',
                    payload: {
                      id: record.id,
                    },
                  })
                }
              >
                {I18n.t('coze_custom_publish_platform_38')}
              </Dropdown.Item>
            </div>
          }
        >
          <IconButton
            color="secondary"
            icon={<IconCozMore className="text-base" />}
            size="mini"
          />
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    doRefreshDatasource();
  }, []);

  return (
    <>
      {actionTarget?.target === 'platform' && (
        <CustomPlatformSettingModal
          actionTarget={actionTarget}
          onOk={onOk}
          onCancel={onCancel}
        />
      )}
      {actionTarget?.target === 'oauth' && (
        <OauthSettingModal
          actionTarget={actionTarget}
          onOk={onOk}
          onCancel={onCancel}
        />
      )}
      <div className="relative">
        <IconButton
          onClick={() =>
            doSetActionTarget({
              target: 'platform',
              action: 'create',
            })
          }
          className="absolute right-[0] -top-[48px]"
          color="highlight"
          icon={<IconCozPlus />}
          iconPosition="left"
          size="default"
        >
          {I18n.t('coze_custom_publish_platform_3')}
        </IconButton>
        <p className="text-[14px] leading-[20px] text-[var(--coz-fg-primary)] mb-[24px]">
          {I18n.t('coze_custom_publish_platform_4')}{' '}
          <NavLink
            className="text-[var(--coz-fg-hglt)] hover:underline cursor-pointer"
            to={CUSTOM_PLAT_APPLY_PUBLIC_PLAT_FORM_LINK}
            target="_blank"
          >
            {I18n.t('coze_custom_publish_platform_5')}
          </NavLink>
        </p>
        <Spin spinning={loading}>
          <Table
            tableProps={{
              rowKey: 'id',
              dataSource,
              columns,
              scroll,
            }}
            empty={
              <Empty
                className="pt-[60px]"
                image={
                  <IllustrationNoContent style={{ width: 150, height: 150 }} />
                }
                darkModeImage={
                  <IllustrationNoContentDark
                    style={{ width: 150, height: 150 }}
                  />
                }
                description={I18n.t('api_analytics_null')}
              />
            }
          />
        </Spin>
      </div>
    </>
  );
};

export { CustomPlatform };
