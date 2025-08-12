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

import { I18n } from '@coze-arch/i18n';
import { Button, Tooltip } from '@coze-arch/coze-design';

import { type WorkFlowModalModeProps, type WorkflowInfo } from '../../type';
export type LibButtonProps = Pick<WorkFlowModalModeProps, 'onImport'> & {
  data?: WorkflowInfo;
};
export const LibButton: React.FC<LibButtonProps> = ({ data, onImport }) => {
  const isPublished = data?.plugin_id && data?.plugin_id !== '0';
  const content = (
    <div onClick={e => e.stopPropagation()}>
      <Button
        disabled={!isPublished}
        color="primary"
        data-testid="workflow.modal.add"
        onClick={event => {
          event.stopPropagation();
          data?.workflow_id &&
            onImport?.({
              workflow_id: data.workflow_id,
              name: data.name || '',
            });
        }}
      >
        {I18n.t('project_resource_modal_copy_to_project')}
      </Button>
    </div>
  );
  if (isPublished) {
    return content;
  }
  return (
    <Tooltip
      position="top"
      content={I18n.t('project_toast_only_published_resources_can_be_imported')}
    >
      {content}
    </Tooltip>
  );
};
