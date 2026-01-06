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

import React, { type FC, Fragment, useRef, type MutableRefObject } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozDiamondFill } from '@coze-arch/coze-design/icons';
import { Tag } from '@coze-arch/coze-design';
import { formatNumber, getParamsFromQuery } from '@coze-arch/bot-utils';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Space, Avatar, Typography, Skeleton } from '@coze-arch/bot-semi';
import { IconArrowDownFill } from '@coze-arch/bot-icons';
import { useExposure } from '@coze-arch/bot-hooks';
import {
  BusinessType,
  ProductEntityType,
  ProductPaidType,
  type ProductInfo,
} from '@coze-arch/bot-api/product_api';

import { getProductShowFrontCommonParams } from '@/utils/tea/product';
import { StoreAvatarName } from '@/avatar-name';

import { useSearchInputStore } from '../../search-input-store';
import { useItemSelect } from '../../hooks/use-item-select';
import { entityUrlMap, entityShowStaticsMap, getEntityUrl } from '../../config';

import styles from './index.module.less';

interface RecommendItemProps {
  isSelected?: boolean;
  item?: ProductInfo;
  ableKeyPressJump?: boolean;
  onSearch?: (word: string) => void;
  onMouseHover?: () => void;
  entityType?: ProductEntityType;
  containerRef?: MutableRefObject<HTMLElement>;
  index?: number;
}

const EntityTypeTag: FC<{ type: ProductEntityType }> = ({ type }) => {
  const map = {
    [ProductEntityType.Bot]: (
      <Tag size="mini" color="primary">
        {I18n.t('community_Tagtag_bot')}
      </Tag>
    ),
    [ProductEntityType.Project]: (
      <Tag size="mini" color="brand">
        {I18n.t('project_store_search')}
      </Tag>
    ),
  };

  return map[type];
};

const StatisticsModule = ({
  productInfo,
  entityType,
}: {
  productInfo?: ProductInfo;
  entityType?: ProductEntityType;
}) => (
  <>
    {entityType && productInfo
      ? entityShowStaticsMap[entityType]?.map((item, index) => (
          <Fragment key={index}>
            {index > 0 ? <div className={styles.dot} /> : null}
            <Typography.Text className={styles['statie-elc']}>
              {formatNumber(item.getValue(productInfo))}
              {item.label(productInfo)}
            </Typography.Text>
          </Fragment>
        ))
      : null}
  </>
);

