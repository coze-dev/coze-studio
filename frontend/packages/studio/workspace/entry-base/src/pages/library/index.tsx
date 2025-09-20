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

import { forwardRef, useImperativeHandle } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Layout } from '@coze-arch/coze-design';
import { renderHtmlTitle } from '@coze-arch/bot-utils';

import { type BaseLibraryPageProps } from './types';
import { useGetColumns } from './hooks/use-columns';
import { useCachedQueryParams } from './hooks/use-cached-query-params';
import { useLibraryData } from './hooks/use-library-data';
import { LibraryHeader } from './components/library-header';
import { LibraryFilters } from './components/LibraryFilters';
import { LibraryTable } from './components/LibraryTable';

import s from './index.module.less';

export { useDatabaseConfig } from './hooks/use-entity-configs/use-database-config';
export { usePluginConfig } from './hooks/use-entity-configs/use-plugin-config';
export { useWorkflowConfig } from './hooks/use-entity-configs/use-workflow-config';
export { usePromptConfig } from './hooks/use-entity-configs/use-prompt-config';
export { useKnowledgeConfig } from './hooks/use-entity-configs/use-knowledge-config';
export { type LibraryEntityConfig } from './types';
export { type UseEntityConfigHook } from './hooks/use-entity-configs/types';
export { BaseLibraryItem } from './components/base-library-item';

export const BaseLibraryPage = forwardRef<
  { reloadList: () => void },
  BaseLibraryPageProps
>(({ spaceId, isPersonalSpace = true, entityConfigs }, ref) => {
  const { params, setParams, resetParams, hasFilter } =
    useCachedQueryParams({
      spaceId,
    });

  const listResp = useLibraryData(spaceId, entityConfigs, params);

  const columns = useGetColumns({
    entityConfigs,
    reloadList: listResp.reload,
    isPersonalSpace,
  });

  useImperativeHandle(ref, () => ({
    reloadList: () => {
      listResp.reload();
    },
  }));

  return (
    <Layout
      className={s['layout-content']}
      title={renderHtmlTitle(I18n.t('navigation_workspace_library'))}
    >
      <Layout.Header className={classNames(s['layout-header'], 'pb-0')}>
        <div className="w-full">
          <LibraryHeader entityConfigs={entityConfigs} />
          <LibraryFilters
            spaceId={spaceId}
            isPersonalSpace={isPersonalSpace}
            entityConfigs={entityConfigs}
            params={params}
            setParams={setParams}
          />
        </div>
      </Layout.Header>
      <Layout.Content>
        <LibraryTable
          spaceId={spaceId}
          isPersonalSpace={isPersonalSpace}
          entityConfigs={entityConfigs}
          listResp={listResp}
          columns={columns}
          hasFilter={hasFilter}
          resetParams={resetParams}
        />
      </Layout.Content>
    </Layout>
  );
});
