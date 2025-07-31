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

import { useEffect } from 'react';

import {
  useCurrentEntity,
  WorkflowNodePortsData,
} from '@flowgram-adapter/free-layout-editor';
import {
  isSettingOnErrorDynamicPort,
  SETTING_ON_ERROR_PORT,
} from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { Port } from '../port';

/**
 * abnormal port
 */
export function ExceptionPort() {
  const node = useCurrentEntity();
  const portsData = node.getData<WorkflowNodePortsData>(WorkflowNodePortsData);

  useEffect(() => {
    // Nodes for dynamic ports
    if (isSettingOnErrorDynamicPort(node.flowNodeType as StandardNodeType)) {
      portsData.updateDynamicPorts();
      return;
    }

    // Node on static port
    portsData.updateStaticPorts([
      { type: 'input' },
      { type: 'output', portID: 'default' },
    ]);
  }, [node, portsData]);

  return <Port id={SETTING_ON_ERROR_PORT} type="output" />;
}
