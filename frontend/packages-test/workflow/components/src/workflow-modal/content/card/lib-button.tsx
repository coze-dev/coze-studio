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
