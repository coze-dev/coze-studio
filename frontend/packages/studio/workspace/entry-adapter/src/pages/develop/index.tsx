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
/* eslint @coze-arch/max-line-per-function: ["error", {"max": 500}] */
/* eslint-disable complexity */
import { type FC, useEffect } from 'react';

import classNames from 'classnames';
import {
  highlightFilterStyle,
  WorkspaceEmpty,
  DevelopCustomPublishStatus,
  isPublishStatus,
  isRecentOpen,
  isSearchScopeEnum,
  getPublishRequestParam,
  getTypeRequestParams,
  isEqualDefaultFilterParams,
  isFilterHighlight,
  CREATOR_FILTER_OPTIONS,
  FILTER_PARAMS_DEFAULT,
  STATUS_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
  BotCard,
  Content,
  Header,
  HeaderActions,
  HeaderTitle,
  Layout,
  SubHeader,
  SubHeaderFilters,
  SubHeaderSearch,
  useIntelligenceList,
  useIntelligenceActions,
  useCachedQueryParams,
  useGlobalEventListeners,
  type DevelopProps,
  useProjectCopyPolling,
  useCardActions,
} from '@coze-studio/workspace-base/develop';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';
import {
  IntelligenceType,
  search,
  SearchScope,
} from '@coze-arch/idl/intelligence_api';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozLoading, IconCozPlus } from '@coze-arch/coze-design/icons';
import {
  Button,
  IconButton,
  Search,
  Select,
  Spin,
} from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { SpaceType } from '@coze-arch/bot-api/developer_api';

