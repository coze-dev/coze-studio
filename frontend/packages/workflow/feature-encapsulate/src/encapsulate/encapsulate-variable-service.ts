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
   * Get encapsulation variable
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
   * When actively encapsulating, update variable references inside WorkflowJSON
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
   * Update variables in node JSON
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

      // Start Node Setup
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
      // End Node Settings
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

        // If the variable of the start node is hit, it is replaced with the variable of the start node
        if (targetEntry) {
          _ref.content.blockID = startId;
          _ref.content.name = [targetEntry[0], ...targetKeyPath.slice(2)].join(
            '.',
          );
        }
      });

      // Sub-canvas scenes need to be recursive
      if (_node.blocks) {
        this.updateVarsInEncapsulateNodesJSON(_node.blocks, vars, startId);
      }
    });
  }

  /**
   * Update upstream and downstream variable references after encapsulation
   * @param subFlowNode encapsulation node
   * @param selectNodes selected node
   * @param vars encapsulation variable
   */
  updateVarsAfterEncapsulate(
    subFlowNode: FlowNodeEntity,
    selectNodes: FlowNodeEntity[],
    vars: EncapsulateVars,
  ) {
    const { startVars, endVars } = vars;

    // Encapsulating node input variables
    this.setSubFlowNodeInputs(subFlowNode, startVars);

    // Variables that encapsulate nodes by downstream references
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
   * Update upstream and downstream variable references after unencapsulation
   */
  updateVarsAfterDecapsulate(
    sourceNode: FlowNodeEntity,
    group: DecapsulateContext,
  ) {
    const { startNode, endNode, middleNodes, idsMap } = group;

    const decapsulateNodes = this.flatNodeJSONs(middleNodes)
      .map(_node => this.document.getNode(_node.id || ''))
      .filter(Boolean) as FlowNodeEntity[];

    // 1. Update the variables in the encapsulated node
    const sourceInputParameters: Record<string, ValueExpression> = sourceNode
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/inputs/inputParameters');
    const updateInsideRefInfos: UpdateRefInfo[] = [
      // Variable reference node Id update
      ...idsMap.entries().map(_entry => ({
        beforeKeyPath: [_entry[0]],
        afterKeyPath: [_entry[1]],
      })),
      // Variables entered into the encapsulated node
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

    // 2. Downstream references encapsulate variables within the node
    const endOutputs: InputValueDTO[] =
      get(endNode?.data || {}, 'inputs.inputParameters') || [];
    // Variables output from within the encapsulated node
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

    // SubFlow's inputParameters are of type Object
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

    // New form engine updates data
    if (isFormV2(subFlowNode)) {
      (formData.formModel as FormModelV2).setValueIn(
        'inputs.inputParameters',
        inputParameters,
      );
    } else {
      // Old form engine updates data
      const fullData = formData.formModel.getFormItemValueByPath('/');
      set(fullData, 'inputs.inputParameters', inputParameters);
      formData.fireChange();
    }
  }

  /**
   * Get the start variable of the encapsulated node
   * @param nodes
   */
  protected getEncapsulateStartVars(nodes: FlowNodeEntity[]): VariableMap {
    const variablesMap = this.generateVariableMap(
      this.getEncapsulateNodesVars(nodes),
    );
    return variablesMap;
  }

  /**
   * Get encapsulated node variable
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
                  // Product requirements, as long as you take the first level.
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
   * Get the end variable of the encapsulated node
   * @param nodes
   */
  protected getEncapsulateEndVars(nodes: FlowNodeEntity[]): VariableMap {
    const selectNodeIds = nodes.map(_node => _node.id);

    // Get all references to nodes outside the circled scope Variable references in the circled scope
    const variables = uniq(
      this.getBeyondNodes(nodes)
        .map(
          _node =>
            Object.values(_node.getData(WorkflowNodeRefVariablesData).refs)
              .filter(_keyPath => selectNodeIds.includes(_keyPath[0]))
              .map(_keyPath =>
                this.variableService.getWorkflowVariableByKeyPath(
                  // Product requirements, as long as you take the first level.
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
   * Get nodes outside the circled range
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
   * Generate variable mapping
   * @param variables
   */
  protected generateVariableMap(variables: WorkflowVariable[]): VariableMap {
    const variablesMap = variables.reduce((acm, _variable) => {
      const _keyPath = _variable.keyPath || [];
      let name = _keyPath[1];
      let index = 1;

      // If name already exists or conflicts with the system default field, you need to add a suffix
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
   * 1. Case 1: The imported parameters of all nodes in the box selection range do not contain USER_INPUT and CONVERSATION_NAME. At this time, the encapsulated sub-process is workflow, and the sub-process start does not have default parameters
   * 2. Case 2: The imported parameters of all nodes in the box selection range contain both USER_INPUT and CONVERSATION_NAME. At this time, the encapsulated sub-process is chatflow. The sub-process start defaults to parameters USER_INPUT and CONVERSATION_NAME, the name remains unchanged, and the reference relationship with the parent process is established
   * 3. Case 3: The imported parameters of all nodes in the box selection range contain one of USER_INPUT and CONVERSATION_NAME. At this time, the encapsulated sub-process is workflow, the sub-process start does not have default parameters, and the new parameters USER_INPUT_1 or CONVERSATION_NAME_1 to establish a reference relationship with the parent process
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
