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
 * 异常端口
 */
export function ExceptionPort() {
  const node = useCurrentEntity();
  const portsData = node.getData<WorkflowNodePortsData>(WorkflowNodePortsData);

  useEffect(() => {
    // 动态端口的节点
    if (isSettingOnErrorDynamicPort(node.flowNodeType as StandardNodeType)) {
      portsData.updateDynamicPorts();
      return;
    }

    // 静态端口的节点
    portsData.updateStaticPorts([
      { type: 'input' },
      { type: 'output', portID: 'default' },
    ]);
  }, [node, portsData]);

  return <Port id={SETTING_ON_ERROR_PORT} type="output" />;
}
