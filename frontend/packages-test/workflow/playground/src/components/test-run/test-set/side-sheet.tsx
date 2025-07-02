import React from 'react';

import {
  TestsetSideSheet as OriginTestsetSideSheet,
  type TestsetSideSheetProps,
} from '@coze-devops/testset-manage';

import { useGlobalState } from '../../../hooks';
import { Provider } from './provider';

const TestsetSideSheet: React.FC<TestsetSideSheetProps> = props => {
  const { isCollaboratorMode } = useGlobalState();

  return (
    <Provider>
      <OriginTestsetSideSheet {...props} isExpertMode={isCollaboratorMode} />
    </Provider>
  );
};

export { TestsetSideSheet };
