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
