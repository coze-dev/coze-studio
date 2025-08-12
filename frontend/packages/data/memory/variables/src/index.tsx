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
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { TabBar, TabPane } from '@coze-arch/coze-design';

import { VariablesValue } from './variables-value';
import { VariablesConfig } from './variables-config';

export const VariablesPage = () => {
  const params = useKnowledgeParams();
  const { projectID = '', version } = params;
  return (
    <div
      className={classNames(
        'h-full w-full overflow-hidden',
        'border border-solid coz-stroke-primary coz-bg-max',
      )}
    >
      <TabBar
        lazyRender
        type="text"
        className={classNames(
          'h-full flex flex-col',
          // Scroll bar position is adjusted to tab content
          '[&_.semi-tabs-content]:p-0 [&_.semi-tabs-content]:grow [&_.semi-tabs-content]:overflow-hidden',
          '[&_.semi-tabs-pane-active]:h-full',
          '[&_.semi-tabs-pane-motion-overlay]:h-full [&_.semi-tabs-pane-motion-overlay]:overflow-auto',
        )}
        tabBarClassName="flex items-center h-[56px] mx-[16px]"
      >
        <TabPane tab={I18n.t('db_optimize_033')} itemKey="config">
          <VariablesConfig projectID={projectID} version={version} />
        </TabPane>
        <TabPane tab={I18n.t('variable_Tabname_test_data')} itemKey="values">
          <VariablesValue projectID={projectID} version={version} />
        </TabPane>
      </TabBar>
    </div>
  );
};
