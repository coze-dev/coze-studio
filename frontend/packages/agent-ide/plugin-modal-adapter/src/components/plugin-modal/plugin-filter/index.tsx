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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UICompositionModalSider } from '@coze-arch/bot-semi';
import { IconMyTools, IconTeamTools } from '@coze-arch/bot-icons';
import { type Int64, SpaceType } from '@coze-arch/bot-api/developer_api';
import {
  PluginFilterType,
  From,
  getDefaultPluginCategory,
} from '@coze-agent-ide/plugin-shared';

import s from './plugin-filter.module.less';

export interface PluginFilterProps {
  isSearching: boolean;
  type: Int64;
  onChange: (type: Int64) => void;
  projectId?: string;
  from?: From;
  isShowStorePlugin?: boolean;
}

export const PluginFilter: React.FC<PluginFilterProps> = ({
  isSearching,
  type,
  onChange,
  projectId,
  from,
  isShowStorePlugin = true,
}) => {
  const spaceType = useSpaceStore(store => store.space.space_type);
  const defaultId = getDefaultPluginCategory().id;
  const onChangeAfterDiff = (freshType: typeof type) => {
    // If you are searching, leave the search blank
    if (isSearching) {
      onChange(freshType);
      return;
    }
    if (freshType === type) {
      return;
    }
    onChange(freshType);
  };

  return (
    <div className={s['tool-tag-list']}>
      {spaceType === SpaceType.Personal && (
        <div
          data-testid="plugin.modal.filter.option.mine"
          className={classNames(s['tool-tag-list-cell'], {
            [s.active]: type === PluginFilterType.Mine,
          })}
          onClick={() => onChangeAfterDiff(PluginFilterType.Mine)}
        >
          <IconMyTools className={s['tool-tag-list-cell-icon']} />
          {I18n.t('add_resource_modal_sidebar_library_tools')}
        </div>
      )}

      {projectId && from === From.ProjectWorkflow ? (
        <div
          className={classNames(s['tool-tag-list-cell'], {
            [s.active]: type === PluginFilterType.Project,
          })}
          onClick={() => onChangeAfterDiff(PluginFilterType.Project)}
        >
          <IconTeamTools className={s['tool-tag-list-cell-icon']} />
          {I18n.t('add_resource_modal_sidebar_project_tools')}
        </div>
      ) : null}

      {isShowStorePlugin ? (
        <>
          <UICompositionModalSider.Divider />

          <div className={s['tool-content-area']}>
            <div
              className={classNames(s['tool-tag-list-cell'], {
                [s.active]: type === defaultId,
              })}
              onClick={() => onChangeAfterDiff(defaultId)}
            >
              {I18n.t('explore_tools')}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
