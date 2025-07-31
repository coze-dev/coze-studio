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

import { useState, type FC } from 'react';

import { useDebounceFn } from 'ahooks';
import { UISearch } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIButton, UICompositionModalSider } from '@coze-arch/bot-semi';
import { From, type PluginQuery } from '@coze-agent-ide/plugin-shared';
import { PluginFilter } from '@coze-agent-ide/plugin-modal-adapter';

import { CreateFormPluginModal } from '../../bot_edit';

import s from './index.module.less';

export interface PluginModalSiderProp {
  query: PluginQuery;
  setQuery: (value: Partial<PluginQuery>, refreshPage?: boolean) => void;
  from?: From;
  onCreateSuccess?: (val?: { spaceId?: string; pluginId?: string }) => void;
  isShowStorePlugin?: boolean;
  hideCreateBtn?: boolean;
}
const MAX_SEARCH_LENGTH = 100;

export const PluginModalSider: FC<PluginModalSiderProp> = ({
  query,
  setQuery,
  from,
  onCreateSuccess,
  isShowStorePlugin,
  hideCreateBtn,
}) => {
  const [showFormPluginModel, setShowFormPluginModel] = useState(false);
  const id = useSpaceStore(item => item.space.id);
  const updateSearchQuery = (search?: string) => {
    setQuery({
      search: search ?? '',
    });
  };
  const { run: debounceChangeSearch, cancel } = useDebounceFn(
    (search: string) => {
      updateSearchQuery(search);
    },
    { wait: 300 },
  );
  return (
    <>
      {hideCreateBtn ? null : (
        <CreateFormPluginModal
          projectId={query.projectId}
          isCreate={true}
          visible={showFormPluginModel}
          onSuccess={pluginID => {
            onCreateSuccess?.({
              spaceId: id,
              pluginId: pluginID,
            });
          }}
          onCancel={() => {
            setShowFormPluginModel(false);
          }}
        />
      )}
      <UICompositionModalSider style={{ paddingTop: 16 }}>
        <UICompositionModalSider.Header>
          <UISearch
            tabIndex={-1}
            value={query.search}
            maxLength={MAX_SEARCH_LENGTH}
            onSearch={search => {
              if (!search) {
                // If the search is empty, update the query immediately
                cancel();
                updateSearchQuery(search);
              } else {
                // If search has a value, then anti-shake update
                debounceChangeSearch(search);
              }
            }}
            placeholder={I18n.t('Search')}
            data-testid="plugin.modal.search"
          />
          {hideCreateBtn ? null : (
            <UIButton
              data-testid="plugin.modal.create.plugin"
              className={s.addbtn}
              theme="solid"
              onClick={() => {
                // TODO: Other scenes should also be created in a unified way. If the creation success callback exists, open the plugin modal, otherwise open a new tab.
                if (
                  onCreateSuccess &&
                  (from === From.ProjectIde || from === From.ProjectWorkflow)
                ) {
                  setShowFormPluginModel(true);
                  return;
                }
                window.open(`/space/${id}/library?type=1`);
              }}
            >
              {I18n.t('plugin_create')}
            </UIButton>
          )}
        </UICompositionModalSider.Header>
        <UICompositionModalSider.Content>
          <PluginFilter
            isSearching={query.search !== ''}
            type={query.type}
            onChange={type => {
              setQuery({ type });
            }}
            from={from}
            projectId={query.projectId}
            isShowStorePlugin={isShowStorePlugin}
          />
        </UICompositionModalSider.Content>
      </UICompositionModalSider>
    </>
  );
};
