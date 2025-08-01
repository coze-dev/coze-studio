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