export const Develop: FC<DevelopProps> = ({ spaceId }) => {
  const isPersonal = useSpaceStore(
    state => state.space.space_type === SpaceType.Personal,
  );

  // Keyword Search & Filtering
  const [filterParams, setFilterParams, debouncedSetSearchValue] =
    useCachedQueryParams();

  const {
    isIntelligenceTypeFilterHighlight,
    isOwnerFilterHighlight,
    isPublishAndOpenFilterHighlight,
  } = isFilterHighlight(filterParams);

  const {
    listResp: { loading, data, loadingMore, mutate, noMore, reload },
    containerRef,
  } = useIntelligenceList({
    params: {
      spaceId,
      searchValue: filterParams.searchValue,
      types: getTypeRequestParams({
        type: filterParams.searchType,
      }),
      hasPublished: getPublishRequestParam(filterParams.isPublish),
      recentlyOpen: filterParams.recentlyOpen,
      searchScope: filterParams.searchScope,
      // Fixed value, from historical code
      orderBy: filterParams.isPublish
        ? search.OrderBy.PublishTime
        : search.OrderBy.UpdateTime,
    },
  });

  useGlobalEventListeners({ reload, spaceId });

  useEffect(() => {
    setFilterParams(prev => ({
      ...prev,
      searchValue: '',
    }));
  }, [spaceId]);

  /**
   * report tea event
   */
  useEffect(() => {
    sendTeaEvent(EVENT_NAMES.view_bot, { tab: 'my_bots' });
  }, []);

  useProjectCopyPolling({
    listData: data?.list,
    spaceId,
    mutate,
  });

  const { contextHolder: cardActionsContextHolder, actions: cardActions } =
    useCardActions({
      isPersonalSpace: isPersonal,
      mutate,
    });

  /**
   * Create project
   */
  const { contextHolder, actions } = useIntelligenceActions({
    spaceId,
    mutateList: mutate,
    reloadList: reload,
  });

  return (
    <>
      {contextHolder}
      {cardActionsContextHolder}
      <Layout>
        <Header>
          <HeaderTitle>
            <span>{I18n.t('workspace_develop')}</span>
          </HeaderTitle>
          <HeaderActions>
            <Button icon={<IconCozPlus />} onClick={actions.createIntelligence}>
              {I18n.t('workspace_create')}
            </Button>
          </HeaderActions>
        </Header>
        <SubHeader>
          <SubHeaderFilters>
            <Select
              className="min-w-[128px]"
              style={
                isIntelligenceTypeFilterHighlight ? highlightFilterStyle : {}
              }
              value={filterParams.searchType}
              onChange={val => {
                setFilterParams(prev => ({
                  ...prev,
                  searchType:
                    val as (typeof TYPE_FILTER_OPTIONS)[number]['value'],
                }));

                // Tea event tracking
                sendTeaEvent(EVENT_NAMES.workspace_action_front, {
                  space_id: spaceId,
                  space_type: isPersonal ? 'personal' : 'teamspace',
                  tab_name: 'develop',
                  action: 'filter',
                  filter_type: 'types',
                  filter_name: I18n.t(
                    TYPE_FILTER_OPTIONS.find(opt => opt.value === val)
                      ?.labelI18NKey as I18nKeysNoOptionsType,
                  ),
                });
              }}
            >
              {TYPE_FILTER_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  {I18n.t(opt.labelI18NKey)}
                </Select.Option>
              ))}
            </Select>
            {!isPersonal ? (
              /**
               * Search Scope
               * Everybody.
               * Created by me
               */
              <Select
                className="min-w-[128px]"
                style={isOwnerFilterHighlight ? highlightFilterStyle : {}}
                value={filterParams.searchScope}
                onChange={val => {
                  if (!isSearchScopeEnum(val)) {
                    return;
                  }
                  setFilterParams(p => {
                    if (val === SearchScope.CreateByMe && p.recentlyOpen) {
                      return {
                        ...p,
                        recentlyOpen: false,
                        isPublish: DevelopCustomPublishStatus.All,
                        searchScope: val,
                      };
                    }
                    return {
                      ...p,
                      searchScope: val,
                    };
                  });
                  // Tea event tracking
                  sendTeaEvent(EVENT_NAMES.workspace_action_front, {
                    space_id: spaceId,
                    space_type: isPersonal ? 'personal' : 'teamspace',
                    tab_name: 'develop',
                    action: 'filter',
                    filter_type: 'creators',
                    filter_name: I18n.t(
                      CREATOR_FILTER_OPTIONS.find(opt => opt.value === val)
                        ?.labelI18NKey as I18nKeysNoOptionsType,
                    ),
                  });
                }}
              >
                {CREATOR_FILTER_OPTIONS.map(opt => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {I18n.t(opt.labelI18NKey)}
                  </Select.Option>
                ))}
              </Select>
            ) : null}
            {/*
              all
              Published
              Recently opened
            */}
            <Select
              className="min-w-[128px]"
              style={
                isPublishAndOpenFilterHighlight ? highlightFilterStyle : {}
              }
              value={
                filterParams.recentlyOpen
                  ? 'recentOpened'
                  : filterParams.isPublish
              }
              onChange={val => {
                setFilterParams(p => ({
                  ...p,
                  searchScope: SearchScope.All,
                  recentlyOpen: isRecentOpen(val),
                  isPublish: isPublishStatus(val)
                    ? val
                    : DevelopCustomPublishStatus.All,
                }));
                // Tea event tracking
                sendTeaEvent(EVENT_NAMES.workspace_action_front, {
                  space_id: spaceId,
                  space_type: isPersonal ? 'personal' : 'teamspace',
                  tab_name: 'develop',
                  action: 'filter',
                  filter_type: 'status',
                  filter_name: I18n.t(
                    STATUS_FILTER_OPTIONS.find(opt => opt.value === val)
                      ?.labelI18NKey as I18nKeysNoOptionsType,
                  ),
                });
              }}
            >
              {STATUS_FILTER_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  {I18n.t(opt.labelI18NKey)}
                </Select.Option>
              ))}
            </Select>
          </SubHeaderFilters>
          <SubHeaderSearch>
            <Search
              disabled={filterParams.recentlyOpen}
              showClear={true}
              className="w-[200px]"
              style={filterParams.searchValue ? highlightFilterStyle : {}}
              placeholder={I18n.t('workspace_develop_search_project')}
              value={filterParams.searchValue}
              onChange={val => {
                debouncedSetSearchValue(val);
              }}
            />
          </SubHeaderSearch>
        </SubHeader>
        <Content ref={containerRef}>
          <Spin spinning={loading} wrapperClassName="w-full !h-[80vh]">
            {/* When data is available */}
            {data?.list.length ? (
              <div
                className={classNames(
                  'grid grid-cols-3 auto-rows-min gap-[20px]',
                  '[@media(min-width:1600px)]:grid-cols-4',
                )}
              >
                {data.list.map((project, index) => (
                  <BotCard
                    key={`${project.basic_info?.id}-${index}`}
                    intelligenceInfo={project}
                    onRetryCopy={cardActions.onRetryCopy}
                    onCancelCopyAfterFailed={
                      cardActions.onCancelCopyAfterFailed
                    }
                    onClick={() => {
                      cardActions.onClick(project);
                    }}
                    onUpdateIntelligenceInfo={cardActions.onUpdate}
                    onDelete={({ name, id, type }) => {
                      if (type === IntelligenceType.Bot) {
                        actions.deleteIntelligence({
                          name,
                          spaceId,
                          agentId: id,
                        });
                        return;
                      }
                      if (type === IntelligenceType.Project) {
                        actions.deleteIntelligence({ name, projectId: id });
                        return;
                      }
                    }}
                    onCopyAgent={cardActions.onCopyAgent}
                    onCopyProject={params => {
                      cardActions.onCopyProject({
                        initialValue: {
                          project_id: params.id ?? '',
                          to_space_id: spaceId,
                          name: params.name ?? '',
                          description: params.description,
                          icon_uri: [
                            {
                              uid: params.icon_uri,
                              url: params.icon_url ?? '',
                            },
                          ],
                        },
                      });
                    }}
                    timePrefixType={
                      filterParams.recentlyOpen
                        ? 'recentOpen'
                        : filterParams.isPublish
                        ? 'publish'
                        : 'edit'
                    }
                  />
                ))}
              </div>
            ) : null}

            {!data?.list?.length && !loading ? (
              <WorkspaceEmpty
                onClear={() => {
                  setFilterParams(FILTER_PARAMS_DEFAULT);
                }}
                hasFilter={
                  !isEqualDefaultFilterParams({
                    filterParams,
                  })
                }
              />
            ) : null}

            {/* Show loading at the bottom. */}
            {data?.list.length && loadingMore ? (
              <div className="flex items-center justify-center w-full h-[38px] my-[20px] coz-fg-secondary text-[12px]">
                <IconButton
                  icon={<IconCozLoading />}
                  loading
                  color="secondary"
                />
                <div>{I18n.t('Loading')}...</div>
              </div>
            ) : null}
            {/* Show a placeholder when there is no more data */}
            {noMore && data?.list.length ? (
              <div className="h-[38px] my-[20px]"></div>
            ) : null}
          </Spin>
        </Content>
      </Layout>
    </>
  );
};
