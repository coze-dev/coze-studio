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

import { type ReactNode, useMemo, useState } from 'react';

import { partition } from 'lodash-es';
import classNames from 'classnames';
import { PublishPlatformDescription } from '@coze-agent-ide/space-bot/component';
import {
  type PublisherBotInfo,
  type MouseInValue,
  type PublishTableProps,
} from '@coze-agent-ide/space-bot';
import { MonetizePublishInfo } from '@coze-studio/components/monetize';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowRight,
  IconCozDiamondFill,
} from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { Avatar, Space, Typography, UITable } from '@coze-arch/bot-semi';
import {
  AllowPublishStatus,
  BindType,
  BotConnectorStatus,
  ConfigStatus,
  type ConnectorBrandInfo,
  type PublishConnectorInfo,
} from '@coze-arch/bot-api/developer_api';
import { type BotMonetizationConfigData } from '@coze-arch/bot-api/benefit';
import {
  useBenefitAvailable,
  PremiumPaywallScene,
  usePremiumPaywallModal,
} from '@coze-studio/premium-components-adapter';

import styles from '../index.module.less';
import { usePublishTableContext } from '../context';
import { PluginPricingInfo } from './plugin-limit-tooltip';
import { ConfigStatusColumn } from './config-status';

const convertFlatListToTreeList = (
  list: PublishConnectorInfo[],
  brandMap: Record<string, ConnectorBrandInfo> = {},
) => {
  const result = {};
  const finalResult = [];
  list.forEach(item => {
    const brandId = item?.brand_id;
    if (brandId) {
      if (!result[brandId]) {
        result[brandId] = {
          ...(brandMap[brandId] || {}),
          children: [],
        };
        // @ts-expect-error -- skip
        finalResult.push(result[brandId]);
      }
      result[brandId].children.push(item);
    } else {
      // @ts-expect-error -- skip
      finalResult.push(item);
    }
  });
  return finalResult;
};

const getCheckBoxDisabledTips = (record: PublishConnectorInfo) => {
  const configStatusArray = [
    ConfigStatus.NotConfigured,
    ConfigStatus.Configuring,
  ];
  if (
    record.allow_punish === AllowPublishStatus.Forbid &&
    record.not_allow_reason
  ) {
    return record.not_allow_reason;
  }
  if (configStatusArray.some(status => record.config_status === status)) {
    return I18n.t('bot_publish_disable_check_tip');
  }
  if (record.connector_status === BotConnectorStatus.InReview) {
    return I18n.t('bot_publish_in_review_disable_check_tip');
  }
  if (record.config_status === ConfigStatus.NeedReconfiguring) {
    return I18n.t('publish_base_config_needReconfigure');
  }
};

const getCheckboxProps = (record: PublishConnectorInfo, disabled: boolean) => {
  const disableTip = getCheckBoxDisabledTips(record);
  return {
    disabled: !!disableTip || disabled,
    id: record.id,
    // Offline status No tooltip
    children: disableTip ? (
      <Tooltip content={disableTip}>
        <span className={styles['disable-tooltip']} />
      </Tooltip>
    ) : null,
  };
};

const doIfDisabled = (source: PublishConnectorInfo[], disabled: boolean) =>
  source?.every(
    item =>
      item.config_status !== ConfigStatus.Configured ||
      item.allow_punish !== AllowPublishStatus.Allowed ||
      item.connector_status === BotConnectorStatus.InReview,
  ) || disabled;

