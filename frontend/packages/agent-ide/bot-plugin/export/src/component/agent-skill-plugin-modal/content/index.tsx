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
import { type FC, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { sortBy } from 'lodash-es';
import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { IconChevronDown, IconChevronRight } from '@douyinfe/semi-icons';
import { useWorkflowStore } from '@coze-workflow/base/store';
import { InfiniteList, type InfiniteListRef } from '@coze-community/components';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UICompositionModalMain, Collapse } from '@coze-arch/bot-semi';
import {
  type PluginApi,
  type PluginInfoForPlayground,
} from '@coze-arch/bot-api/plugin_develop';
import {
  fetchPlugin,
  formatCacheKey,
  type PluginContentListItem,
  type PluginQuery,
  type PluginModalModeProps,
} from '@coze-agent-ide/plugin-shared';
import { PluginPanel } from '@coze-agent-ide/plugin-modal-adapter';

import { useInfiniteScrollCacheLoad } from '../use-request-cache';

import s from './index.module.less';

export interface PluginModalContentProps extends PluginModalModeProps {
  query: PluginQuery;
  pluginApiList: PluginApi[];
  onPluginApiListChange: (list: PluginApi[]) => void;
  setQuery: (value: Partial<PluginQuery>, refreshPage?: boolean) => void;
}
export type PluginModalContentListItem = PluginInfoForPlayground & {
  // The current data belongs to the page of the list
  belong_page?: number;
};

// @ts-expect-error -- linter-disable-autofix
// eslint-disable-next-line max-params
const getEmptyConf = (spaceId, isMine, isTeam, isProject) => {
  if ((isMine || isTeam) && !isProject) {
    return {
      text: {
        emptyTitle: I18n.t('plugin_empty_desc'),
        emptyDesc: I18n.t('plugin_empty_description'),
      },
      btn: {
        emptyClick: () => {
          window.open(`/space/${spaceId}/library?type=1`);
        },
        emptyText: I18n.t('plugin_create'),
      },
    };
  }
  return {
    text: {
      emptyTitle: I18n.t('plugin_empty_desc'),
      emptyDesc: '',
    },
    btn: {
      emptyClick: () => {
        window.open('/store/plugin');
      },
      emptyText: I18n.t('mkl_plugin_to_plugin_gallery'),
    },
  };
};

/* eslint-disable @coze-arch/max-line-per-function */
export const PluginModalContent: FC<PluginModalContentProps> = ({
  query,
  pluginApiList,
  onPluginApiListChange,
  openMode,
  from,
  openModeCallback,
  showButton,
  showCopyPlugin,
  onCopyPluginCallback,
  clickProjectPluginCallback,
}) => {
  // Status hook
  const {
    type,
    mineActive,
    search,
    isOfficial,
    orderBy,
    orderByPublic,
    orderByFavorite,
    agentId,
    pluginType,
  } = query;
  const id = useSpaceStore(store => store.space.id);
  // Scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // Currently active key
  const [activeKey, setActivekey] = useState<string | string[] | undefined>([]);
  const refInfiniteScroll = useRef<InfiniteListRef>(null);
  const {
    scroll2Top,
    loadData,
    isSearching,
    isFavorite,
    isTemplate,
    isProject,
    isMine,
    isTeam,
  } = useInfiniteScrollCacheLoad<PluginContentListItem, PluginQuery>({
    query,
    formatCacheKey,
    scrollContainer: scrollContainerRef,
    triggerService: fetchPlugin,
    onSetScrollData: scrollData => {
      refInfiniteScroll.current?.mutate(scrollData);
    },
  });
  const { nodes: workflowNodes } = useWorkflowStore(
    useShallow(state => ({
      nodes: state.nodes,
    })),
  );
  // The first effect is not executed, this is the effect of switching the state
  useUpdateEffect(() => {
    scroll2Top(); // When the filter item changes, return to the top
    // Perform this effect whenever a non-page change is made in the query
  }, []);
  return (
    <UICompositionModalMain>
      <div className={s['plugin-content']} ref={scrollContainerRef}>
        <UICompositionModalMain.Content
          style={{ minHeight: '100%', display: 'flex' }}
        >
          <Collapse
            className={s['plugin-collapse']}
            activeKey={activeKey}
            onChange={value => {
              setActivekey(value);
            }}
            expandIcon={
              <IconChevronRight
                className={s['collapse-icon']}
                data-testid="plugin-collapse-panel-expand"
              />
            }
            collapseIcon={
              <IconChevronDown
                className={s['collapse-icon']}
                data-testid="plugin-collapse-panel-collapse"
              />
            }
          >
            <InfiniteList<PluginContentListItem>
              ref={refInfiniteScroll}
              itemClassName={s['item-container']}
              renderItem={(item, index) => {
                const pluginId = item?.pluginInfo?.id;
                return (
                  <PluginPanel
                    agentId={agentId}
                    index={index}
                    pluginApiList={pluginApiList}
                    onPluginApiListChange={onPluginApiListChange}
                    onCopyPluginCallback={onCopyPluginCallback}
                    showButton={showButton}
                    showCopyPlugin={showCopyPlugin}
                    openMode={openMode}
                    from={from}
                    workflowNodes={workflowNodes}
                    openModeCallback={openModeCallback}
                    highlightWords={[search]}
                    showCreator={true}
                    showMarketLink={isFavorite || isTemplate}
                    showCreateTime={orderBy === 0 || typeof type === 'number'}
                    showPublishTime={!isMine && !isTeam && !isProject}
                    activeKey={activeKey}
                    scrollContainerRef={scrollContainerRef}
                    isFromMarket={item?.isFromMarket}
                    info={{
                      ...item?.pluginInfo,
                      id: pluginId,
                      listed_at: item?.productInfo?.listed_at,
                      plugin_apis: sortBy(
                        item?.pluginInfo?.plugin_apis,
                        p => p.name,
                      ),
                    }}
                    productInfo={item?.productInfo}
                    commercialSetting={item?.commercial_setting}
                    key={pluginId}
                    type={String(type || '')}
                    className={classNames(s['plugin-collapse'], {
                      [s.activePanel]: activeKey?.includes(pluginId ?? ''),
                    })}
                    showProjectPluginLink={isProject}
                    clickProjectPluginCallback={clickProjectPluginCallback}
                  />
                );
              }}
              emptyConf={getEmptyConf(id, isMine, isTeam, isProject)}
              scrollConf={{
                reloadDeps: [
                  type,
                  mineActive,
                  search,
                  isOfficial,
                  orderBy,
                  orderByPublic,
                  orderByFavorite,
                  pluginType,
                ],
                targetRef: scrollContainerRef,
                loadData,
              }}
              isSearching={isSearching}
            />
          </Collapse>
        </UICompositionModalMain.Content>
      </div>
    </UICompositionModalMain>
  );
};
