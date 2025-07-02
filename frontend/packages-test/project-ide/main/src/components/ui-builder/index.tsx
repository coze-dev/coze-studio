import React from 'react';

import { UIBuilder as RawUIBuilder } from '@coze-project-ide/ui-adapter';

import { useProjectInfo } from '../../hooks';

export const UIBuilder = () => {
  const { projectInfo } = useProjectInfo();
  return <RawUIBuilder projectInfo={projectInfo} />;
};
