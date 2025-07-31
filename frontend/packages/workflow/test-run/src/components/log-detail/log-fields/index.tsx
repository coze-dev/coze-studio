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

import React, { useMemo } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeResult } from '@coze-workflow/base/api';

import { type WorkflowLinkLogData } from '../../../types';
import { generateLog } from '../../../features/log';
import { LogField } from './log-field';
import { EmptyFiled } from './empty';

interface LogFieldsProps {
  data: NodeResult | undefined;
  node?: FlowNodeEntity;
  onPreview: (value: string, path: string[]) => void;
  onOpenWorkflowLink?: (data: WorkflowLinkLogData) => void;
}

export const LogFields: React.FC<LogFieldsProps> = ({
  data,
  node,
  onPreview,
  onOpenWorkflowLink,
}) => {
  const { nodeStatus } = data || {};
  const { logs } = useMemo(() => generateLog(data, node), [data, node]);

  if (!data) {
    return <EmptyFiled />;
  }

  return (
    <>
      {logs.map((log, idx) => (
        <LogField
          key={idx}
          log={log}
          node={node}
          nodeStatus={nodeStatus}
          onPreview={onPreview}
          onOpenWorkflowLink={onOpenWorkflowLink}
        />
      ))}
    </>
  );
};
