import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozUpdate } from '@coze/coze-design/icons';
import { Button } from '@coze/coze-design';
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
