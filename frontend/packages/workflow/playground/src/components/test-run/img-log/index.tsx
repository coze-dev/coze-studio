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
