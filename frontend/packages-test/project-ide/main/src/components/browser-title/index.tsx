import { Helmet } from 'react-helmet';
import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { useProjectInfo } from '../../hooks';

export const BrowserTitle: React.FC = () => {
  const { projectInfo } = useProjectInfo();
  return (
    <Helmet>
      <title>
        {I18n.t('project_ide_tab_title', {
          project_name: projectInfo?.name,
        })}
      </title>
    </Helmet>
  );
};