// eslint-disable-next-line @coze-arch/max-line-per-function, complexity
export const RecommendItem = (props: RecommendItemProps) => {
  const {
    isSelected = false,
    item,
    ableKeyPressJump,
    onMouseHover,
    entityType,
    containerRef,
    index,
  } = props;

  const { inputValue } = useSearchInputStore();

  const itemRef = useRef<HTMLDivElement>();

  const onOpenDetail = () => {
    if (!entityType) {
      return;
    }
    const entityUrl = getEntityUrl(
      item?.meta_info.entity_type ?? entityType,
      item?.meta_info?.id,
      'store_search_suggestion',
    );

    window.open(entityUrl, '_blank');
  };
  useItemSelect({
    ...{ isSelected, ableKeyPressJump },
    onSelectedClick: () => {
      sendTeaEvent(EVENT_NAMES.store_search_front, {
        // @ts-expect-error -- linter-disable-autofix
        result_type: entityUrlMap[entityType] || '',
        entity_id: item?.meta_info?.id || '',
        entity_name: item?.meta_info?.name || '',
        search_word: inputValue,
        action: 'click_results',
      });

      window.open(
        // @ts-expect-error -- linter-disable-autofix
        getEntityUrl(entityType, item?.meta_info?.id),
        '_blank',
      );
    },
    // @ts-expect-error -- linter-disable-autofix
    itemRef,
    // @ts-expect-error -- linter-disable-autofix
    containerRef,
  });

  useExposure({
    target: itemRef,
    options: { threshold: 0.5 },
    eventName: EVENT_NAMES.product_show_front,
    reportParams: {
      ...(item?.meta_info
        ? getProductShowFrontCommonParams(item?.meta_info)
        : {
            bot_id: '',
            product_name: '',
            product_id: '',
          }),
      c_position: index,
      filter_tag: 'all',
      source: 'store_search_suggestion',
      from: getParamsFromQuery({ key: 'from' }) ?? 'store_search_suggestion',
    },
    isReportOnce: true,
  });

  return (
    <div
      className={cls(styles.normalItemContaienr, {
        [styles.isSelected]: isSelected,
      })}
      style={{
        gap: 12,
      }}
      onMouseDown={() => {
        onOpenDetail();
        sendTeaEvent(EVENT_NAMES.store_search_front, {
          // @ts-expect-error -- linter-disable-autofix
          result_type: entityUrlMap[entityType] || '',
          entity_id: item?.meta_info?.id || '',
          entity_name: item?.meta_info?.name || '',
          search_word: inputValue,
          action: 'click_results',
        });
      }}
      onMouseEnter={() => onMouseHover?.()}
      // @ts-expect-error -- linter-disable-autofix
      ref={itemRef}
    >
      <Avatar
        shape="square"
        src={item?.meta_info?.icon_url}
        style={{ width: 32, height: 32 }}
        className={styles.avatar}
      />
      <Space
        vertical
        spacing={2}
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <div className="flex items-center w-full gap-[6px]">
          {item?.meta_info.entity_type !== undefined ? (
            <EntityTypeTag type={item?.meta_info.entity_type} />
          ) : null}
          <Typography.Text
            className={cls(styles.title, 'ml-[4px]')}
            ellipsis={{ rows: 1, showTooltip: false }}
          >
            {item?.meta_info?.name}
          </Typography.Text>
          <StoreAvatarName metaInfo={item?.meta_info} />
          {item?.commercial_setting?.commercial_type ===
          ProductPaidType.Paid ? (
            <Tag
              size="mini"
              color="brand"
              prefixIcon={<IconCozDiamondFill />}
              className="font-medium"
            >
              {I18n.t(
                item?.commercial_setting?.business_type ===
                  BusinessType.SelfOperated
                  ? 'official_payment'
                  : 'third_party_payment',
              )}
            </Tag>
          ) : null}
        </div>
        <Space spacing={6} style={{ width: '100%' }}>
          <StatisticsModule
            entityType={item?.meta_info.entity_type ?? entityType}
            productInfo={item}
          />
          {item?.meta_info?.description ? (
            <>
              <div className={styles.dot} />
              <Typography.Text
                className={styles.description}
                ellipsis={{ rows: 1, showTooltip: false }}
              >
                {item?.meta_info?.description}
              </Typography.Text>
            </>
          ) : null}
        </Space>
      </Space>
    </div>
  );
};

export const RecommendSkeleton = () => (
  <Space spacing={12} className={styles.skeletonContiner}>
    <Skeleton.Image className={styles.image} />
    <Space className={styles.textContainer} spacing={8} vertical>
      <Skeleton.Title className={styles.title} />
      <Skeleton.Title className={styles.description} />
    </Space>
  </Space>
);

export const RecommendItemMore = (props: {
  isSelected?: boolean;
  ableKeyPressJump?: boolean;
  requestList?: () => void;
  onMouseHover?: () => void;
  containerRef?: MutableRefObject<HTMLElement>;
}) => {
  const {
    isSelected = false,
    ableKeyPressJump,
    requestList,
    onMouseHover,
    containerRef,
  } = props;
  const itemRef = useRef<HTMLDivElement>();
  useItemSelect({
    ...{ isSelected, ableKeyPressJump },
    onSelectedClick: () => {
      requestList?.();
    },
    // @ts-expect-error -- linter-disable-autofix
    itemRef,
    // @ts-expect-error -- linter-disable-autofix
    containerRef,
  });
  return (
    <div
      onMouseDown={() => {
        requestList?.();
      }}
      className={cls(styles.seeMore, {
        [styles.isSelected]: isSelected,
      })}
      // @ts-expect-error -- linter-disable-autofix
      ref={itemRef}
      onMouseEnter={() => onMouseHover?.()}
    >
      {I18n.t('store_search_see_more')} <IconArrowDownFill />
    </div>
  );
};
