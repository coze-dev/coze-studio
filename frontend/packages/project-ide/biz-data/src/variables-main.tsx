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

import React, { useEffect } from 'react';

import qs from 'qs';
import {
  useCurrentWidgetContext,
  useIDENavigate,
  useProjectId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import { VariablesPage } from '@coze-data/variable';
import { KnowledgeParamsStoreProvider } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';

const Main = () => {
  const IDENav = useIDENavigate();
  const { widget } = useCurrentWidgetContext();
  const projectID = useProjectId();

  const { version } = useCommitVersion();

  const { uri } = useCurrentWidgetContext();

  const datasetID = uri?.path.name ?? '';

  useEffect(() => {
    widget.setTitle(I18n.t('dataide002'));
    widget.setUIState('normal');
  }, []);

  return (
    <KnowledgeParamsStoreProvider
      params={{
        version,
        projectID,
        datasetID,
        biz: 'project',
      }}
      resourceNavigate={{
        // eslint-disable-next-line max-params
        toResource: (resource, resourceID, query, opts) =>
          IDENav(`/${resource}/${resourceID}?${qs.stringify(query)}`, opts),
        upload: (query, opts) =>
          IDENav(
            `/knowledge/${datasetID}?module=upload&${qs.stringify(query)}`,
            opts,
          ),
        navigateTo: IDENav,
      }}
    >
      <VariablesPage />
    </KnowledgeParamsStoreProvider>
  );
};

export default Main;
