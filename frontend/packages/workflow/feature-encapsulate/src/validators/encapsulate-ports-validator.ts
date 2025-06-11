import { injectable } from 'inversify';
import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  WorkflowNodePortsData,
} from '@flowgram-adapter/free-layout-editor';

import {
  EncapsulateValidateErrorCode,
  type EncapsulateNodesValidator,
} from '../validate';
import { getNodesWithSubCanvas } from '../utils/get-nodes-with-sub-canvas';
import { EncapsulateBaseValidator } from './encapsulate-base-validator';

@injectable()
export class EncapsulatePortsValidator
  extends EncapsulateBaseValidator
  implements EncapsulateNodesValidator
{
  validate(nodes: WorkflowNodeEntity[], result) {
    getNodesWithSubCanvas(nodes).forEach(node => {
      const ignoreNodes = [
        StandardNodeType.Comment,
        FlowNodeBaseType.SUB_CANVAS,
      ];
      if (ignoreNodes.includes(node.flowNodeType as StandardNodeType)) {
        return;
      }

      const portsData = node.getData<WorkflowNodePortsData>(
        WorkflowNodePortsData,
      );

      const hasNotConnectPort = portsData.allPorts.some(
        port => port.lines.length === 0,
      );
      if (hasNotConnectPort) {
        const sourceName = this.getNodeName(node);
        const sourceIcon = this.getNodeIcon(node);

        result.addError({
          code: EncapsulateValidateErrorCode.INVALID_PORTS,
          message: I18n.t(
            'workflow_encapsulate_button_unable_uncomplete',
            undefined,
            '封装不应该包含没有输入输出的节点',
          ),
          source: node.id,
          sourceName,
          sourceIcon,
        });
      }
    });
  }
  includeStartEnd: true;
}