export const TableCollection = (props: PublishTableProps) => {
  const {
    dataSource,
    connectorBrandInfoMap = {},
    selectedPlatforms,
    setSelectedPlatforms,
  } = props;
  const [mouseInfo, setMouseInfo] = useState<MouseInValue>({});
  const onMouseEnter = (record: PublishConnectorInfo) => {
    setMouseInfo({ [record.id]: true });
  };
  const onMouseLeave = (record: PublishConnectorInfo) => {
    setMouseInfo({ [record.id]: false });
  };
  const [dataSourceForOpen, dataSourceForChannel] = partition(
    dataSource ?? [],
    d =>
      d?.bind_type === BindType.ApiBind || d?.bind_type === BindType.WebSDKBind,
  );

  const { publishLoading } = usePublishTableContext();

  const dataTreeForOpen = useMemo(
    () => convertFlatListToTreeList(dataSourceForOpen, connectorBrandInfoMap),
    [dataSourceForOpen, connectorBrandInfoMap],
  );
  const dataTreeForChannel = useMemo(
    () =>
      convertFlatListToTreeList(dataSourceForChannel, connectorBrandInfoMap),
    [dataSourceForChannel, connectorBrandInfoMap],
  );

  // There is no select all button, so all tables use the same check configuration
  const baseConfigForChecker = {
    hidden: true,
    fixed: 'left' as const,
    selectedRowKeys: selectedPlatforms,
    onChange: (selectedRowKeys: (string | number)[] | undefined) => {
      setSelectedPlatforms(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record: PublishConnectorInfo) =>
      getCheckboxProps(record, publishLoading),
  };

  const getColumns = (
    type: 'connector' | 'api',
  ): ColumnProps<PublishConnectorInfo>[] => [
    {
      title: <TableTitle type={type} />,
      width: 220,
      useFullRender: true,
      render: (...params) => {
        // @ts-expect-error -- skip
        const [record, , , { expandIcon, selection }] = params;
        return (
          <PlatformInfoColumn
            platform={record}
            rowIcon={record.children ? expandIcon : selection}
          />
        );
      },
    },
    {
      title: (
        <TableTittleExtra
          botInfo={props.botInfo}
          type={type}
          monetizeConfig={props.monetizeConfig}
          platforms={dataSource}
        />
      ),
      render: (
        record: PublishConnectorInfo & { children?: PublishConnectorInfo[] },
      ) =>
        record.children ? null : (
          <ConfigStatusColumn
            isMouseIn={Boolean(mouseInfo[record.id])}
            record={record}
            {...props}
          />
        ),
    },
  ];
  const handleOnRow = (record: PublishConnectorInfo) => ({
    onClick: () => {
      if (!doIfDisabled([record], publishLoading)) {
        setSelectedPlatforms(ids =>
          ids?.includes(record.id)
            ? ids.filter(i => i !== record.id)
            : [record.id, ...ids],
        );
      }
    }, // Click on the line to select
    onMouseEnter: () => onMouseEnter(record), // mouseover
    onMouseLeave: () => onMouseLeave(record), // mouse movement
  });
  const tableCommonProps = {
    className: classNames(styles['publish-table']),
    rowKey: 'id',
    onRow: handleOnRow,
    defaultExpandAllRows: true,
    expandIcon: <IconCozArrowRight style={{ fontSize: 16 }} />,
    keepDOM: true,
    expandRowByClick: true,
  };
  return (
    <>
      {!!dataSourceForChannel.length && (
        <UITable
          tableProps={{
            columns: getColumns('connector'),
            dataSource: dataTreeForChannel,
            rowSelection: baseConfigForChecker,
            ...tableCommonProps,
          }}
          wrapperClassName={classNames(styles['publish-table-wrapper'])}
        />
      )}
      {!!dataSourceForOpen.length && (
        <UITable
          tableProps={{
            columns: getColumns('api'),
            dataSource: dataTreeForOpen,
            rowSelection: baseConfigForChecker,
            ...tableCommonProps,
          }}
          wrapperClassName={styles['publish-table-wrapper']}
        />
      )}
    </>
  );
};

function TableTitle({ type }: { type: 'connector' | 'api' }) {
  const apiTitle = IS_OVERSEA
    ? I18n.t('api_sdk_published', {
        coze_token: (
          <Typography.Text
            link
            size="small"
            onClick={() => window.open('/docs/guides/token')}
          >
            {I18n.t('Coze_token_title')}
          </Typography.Text>
        ),
      })
    : I18n.t('api');
  return (
    <div className="pl-3">
      {type === 'connector' ? I18n.t('bot_publish_columns_platform') : apiTitle}
    </div>
  );
}

function TableTittleExtra({
  monetizeConfig,
  platforms,
  type,
  botInfo,
}: {
  type: 'connector' | 'api';
  monetizeConfig?: BotMonetizationConfigData;
  platforms: PublishConnectorInfo[];
  botInfo: PublisherBotInfo;
}) {
  // paywall
  const isAvailable = useBenefitAvailable({
    scene: PremiumPaywallScene.API,
  });
  const { node: premiumPaywallModal, open: openPremiumPaywallModal } =
    usePremiumPaywallModal({ scene: PremiumPaywallScene.API });

  if (type === 'api' && !isAvailable) {
    return (
      <>
        <Space className="text-[12px] w-full justify-end pr-[28px]" spacing={2}>
          <IconCozDiamondFill className="coz-fg-hglt" />
          累计100条，
          <div
            className="coz-fg-hglt cursor-pointer"
            onClick={openPremiumPaywallModal}
          >
            升级套餐
          </div>
          豁免额度限制
        </Space>
        {premiumPaywallModal}
      </>
    );
  }

  if (IS_OVERSEA && type === 'api') {
    return (
      <PluginPricingInfo pluginPricingRules={botInfo.pluginPricingRules} />
    );
  }

  if (!IS_OVERSEA || !monetizeConfig || type !== 'connector') {
    return null;
  }

  return (
    <MonetizePublishInfo
      className="pr-[24px]"
      monetizeConfig={monetizeConfig}
      supportPlatforms={platforms.filter(p => p.support_monetization)}
    />
  );
}

function PlatformInfoColumn({
  platform,
  rowIcon,
}: {
  platform: PublishConnectorInfo;
  rowIcon: ReactNode;
}) {
  return (
    <Space style={{ width: '100%' }}>
      <div
        className={classNames(
          styles['table-row-icon-wrapper'],
          'pr-1',
          platform.brand_id ? 'pl-1' : 'pl-3',
          { 'ml-10': !!platform.brand_id },
        )}
      >
        {rowIcon}
      </div>
      <Avatar
        size="small"
        shape="square"
        src={platform.icon}
        className={styles['platform-avater']}
      ></Avatar>
      <Typography.Text
        className={styles['platform-name']}
        ellipsis={{
          showTooltip: {
            opts: {
              content: platform?.name,
              style: { wordWrap: 'break-word' },
            },
          },
        }}
      >
        {platform?.name}
      </Typography.Text>

      {platform?.desc ? (
        <PublishPlatformDescription desc={platform.desc} />
      ) : null}
    </Space>
  );
}
