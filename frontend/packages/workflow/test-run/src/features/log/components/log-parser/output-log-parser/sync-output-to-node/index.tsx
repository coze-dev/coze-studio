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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozUpdate } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useSyncOutput } from './use-sync-output';
import { convertSchema } from './convert';

export const SyncOutputToNode: FC<{
  output: object;
  node: FlowNodeEntity;
}> = props => {
  const { output, node } = props;

  const updateOutput = useSyncOutput('/outputs', node);

  const handleUpdateOutput = () => {
    const outputSchema = convertSchema(output);
    updateOutput(outputSchema);
  };

  return (
    <Button
      color="highlight"
      size="mini"
      icon={<IconCozUpdate />}
      onClick={handleUpdateOutput}
    >
      {I18n.t('workflow_code_testrun_sync')}
    </Button>
  );
};
