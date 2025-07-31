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

/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines -- to be split */
/* eslint-disable @coze-arch/max-line-per-function */
import {
  type FC,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  useMemo,
} from 'react';

import { isFunction, uniq, debounce } from 'lodash-es';
import cs from 'classnames';
import {
  useInfiniteScroll,
  useUpdateEffect,
  useDocumentVisibility,
} from 'ahooks';
import { FilterKnowledgeType } from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { BotE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  UIButton,
  UIEmpty,
  UISelect,
  Spin,
  UISearch,
  Divider,
} from '@coze-arch/bot-semi';
import {
  OrderField,
  type Dataset,
  DatasetScopeType,
  FormatType,
} from '@coze-arch/bot-api/knowledge';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Input } from '@coze-arch/coze-design';

import { DATA_REFACTOR_CLASS_NAME } from '../../constant';

import styles from './index.module.less';

interface GetDatasetListData {
  list: Dataset[];
  nextPageIndex: number;
  total: number;
}

const DEFAULT_PAGE_SIZE = 20;

const getDatasetList = async (
  props: {
    query?: string;
    search_type?: OrderField;
    space_id: string;
    scope_type?: DatasetScopeType;
    format_type?: FormatType;
    projectID?: string;
  },
  pageIndex = 1,
) => {
  const { query, search_type, space_id, scope_type, format_type, projectID } =
    props;
  const resp = await KnowledgeApi.ListDataset({
    space_id,
    page: pageIndex,
    size: DEFAULT_PAGE_SIZE,
    filter: {
      name: query,
      scope_type,
      format_type,
    },
    order_field: search_type,
    project_id: projectID,
  });

  return {
    list: resp?.dataset_list || [],
    nextPageIndex: pageIndex + 1,
    total: Number(resp?.total),
  };
};

const DEFAULT_SEARCH_TYPE = OrderField.CreateTime;

interface CreateKnowledgeModalProps {
  modal: ReactNode;
  open: () => void;
  close: () => void;
}

const EmptyToCreate: FC<{
  onAdd: () => void;
  scene: Scene;
  canCreate: boolean;
  createKnowledgeModal?: CreateKnowledgeModalProps;
}> = ({ onAdd, scene, canCreate, createKnowledgeModal }) => {
  const handleAdd = () => {
    if (scene === Scene.MODAL) {
      onAdd();
      return;
    }
    createKnowledgeModal?.open();
  };
  return (
    <>
      <div className={cs(styles.content, styles.centered)}>
        <UIEmpty
          className={styles.empty}
          empty={{
            ...(canCreate
              ? {
                  btnText: I18n.t('datasets_create_btn'),
                  btnOnClick: handleAdd,
                }
              : {}),
            title: I18n.t('datasets_empty_title'),
            description: I18n.t('datasets_empty_description'),
          }}
        />
      </div>
      {createKnowledgeModal?.modal}
    </>
  );
};

export interface DatasetFilterAction {
  list: Dataset[];
  size: number;
  query: string | undefined;
  searchType: OrderField;
  loading: boolean;
  noMore: boolean;
  resetFilter: () => void;
  refresh: () => void;
  createDataset?: (name: string, source_type: number) => Promise<void>;
  deleteDataset?: (id: string) => Promise<void>;
  updateDataset?: (id: string, name: string) => Promise<void>;
}

export type DatasetFilterType = 'scope-type' | 'search-type' | 'query-input';

export interface DatasetFilterProps {
  hideHeader?: boolean;
  children:
    | ((action: DatasetFilterAction) => React.ReactNode)
    | React.ReactNode;
  showFilters?: DatasetFilterType[];
  headerClassName?: string;
  scene?: Scene;
  onClickAddKnowledge?: (
    datasetId: string,
    type: UnitType,
    shouldUpload?: boolean,
  ) => void;
  beforeCreate?: (shouldUpload: boolean) => void;
  canCreate: boolean;
  defaultType?: FilterKnowledgeType;
  knowledgeTypeConfigList?: FilterKnowledgeType[];
  projectID?: string;
  createKnowledgeModal?: CreateKnowledgeModalProps;
}

export enum Scene {
  PAGE = 'page',
  MODAL = 'modal',
}

