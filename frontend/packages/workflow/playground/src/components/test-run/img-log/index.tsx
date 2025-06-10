import React from 'react';

import { NodeExeStatus } from '@coze-arch/idl/workflow_api';
import { I18n } from '@coze-arch/i18n';

import { FormCard } from '../../../form-extensions/components/form-card';
import { useTestRunResult } from './use-test-run-result';
import { ImagesWithDownload } from './images-with-download';
import { Empty } from './empty';

export const ImgLog = () => {
  const testRunResult = useTestRunResult();
  const isShowTestRunResult = !!testRunResult;

  return (
    <FormCard
      header={I18n.t('imageflow_output_display')}
      expand={isShowTestRunResult}
    >
      {testRunResult?.nodeStatus === NodeExeStatus.Success ? (
        <ImagesWithDownload />
      ) : (
        <Empty />
      )}
    </FormCard>
  );
};
