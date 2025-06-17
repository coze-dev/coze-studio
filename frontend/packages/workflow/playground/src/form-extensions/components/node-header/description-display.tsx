import { type FC } from 'react';

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { Typography } from '@coze-arch/coze-design';

export const DescriptionDisplay: FC<{
  description?: string;
}> = props => {
  const { description } = props;

  const node = useCurrentEntity();

  if (!description) {
    return null;
  }

  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity.getNodeData();

  if (nodeData?.description === description) {
    return null;
  } else {
    return (
      <Typography.Text
        className="coz-fg-secondary pt-2"
        size="small"
        ellipsis={{
          rows: 1,
        }}
      >
        {description}
      </Typography.Text>
    );
  }
};
