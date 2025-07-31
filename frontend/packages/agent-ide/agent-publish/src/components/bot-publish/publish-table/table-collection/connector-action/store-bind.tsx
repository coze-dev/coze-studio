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
import { useParams } from 'react-router-dom';
import { useEffect, type SetStateAction, useState } from 'react';

import { isEmpty, map } from 'lodash-es';
import { useRequest } from 'ahooks';
import { type PublisherBotInfo } from '@coze-agent-ide/space-bot';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import {
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
  UIIconButton,
} from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { type PublishConnectorInfo } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi, ProductApi } from '@coze-arch/bot-api';

import { usePublishTableContext } from '../../context';

interface StoreBindProps {
  record: PublishConnectorInfo;
  canOpenSource: boolean;
  setDataSource: (value: SetStateAction<PublishConnectorInfo[]>) => void;
  botInfo: PublisherBotInfo;
  selectedPlatforms: string[];
  setHasCategoryList: (value: SetStateAction<boolean>) => void;
}

enum BotSubmitStatus {
  Private = 'false',
  Public = 'true',
}
const OpenSourceConfig = {
  [BotSubmitStatus.Private]: {
    title: () => I18n.t('mkpl_bots_private_configuration'),
    desc: () => I18n.t('mkpl_bots_private_configuration_description'),
  },
  [BotSubmitStatus.Public]: {
    title: () => I18n.t('mkpl_bots_public_configuration'),
    desc: () => I18n.t('mkpl_bots_public_configuration_description'),
  },
};
// eslint-disable-next-line complexity
export const StoreBind: React.FC<StoreBindProps> = ({
  record,
  canOpenSource,
  setDataSource,
  botInfo,
  selectedPlatforms,
  setHasCategoryList,
}) => {
  const params = useParams<DynamicParams>();
  const [sourceConfig, setSourceConfig] = useState<boolean>(false);

  useEffect(() => {
    if (!record.bind_info?.open_source) {
      handleSelect('open_source', BotSubmitStatus.Private);
    }
  }, [record.bind_info]);

  const getSpaceId = () => params.space_id || '';

  useRequest(
    async () => {
      const res = await ProductApi.PublicGetTemplateWhiteListConfig(
        {},
        { __disableErrorToast: true },
      );
      return res.data?.space_ids || [];
    },
    {
      onFinally: (_, data, e) => {
        // @ts-expect-error - skip
        if (!e && data.includes(getSpaceId())) {
          setSourceConfig(true);
        } else {
          setSourceConfig(false);
          // Fallback logic: if there is an error, or it is not in the whitelist, it is automatically changed to "private configuration" publishing
          handleSelect('open_source', BotSubmitStatus.Private);
        }
      },
    },
  );

  const { data: categoryList } = useRequest(
    async () => {
      const res = await ProductApi.PublicGetProductCategoryList(
        {
          // Representative meaning: no goods also return the type, that is, the type of the full amount
          need_empty_category: true,
          entity_type: ProductEntityType.Bot,
        },
        { __disableErrorToast: true },
      );
      return res.data?.categories || [];
    },
    {
      onSuccess: data => {
        setHasCategoryList?.(Boolean(data.length));
      },
      onError: () => {
        setHasCategoryList?.(false);
      },
      refreshDeps: [record.id],
    },
  );
  const { loading: autoCategoryLoading } = useRequest(
    async () => {
      const { description, name, prompt } = botInfo;

      const res = await PlaygroundApi.GenerateStoreCategory(
        {
          prompt,
          bot_name: name,
          bot_description: description,
        },
        { __disableErrorToast: true },
      );
      return res.data?.category_id;
    },
    {
      ready:
        selectedPlatforms.includes(record.id) &&
        !record.bind_info?.category_id &&
        !isEmpty(botInfo.name),
      onSuccess: data => {
        handleSelect('category_id', data);
      },
    },
  );

  const handleSelect = (key: 'open_source' | 'category_id', value) => {
    setDataSource((list: PublishConnectorInfo[]) => {
      const target = list.find(l => l.id === record?.id);
      if (target) {
        target.bind_info = {
          ...target.bind_info,
          [key]: value,
        };
      }
      return [...list];
    });
  };

  const isCategoryError =
    selectedPlatforms?.includes(record.id) &&
    !record.bind_info?.category_id &&
    !autoCategoryLoading;

  const selectedStore = selectedPlatforms?.includes(record.id);

  const renderLabel = (title, desc, key) => (
    <span className="flex justify-between w-full">
      {!canOpenSource && key === BotSubmitStatus.Public ? (
        <Tooltip
          content={I18n.t('publisher_market_public_disabled')}
          position="bottom"
        >
          {title}
        </Tooltip>
      ) : (
        title
      )}
      <Tooltip content={desc}>
        <UIIconButton icon={<IconInfo className="text-[#1D1C2399]" />} />
      </Tooltip>
    </span>
  );
  const { publishLoading } = usePublishTableContext();

  const selectSourceConfig = () => {
    if (!sourceConfig) {
      return null;
    }
    return (
      <Select
        className="w-[180px] mr-2"
        defaultValue={BotSubmitStatus.Private}
        disabled={!selectedStore || publishLoading}
        optionList={map(OpenSourceConfig, ({ title, desc }, key) => ({
          label: (
            <Space className="w-full">
              {renderLabel(title(), desc(), key)}
            </Space>
          ),
          value: key,
          title: title(),
          disabled: !canOpenSource && key === BotSubmitStatus.Public,
        }))}
        value={record.bind_info?.open_source}
        onSelect={value => handleSelect('open_source', value)}
        insetLabel={I18n.t('mkpl_bots_visibility')}
        renderSelectedItem={option => (
          <Typography.Text
            disabled={!selectedStore}
            ellipsis={{
              showTooltip: {
                opts: {
                  content: option.title,
                  style: { wordBreak: 'break-word' },
                },
              },
            }}
          >
            {option.title}
          </Typography.Text>
        )}
      ></Select>
    );
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      {selectSourceConfig()}
      <Select
        style={{ width: 180 }}
        disabled={!selectedStore || !categoryList?.length || publishLoading}
        optionList={categoryList?.map(item => ({
          label: item.name,
          value: item.id,
        }))}
        value={
          categoryList?.length
            ? record.bind_info?.category_id || undefined
            : undefined
        }
        onSelect={value => handleSelect('category_id', value)}
        insetLabel={I18n.t('mkpl_bots_category')}
        placeholder={
          !autoCategoryLoading ? (
            categoryList?.length ? (
              I18n.t('select_category')
            ) : (
              I18n.t('select_later')
            )
          ) : (
            <Spin spinning style={{ verticalAlign: 'middle' }}>
              {I18n.t('select_category')}
            </Spin>
          )
        }
        validateStatus={isCategoryError ? 'error' : 'default'}
        renderSelectedItem={option => (
          <Typography.Text
            disabled={!selectedStore || !categoryList?.length}
            ellipsis={{
              showTooltip: {
                opts: {
                  content: option.label,
                  style: { wordBreak: 'break-word' },
                },
              },
            }}
          >
            {option.label}
          </Typography.Text>
        )}
      ></Select>
    </div>
  );
};