const defaultKnowledgeTypeFallback = (param: FilterKnowledgeType[]) => {
  if (param.includes(FilterKnowledgeType.ALL)) {
    return FilterKnowledgeType.ALL;
  }
  return param.at(0) ?? FilterKnowledgeType.ALL;
};

const useKnowledgeFilter = ({
  hideHeader,
  children,
  showFilters,
  headerClassName,
  scene = Scene.PAGE,
  onClickAddKnowledge,
  canCreate,
  defaultType,
  knowledgeTypeConfigList = [
    FilterKnowledgeType.ALL,
    FilterKnowledgeType.TEXT,
    FilterKnowledgeType.TABLE,
    FilterKnowledgeType.IMAGE,
  ],
  projectID,
  beforeCreate,
  createKnowledgeModal,
}: DatasetFilterProps) => {
  const uniqKnowledgeTypeConfigList = uniq(knowledgeTypeConfigList);
  const [currentKnowledgeType, setCurrentKnowledgeType] = useState(
    defaultType || defaultKnowledgeTypeFallback(uniqKnowledgeTypeConfigList),
  );
  const [query, setQuery] = useState<string>();
  const [searchType, setSearchType] = useState<OrderField>(DEFAULT_SEARCH_TYPE);
  const [scopeType, setScopeType] = useState<DatasetScopeType>(
    projectID ? DatasetScopeType.ScopeSelf : DatasetScopeType.ScopeAll,
  );

  const scopeOptions = [
    {
      label: I18n.t('scope_all'),
      value: DatasetScopeType.ScopeAll,
    },
    {
      label: I18n.t('scope_self'),
      value: DatasetScopeType.ScopeSelf,
    },
  ];
  const { id, space_type } = useSpaceStore(s => s.space);

  const isPersonal = space_type === SpaceType.Personal;

  const containerRef = useRef<HTMLDivElement>(null);
  const { loading, data, loadingMore, noMore, reload } =
    useInfiniteScroll<GetDatasetListData>(
      (newData?: GetDatasetListData): Promise<GetDatasetListData> => {
        if (!newData || newData.nextPageIndex === 1) {
          containerRef.current?.scroll(0, 0);
        }
        return getDatasetList(
          {
            space_id: id || '',
            query,
            search_type: searchType,
            scope_type: isPersonal ? DatasetScopeType.ScopeSelf : scopeType,
            format_type:
              currentKnowledgeType === FilterKnowledgeType.ALL
                ? undefined
                : {
                    [FilterKnowledgeType.TABLE]: FormatType.Table,
                    [FilterKnowledgeType.TEXT]: FormatType.Text,
                    [FilterKnowledgeType.IMAGE]: FormatType.Image,
                  }[currentKnowledgeType],
            projectID,
          },
          newData?.nextPageIndex,
        );
      },
      {
        manual: true,
        isNoMore: newData =>
          Boolean(
            !newData?.total ||
              (newData.nextPageIndex - 1) * DEFAULT_PAGE_SIZE >= newData.total,
          ),
        onError: error => {
          dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
            eventName: REPORT_EVENTS.KnowledgeGetDataSetList,
            error,
          });
        },
        target: containerRef,
        reloadDeps: [query, searchType, scopeType, projectID],
      },
    );

  useUpdateEffect(() => {
    handleResetFilter();
  }, [id]);

  const documentVisibility = useDocumentVisibility();
  useEffect(() => {
    if (documentVisibility === 'visible') {
      reload();
    }
  }, [documentVisibility]);

  const handleResetFilter = () => {
    setQuery(undefined);
    setSearchType(DEFAULT_SEARCH_TYPE);
  };

  const handleSearchTypeChange = (value: OrderField) => {
    setSearchType(value);
  };

  const handleQueryChange = (value = '') => {
    setQuery(value);
  };

  const handleAdd = () => {
    createKnowledgeModal?.open();
  };

  const renderContent = () => {
    /** Show the list if you have data */
    if (data?.total) {
      return (
        <>
          <div
            className={cs(styles.content, styles.scrollable)}
            ref={containerRef}
          >
            {isFunction(children)
              ? children({
                  size: DEFAULT_PAGE_SIZE,
                  query,
                  searchType,
                  loading: loadingMore,
                  list: data.list,
                  noMore,
                  resetFilter: handleResetFilter,
                  refresh: reload,
                })
              : children}
          </div>
        </>
      );
    }
    /** Show empty state if no data and not loading */
    if (!loading) {
      return (
        <EmptyToCreate
          scene={scene}
          onAdd={() => {
            handleAdd();
          }}
          canCreate={canCreate}
          createKnowledgeModal={createKnowledgeModal}
        />
      );
    }
    /** No data and no display while loading */
    return null;
  };

  const renderSearch = useMemo(
    () => () =>
      (
        <Input
          autoFocus
          key="query-input"
          placeholder={I18n.t('db2_014')}
          onChange={debounce(handleQueryChange, 500)}
        />
      ),
    [],
  );

  const renderCreateBtn = useMemo(
    () => () =>
      (
        <UIButton
          theme="solid"
          onClick={handleAdd}
          data-testid={BotE2e.BotKnowledgeSelectListModalCreateBtn}
        >
          {I18n.t('datasets_create_btn')}
        </UIButton>
      ),
    [handleAdd],
  );

  const renderFilters = useMemo(
    () => () =>
      (
        <>
          <div className={styles['file-type-tab']}>
            {uniqKnowledgeTypeConfigList.reduce<ReactNode[]>(
              (
                accumulator: ReactNode[],
                currentValue: FilterKnowledgeType,
                currentIndex: number,
              ) => {
                const reactNode = renderKnowledgeTypeConfigNode(currentValue);
                if (currentIndex !== 0) {
                  return accumulator.concat([
                    <Divider layout="vertical" margin="12px" />,
                    reactNode,
                  ]);
                }
                return accumulator.concat([reactNode]);
              },
              [],
            )}
          </div>

          <div className={'flex'}>
            {uniq(showFilters).map((filterType: DatasetFilterType) => {
              if (filterType === 'scope-type') {
                return !isPersonal ? (
                  <UISelect
                    label={I18n.t('Creator')}
                    showClear={false}
                    value={scopeType}
                    optionList={scopeOptions}
                    onChange={v => {
                      setScopeType(v as DatasetScopeType);
                    }}
                  />
                ) : null;
              } else if (filterType === 'search-type') {
                return (
                  <UISelect
                    data-testid={
                      BotE2e.BotKnowledgeSelectListModalCreateDateSelect
                    }
                    label={I18n.t('Sort')}
                    showClear={false}
                    value={searchType}
                    optionList={[
                      {
                        label: I18n.t('Create_time'),
                        value: OrderField.CreateTime,
                      },
                      {
                        label: I18n.t('Update_time'),
                        value: OrderField.UpdateTime,
                      },
                    ]}
                    onChange={v => {
                      handleSearchTypeChange(v as OrderField);
                    }}
                  />
                );
              }
            })}
          </div>
        </>
      ),
    [
      headerClassName,
      handleSearchTypeChange,
      scopeType,
      scopeOptions,
      isPersonal,
      showFilters,
      uniqKnowledgeTypeConfigList,
    ],
  );

  useEffect(() => {
    reload();
  }, [currentKnowledgeType]);

  const renderKnowledgeTypeConfigNode = (type: FilterKnowledgeType) => {
    if (type === FilterKnowledgeType.ALL) {
      return (
        <div
          data-testid={BotE2e.BotKnowledgeSelectListModalAllTab}
          key={FilterKnowledgeType.ALL}
          onClick={() => setCurrentKnowledgeType(FilterKnowledgeType.ALL)}
          className={
            currentKnowledgeType === FilterKnowledgeType.ALL
              ? styles['file-type-tab-item-active']
              : styles['file-type-tab-item']
          }
        >
          {I18n.t('kl2_010')}
        </div>
      );
    }
    if (type === FilterKnowledgeType.TEXT) {
      return (
        <div
          data-testid={BotE2e.BotKnowledgeSelectListModalTextTab}
          key={FilterKnowledgeType.TEXT}
          onClick={() => setCurrentKnowledgeType(FilterKnowledgeType.TEXT)}
          className={
            currentKnowledgeType === FilterKnowledgeType.TEXT
              ? styles['file-type-tab-item-active']
              : styles['file-type-tab-item']
          }
        >
          {I18n.t('kl2_011')}
        </div>
      );
    }
    if (type === FilterKnowledgeType.TABLE) {
      return (
        <div
          data-testid={BotE2e.BotKnowledgeSelectListModalTableTab}
          key={FilterKnowledgeType.TABLE}
          onClick={() => setCurrentKnowledgeType(FilterKnowledgeType.TABLE)}
          className={
            currentKnowledgeType === FilterKnowledgeType.TABLE
              ? styles['file-type-tab-item-active']
              : styles['file-type-tab-item']
          }
        >
          {I18n.t('kl2_012')}
        </div>
      );
    }
    if (type === FilterKnowledgeType.IMAGE) {
      return (
        <div
          data-testid={BotE2e.BotKnowledgeSelectListModalPhotoTab}
          key={FilterKnowledgeType.IMAGE}
          onClick={() => setCurrentKnowledgeType(FilterKnowledgeType.IMAGE)}
          className={
            currentKnowledgeType === FilterKnowledgeType.IMAGE
              ? styles['file-type-tab-item-active']
              : styles['file-type-tab-item']
          }
        >
          {I18n.t('knowledge_photo_025')}
        </div>
      );
    }
    return null;
  };

  const renderContentFilter = () => (
    <Spin spinning={loading} wrapperClassName={styles.spin}>
      <div className={cs(styles.container, DATA_REFACTOR_CLASS_NAME)}>
        {!hideHeader && showFilters?.length ? (
          <div
            className={cs(
              styles.header,
              headerClassName,
              styles['new-filter-header'],
            )}
          >
            <div className={styles['file-type-tab']}>
              {uniqKnowledgeTypeConfigList.reduce<ReactNode[]>(
                (
                  accumulator: ReactNode[],
                  currentValue: FilterKnowledgeType,
                  currentIndex: number,
                ) => {
                  const reactNode = renderKnowledgeTypeConfigNode(currentValue);
                  if (currentIndex !== 0) {
                    return accumulator.concat([
                      <Divider layout="vertical" margin="12px" />,
                      reactNode,
                    ]);
                  }
                  return accumulator.concat([reactNode]);
                },
                [],
              )}
            </div>

            <div className="flex gap-[8px]">
              {uniq(showFilters).map((filterType: DatasetFilterType) => {
                if (filterType === 'scope-type') {
                  return !isPersonal ? (
                    <UISelect
                      label={I18n.t('Creator')}
                      showClear={false}
                      value={scopeType}
                      optionList={scopeOptions}
                      onChange={v => {
                        setScopeType(v as DatasetScopeType);
                      }}
                    />
                  ) : null;
                } else if (filterType === 'search-type') {
                  return (
                    <UISelect
                      data-testid={
                        BotE2e.BotKnowledgeSelectListModalCreateDateSelect
                      }
                      label={I18n.t('Sort')}
                      showClear={false}
                      value={searchType}
                      optionList={[
                        {
                          label: I18n.t('Create_time'),
                          value: OrderField.CreateTime,
                        },
                        {
                          label: I18n.t('Update_time'),
                          value: OrderField.UpdateTime,
                        },
                      ]}
                      onChange={v => {
                        handleSearchTypeChange(v as OrderField);
                      }}
                    />
                  );
                } else if (filterType === 'query-input') {
                  return (
                    <UISearch
                      key="filterType"
                      loading={loading}
                      onSearch={handleQueryChange}
                    />
                  );
                }
              })}
              {scene === Scene.MODAL && canCreate ? (
                <UIButton
                  theme="solid"
                  onClick={handleAdd}
                  data-testid={BotE2e.BotKnowledgeSelectListModalCreateBtn}
                >
                  {I18n.t('datasets_create_btn')}
                </UIButton>
              ) : null}
            </div>
          </div>
        ) : null}
        {renderContent()}
      </div>
      {createKnowledgeModal?.modal}
    </Spin>
  );

  return { renderContentFilter, renderSearch, renderCreateBtn, renderFilters };
};

export { useKnowledgeFilter };
