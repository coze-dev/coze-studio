import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Radio } from '@coze-arch/coze-design';
import { UISelect, Select } from '@coze-arch/bot-semi';
import { SortType } from '@coze-arch/bot-api/product_api';
import { OrderBy } from '@coze-arch/bot-api/developer_api';
import {
  MineActiveEnum,
  PluginFilterType,
} from '@coze-agent-ide/plugin-shared';
import { type From, type PluginQuery } from '@coze-agent-ide/plugin-shared';

import s from './index.module.less';

export interface PluginModalFilterProp {
  query: PluginQuery;
  setQuery: (value: Partial<PluginQuery>, refreshPage?: boolean) => void;
  from?: From;
}

const scopeOptions = [
  {
    label: I18n.t('All'),
    value: MineActiveEnum.All,
  },
  {
    label: I18n.t('Me'),
    value: MineActiveEnum.Mine,
  },
];

const timeOptions = [
  {
    label: I18n.t('Create_time'),
    value: OrderBy.CreateTime,
  },
  {
    label: I18n.t('Update_time'),
    value: OrderBy.UpdateTime,
  },
];
const hotOptions = [
  {
    label: I18n.t('Popular'),
    value: SortType.Heat,
  },
  {
    label: I18n.t('Recent'),
    value: SortType.Newest,
  },
];

export const PluginModalFilter: FC<PluginModalFilterProp> = ({
  query,
  setQuery,
}) => {
  /**
   * 空间插件：创建、编辑时间排序
   * 公共插件：热度、发布时间排序
   * */
  const getFilterItem = () => {
    if (
      query.type === PluginFilterType.Mine ||
      query.type === PluginFilterType.Team ||
      query.type === PluginFilterType.Project
    ) {
      return (
        <UISelect
          label={I18n.t('Sort')}
          value={query.orderBy}
          optionList={timeOptions}
          onChange={v => {
            setQuery({
              orderBy: v as OrderBy,
            });
          }}
        >
          <Select.Option value={OrderBy.CreateTime}>
            {I18n.t('Create_time')}
          </Select.Option>
          <Select.Option value={OrderBy.UpdateTime}>
            {I18n.t('Edit_time_2')}
          </Select.Option>
        </UISelect>
      );
    }
    if (query.type === PluginFilterType.Favorite) {
      return (
        <UISelect
          label={I18n.t('Sort')}
          value={query.orderByFavorite}
          optionList={hotOptions}
          onChange={v => {
            setQuery({
              orderByFavorite: v as SortType,
            });
          }}
        />
      );
    }
    return (
      <div className="flex items-center gap-2">
        <UISelect
          label={I18n.t('Sort')}
          value={query.orderByPublic}
          optionList={hotOptions}
          onChange={v => {
            setQuery({
              orderByPublic: v as SortType,
            });
          }}
        />
        <Radio
          mode="advanced"
          className="flex items-center mt-[-2px]"
          checked={query.isOfficial}
          onChange={e => {
            setQuery({
              isOfficial: e.target.checked ? e.target.checked : undefined,
            });
          }}
        >
          <div className="coz-fg-primary font-[600] mt-[2px]">
            {I18n.t('store_search_official_plugin_only')}
          </div>
        </Radio>
      </div>
    );
  };
  return (
    <div className={s['plugin-modal-filter']}>
      {/* 前端过滤自己的plugin */}
      {query.type === PluginFilterType.Team && (
        <UISelect
          label="Creator"
          value={query.mineActive}
          optionList={scopeOptions}
          onChange={v => {
            setQuery({
              mineActive: v as MineActiveEnum,
            });
          }}
        />
      )}
      {getFilterItem()}
    </div>
  );
};
