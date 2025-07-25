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
 
/* eslint-disable max-len */
import { get, set, uniq } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { produce } from 'immer';
import {
  type FormModelV2,
  isFormV2,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import {
  type FlowNodeJSON,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowJSON,
} from '@flowgram-adapter/free-layout-editor';
import {
  type UpdateRefInfo,
  WorkflowNodeRefVariablesData,
  WorkflowVariableService,
  type WorkflowVariable,
  variableUtils,
  isGlobalVariableKey,
} from '@coze-workflow/variable';
import {
  type InputValueDTO,
  type InputValueVO,
  StandardNodeType,
  type ValueExpression,
  ValueExpressionType,
} from '@coze-workflow/base';

import {
  traverseRefsInNodeJSON,
  sortVariables,
  variableOrder,
} from '../utils/variable';
import { getNodesWithSubCanvas } from '../utils/get-nodes-with-sub-canvas';
import { EncapsulateContext } from '../encapsulate-context';
import {
  type VariableMap,
  type EncapsulateVars,
  type DecapsulateContext,
} from './types';

@injectable()
export class EncapsulateVariableService {
  @inject(WorkflowDocument) document: WorkflowDocument;

  @inject(WorkflowVariableService) variableService: WorkflowVariableService;

  @inject(EncapsulateContext) encapsulateContext: EncapsulateContext;

  /**
   * 获取封装变量
   * @param nodes
   * @returns
   */

  getEncapsulateVars(_nodes: FlowNodeEntity[]): EncapsulateVars {
    const nodes = getNodesWithSubCanvas(_nodes);

    return {
      startVars: this.getEncapsulateStartVars(nodes),
      endVars: this.getEncapsulateEndVars(nodes),
    };
  }

  /**
   * 主动封装时，更新 WorkflowJSON 内部的变量引用
   * @param workflowJSON
   * @param vars
   * @returns
   */
  updateVarsInEncapsulateJSON(
    workflowJSON: WorkflowJSON,
    vars: EncapsulateVars,
  ) {
    const startId =
      workflowJSON.nodes.find(_node => _node.type === StandardNodeType.Start)
        ?.id || '100001';

    const nextWorkflowJSON = produce(workflowJSON, draft => {
      this.updateVarsInEncapsulateNodesJSON(
        draft.nodes as WorkflowJSON['nodes'],
        vars,
        startId,
      );
    });

    return nextWorkflowJSON;
  }

  /**
   * 更新节点JSON中的变量
   * @param nodes
   * @param vars
   * @param startId
   */
  updateVarsInEncapsulateNodesJSON(
    nodes: WorkflowJSON['nodes'],
    vars: EncapsulateVars,
    startId: string,
  ) {
    const { startVars, endVars } = vars;

    nodes.forEach(_node => {
      if (!_node.data) {
        _node.data = {};
      }

      // 开始节点设置
      if (_node.type === StandardNodeType.Start) {
        _node.data.outputs = Object.entries(startVars).map(_entry => {
          const [name, variable] = _entry;
          return {
            ...variable.dtoMeta,
            name,
          };
        });
        return;
      }
      // 结束节点设置
      if (_node.type === StandardNodeType.End) {
        _node.data.inputs = {
          terminatePlan: 'returnVariables',
          inputParameters: Object.entries(endVars).map(_entry => {
            const [name, variable] = _entry;
            return {
              name,
              input: variable.refExpressionDTO,
            };
          }),
        };
        return;
      }
      traverseRefsInNodeJSON(_node.data, _ref => {
        if (!_ref.content) {
          return;
        }

        const targetKeyPath = [
          _ref.content?.blockID,
          ...(_ref.content?.name?.split('.') || []),
        ];

        const targetEntry = Object.entries(startVars).find(
          ([, _var]) =>
            _var.keyPath[0] === targetKeyPath[0] &&
            _var.keyPath[1] === targetKeyPath[1],
        );

        // 如果命中开始节点的变量，则替换为开始节点的变量
        if (targetEntry) {
          _ref.content.blockID = startId;
          _ref.content.name = [targetEntry[0], ...targetKeyPath.slice(2)].join(
            '.',
          );
        }
      });

      // 子画布场景需要递归
      if (_node.blocks) {
        this.updateVarsInEncapsulateNodesJSON(_node.blocks, vars, startId);
      }
    });
  }

  /**
   * 封装后更新上下游的变量引用
   * @param subFlowNode 封装节点
   * @param selectNodes 选中的节点
   * @param vars 封装变量
   */
  updateVarsAfterEncapsulate(
    subFlowNode: FlowNodeEntity,
    selectNodes: FlowNodeEntity[],
    vars: EncapsulateVars,
  ) {
    const { startVars, endVars } = vars;

    // 封装节点输入变量
    this.setSubFlowNodeInputs(subFlowNode, startVars);

    // 下游引用封装节点的变量
    const updateRefInfos: UpdateRefInfo[] = Object.entries(endVars).map(
      _entry => {
        const [name, variable] = _entry;

        return {
          beforeKeyPath: variable.keyPath,
          afterKeyPath: [subFlowNode.id, name, ...variable.keyPath.slice(2)],
        };
      },
    );

    this.getBeyondNodes([...selectNodes, subFlowNode]).forEach(_node => {
      _node
        .getData(WorkflowNodeRefVariablesData)
        .batchUpdateRefs(updateRefInfos);
    });
  }

  /**
   * 解封装后更新上下游的变量引用
   */
  updateVarsAfterDecapsulate(
    sourceNode: FlowNodeEntity,
    group: DecapsulateContext,
  ) {
    const { startNode, endNode, middleNodes, idsMap } = group;

    const decapsulateNodes = this.flatNodeJSONs(middleNodes)
      .map(_node => this.document.getNode(_node.id || ''))
      .filter(Boolean) as FlowNodeEntity[];

    // 1, 更新封装节点内的变量
    const sourceInputParameters: Record<string, ValueExpression> = sourceNode
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/inputs/inputParameters');
    const updateInsideRefInfos: UpdateRefInfo[] = [
      // 变量引用节点 Id 更新
      ...idsMap.entries().map(_entry => ({
        beforeKeyPath: [_entry[0]],
        afterKeyPath: [_entry[1]],
      })),
      // 输入到封装节点内的变量
      ...Object.entries(sourceInputParameters || {}).map(_entry => {
        const [name, value] = _entry;

        return {
          beforeKeyPath: [startNode?.id || '100001', name],
          afterKeyPath: get(value, 'content.keyPath'),
          afterExpression: value,
        };
      }),
    ];

    decapsulateNodes.forEach(_node => {
      _node
        .getData(WorkflowNodeRefVariablesData)
        .batchUpdateRefs(updateInsideRefInfos);
    });

    // 2. 下游引用封装节点内的变量
    const endOutputs: InputValueDTO[] =
      get(endNode?.data || {}, 'inputs.inputParameters') || [];
    // 从封装节点内输出的变量
    const updateOutsideRefInfos: UpdateRefInfo[] = endOutputs.map(_output => {
      const { name, input } = _output || {};
      const beforeKeyPath = [sourceNode.id, name || ''];
      const expression = variableUtils.valueExpressionToVO(
        input,
        this.variableService,
      );

      if (expression.type === ValueExpressionType.REF) {
        const [nodeId, ...paths] = get(expression, 'content.keyPath') || [];
        const actualNodeId = idsMap.get(nodeId) || nodeId;
        return {
          beforeKeyPath,
          afterKeyPath: [actualNodeId, ...paths],
        };
      }

      return {
        beforeKeyPath,
        afterExpression: expression,
      };
    });

    this.getBeyondNodes([sourceNode, ...decapsulateNodes]).forEach(_node => {
      _node
        .getData(WorkflowNodeRefVariablesData)
        .batchUpdateRefs(updateOutsideRefInfos);
    });
  }

  protected setSubFlowNodeInputs(
    subFlowNode: FlowNodeEntity,
    startVars: EncapsulateVars['startVars'],
  ) {
    const formData = subFlowNode.getData(FlowNodeFormData);

    // SubFlow 的 inputParameters 是 Object 类型
    const inputParameters: Record<string, InputValueVO> = Object.entries(
      startVars,
    )
      .sort((a, b) => variableOrder(b[0]) - variableOrder(a[0]))
      .reduce((acm, _entry) => {
        const [name, variable] = _entry;

        return {
          ...acm,
          [name]: {
            type: ValueExpressionType.REF,
            content: {
              keyPath: variable.keyPath,
            },
          },
        };
      }, {});

    // 新表单引擎更新数据
    if (isFormV2(subFlowNode)) {
      (formData.formModel as FormModelV2).setValueIn(
        'inputs.inputParameters',
        inputParameters,
      );
    } else {
      // 老表单引擎更新数据
      const fullData = formData.formModel.getFormItemValueByPath('/');
      set(fullData, 'inputs.inputParameters', inputParameters);
      formData.fireChange();
    }
  }

  /**
   * 获取封装节点的开始变量
   * @param nodes
   */
  protected getEncapsulateStartVars(nodes: FlowNodeEntity[]): VariableMap {
    const variablesMap = this.generateVariableMap(
      this.getEncapsulateNodesVars(nodes),
    );
    return variablesMap;
  }

  /**
   * 获取封装节点变量
   * @param _nodes
   * @returns
   */
  protected getEncapsulateNodesVars(
    nodes: FlowNodeEntity[],
  ): WorkflowVariable[] {
    const selectNodeIds = nodes.map(_node => _node.id);
    const variables = uniq(
      nodes
        .map(
          _node =>
            Object.values(_node.getData(WorkflowNodeRefVariablesData).refs)
              .filter(
                _keyPath =>
                  !selectNodeIds.includes(_keyPath[0]) &&
                  !isGlobalVariableKey(_keyPath[0]),
              )
              .map(_keyPath =>
                this.variableService.getWorkflowVariableByKeyPath(
                  // 产品要求，只要取第一级即可
                  _keyPath.slice(0, 2),
                  { node: _node },
                ),
              )
              .filter(Boolean) as WorkflowVariable[],
        )
        .flat(),
    );

    return sortVariables(variables);
  }

  /**
   * 获取封装节点的结束变量
   * @param nodes
   */
  protected getEncapsulateEndVars(nodes: FlowNodeEntity[]): VariableMap {
    const selectNodeIds = nodes.map(_node => _node.id);

    // 获取在圈选范围外的节点的所有引用圈选范围内的变量引用
    const variables = uniq(
      this.getBeyondNodes(nodes)
        .map(
          _node =>
            Object.values(_node.getData(WorkflowNodeRefVariablesData).refs)
              .filter(_keyPath => selectNodeIds.includes(_keyPath[0]))
              .map(_keyPath =>
                this.variableService.getWorkflowVariableByKeyPath(
                  // 产品要求，只要取第一级即可
                  _keyPath.slice(0, 2),
                  { node: _node },
                ),
              )
              .filter(Boolean) as WorkflowVariable[],
        )
        .flat(),
    );

    return this.generateVariableMap(variables);
  }

  /**
   * 获取圈选范围外的节点
   * @param nodes
   * @returns
   */
  protected getBeyondNodes(nodes: FlowNodeEntity[]) {
    const selectNodeIds = nodes.map(_node => _node.id);

    return this.document
      .getAllNodes()
      .filter(_node => !selectNodeIds.includes(_node.id));
  }

  /**
   * 生成变量映射
   * @param variables
   */
  protected generateVariableMap(variables: WorkflowVariable[]): VariableMap {
    const variablesMap = variables.reduce((acm, _variable) => {
      const _keyPath = _variable.keyPath || [];
      let name = _keyPath[1];
      let index = 1;

      // 如果 name 已经存在，或者和系统默认字段冲突，则需要添加后缀
      while (acm[name] || ['BOT_USER_INPUT'].includes(name)) {
        name = `${_keyPath[1]}_${index}`;
        index++;
      }

      return {
        ...acm,
        [name]: _variable,
      };
    }, {});

    if (this.encapsulateContext.isChatFlow) {
      return this.generateChatVariableMap(variablesMap);
    }

    return variablesMap;
  }

  /**
   * 1. 情况1：框选范围内所有节点的入参不包含USER_INPUT和CONVERSATION_NAME，此时封装出的子流程为workflow，子流程start不带默认参数
   * 2. 情况2：框选范围内所有节点的入参同时包含了USER_INPUT和CONVERSATION_NAME，此时封装出的子流程为chatflow，子流程start默认带参数USER_INPUT和CONVERSATION_NAME，命名不变，建立和父流程引用关系
   * 3. 情况3：框选范围内所有节点的入参包含了USER_INPUT和CONVERSATION_NAME中的一种，此时封装出的子流程为workflow，子流程start不带默认参数，新建参数USER_INPUT_1或CONVERSATION_NAME_1，建立和父流程引用关系
   */
  protected generateChatVariableMap(variablesMap: VariableMap): VariableMap {
    if (variablesMap.USER_INPUT && !variablesMap.CONVERSATION_NAME) {
      variablesMap.USER_INPUT_1 = variablesMap.USER_INPUT;
      delete variablesMap.USER_INPUT;
    }

    if (variablesMap.CONVERSATION_NAME && !variablesMap.USER_INPUT) {
      variablesMap.CONVERSATION_NAME_1 = variablesMap.CONVERSATION_NAME;
      delete variablesMap.CONVERSATION_NAME;
    }

    return variablesMap;
  }

  protected flatNodeJSONs(nodes: FlowNodeJSON[]) {
    const result: FlowNodeJSON[] = [];
    const queue = [...nodes];

    while (queue.length > 0) {
      const node = queue.shift();

      if (node) {
        result.push(node);
      }

      if (node?.blocks) {
        queue.push(...(node.blocks as FlowNodeJSON[]));
      }
    }

    return result;
  }
}
