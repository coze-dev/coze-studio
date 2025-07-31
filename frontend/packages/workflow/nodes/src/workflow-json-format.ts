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

import { get, isEmpty, pick, set, isFunction } from 'lodash-es';
import { injectable } from 'inversify';
import {
  PlaygroundContext,
  lazyInject,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  type WorkflowDocument,
  type WorkflowJSON,
  type WorkflowJSONFormatContribution,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowBatchService,
  WorkflowVariableService,
  variableUtils,
  type ViewVariableMeta,
} from '@coze-workflow/variable';
import {
  StandardNodeType,
  type BatchDTOInputList,
  type InputValueDTO,
  type InputValueVO,
  type ValueExpressionDTO,
  type VariableMetaDTO,
} from '@coze-workflow/base';

import {
  WorkflowNodeVariablesMeta,
  type WorkflowNodeRegistry,
} from './typings';

/**
 * Transform form data globally, where variable generation logic is primarily handled
 */
@injectable()
export class WorkflowJSONFormat implements WorkflowJSONFormatContribution {
  @lazyInject(WorkflowVariableService)
  declare variableService: WorkflowVariableService;
  @lazyInject(PlaygroundContext) declare playgroundContext: PlaygroundContext;
  @lazyInject(WorkflowBatchService) batchService: WorkflowBatchService;

  protected getVariablesMeta(
    nodeType: string | number,
    document: WorkflowDocument,
  ): WorkflowNodeVariablesMeta {
    const { variablesMeta = WorkflowNodeVariablesMeta.DEFAULT } =
      document.getNodeRegister<WorkflowNodeRegistry>(nodeType);
    return variablesMeta || WorkflowNodeVariablesMeta.DEFAULT;
  }

  /**
   * Convert node variable
   * @param json
   * @protected
   */
  protected formatOutputVariables(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
  ): void {
    const variablesMeta = this.getVariablesMeta(json.type, doc);
    if (json.data) {
      variablesMeta.outputsPathList!.forEach(outputsPath => {
        const variableMetas = get(json.data, outputsPath) as VariableMetaDTO[];
        if (variableMetas && Array.isArray(variableMetas)) {
          variableMetas.forEach((meta: VariableMetaDTO, index) => {
            if (!meta.type) {
              return;
            }
            const newData = variableUtils.dtoMetaToViewMeta(meta);
            set(variableMetas, index, newData);
          });
        }
      });
    }
  }

  /**
   * Compatible with historical data with only a single batch variable
   */
  protected transformBatchVariable(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
  ): void {
    if (!json.data) {
      return;
    }
    const input: ValueExpressionDTO = get(json.data, 'inputs.batch.inputList');
    if (!input || isEmpty(input)) {
      // No compatibility required
      return;
    }
    const inputList: BatchDTOInputList = {
      name: 'item', // According to PRD, just write it dead.
      input,
    };
    // Filling in new data in JSON
    json.data.inputs.batch.inputLists = [inputList];
    // Delete old data
    delete json.data.inputs.batch.inputList;
  }

  /**
   * Fix variable reference logic
   * @param json
   * @param doc
   * @protected
   */
  protected formatInputVariables(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
  ): void {
    const variablesMeta = this.getVariablesMeta(json.type, doc);
    if (json.data) {
      variablesMeta.inputsPathList!.forEach(inputsPath => {
        const inputValues: InputValueDTO[] = get(
          json.data,
          inputsPath,
        ) as InputValueDTO[];
        if (inputValues && Array.isArray(inputValues)) {
          inputValues.map((inputValue, index) => {
            set(
              inputValues,
              index,
              variableUtils.inputValueToVO(inputValue, this.variableService),
            );
          });
        }
      });
    }
  }

  /**
   * Processing node metadata & static copy
   * @param json
   * @param doc
   * @protected
   */
  protected formatNodeMeta(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
  ): void {
    // The API plug-in node does not need to process copywriting for the time being.
    if (
      json?.type &&
      [StandardNodeType.Api, StandardNodeType.SubWorkflow].includes(
        json.type as StandardNodeType,
      )
    ) {
      return;
    }

    const nodeMeta = get(json, 'data.nodeMeta');
    // Latest configuration data pulled
    const meta = this.playgroundContext.getNodeTemplateInfoByType(json.type);

    if (
      nodeMeta &&
      typeof nodeMeta === 'object' &&
      meta &&
      typeof meta === 'object'
    ) {
      // Determined according to the backend configuration, the node metadata is not controlled by the user
      const staticMeta = pick(meta, ['icon', 'subTitle']);

      set(json, 'data.nodeMeta', {
        ...nodeMeta,
        ...staticMeta,
      });
    }
  }

  /**
   * initialize node
   * @param json
   * @param doc
   * @param isClone
   */
  formatNodeOnInit(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
    isClone?: boolean,
  ): WorkflowNodeJSON {
    // Non-cloning has been triggered in formatOnInit
    if (!isClone) {
      return json;
    }
    this.formatOutputVariables(json, doc);
    this.formatInputVariables(json, doc);
    return json;
  }

  /**
   * commit node
   * @param json
   * @param doc
   */
  formatNodeOnSubmit(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
    node: WorkflowNodeEntity,
  ): WorkflowNodeJSON {
    const { nodeDTOType } = doc.getNodeRegister<WorkflowNodeRegistry>(
      json.type,
    ).meta;
    const variablesMeta = this.getVariablesMeta(json.type, doc);
    if (json.data) {
      // Convert output
      variablesMeta.outputsPathList!.forEach(outputsPath => {
        const variableMetas = get(json.data, outputsPath) as ViewVariableMeta[];
        if (variableMetas && Array.isArray(variableMetas)) {
          variableMetas.forEach((meta: ViewVariableMeta, index) => {
            if (!meta.type) {
              return;
            }
            const newData = variableUtils.viewMetaToDTOMeta(meta);
            set(variableMetas, index, newData);
          });
        }
      });
      // Conversion input
      variablesMeta.inputsPathList!.forEach(inputsPath => {
        const inputValues: InputValueVO[] = get(
          json.data,
          inputsPath,
        ) as InputValueVO[];
        if (inputValues && Array.isArray(inputValues)) {
          inputValues.map((inputValue, index) => {
            if (!inputValue) {
              return;
            }
            set(
              inputValues,
              index,
              variableUtils.inputValueToDTO(inputValue, this.variableService, {
                node,
              }),
            );
          });
          // Filter out null values
          set(json.data, inputsPath, inputValues.filter(Boolean));
        }
      });
    }
    json.type = String(nodeDTOType || json.type);
    return json;
  }
  /**
   * Convert variable data during initialization
   * @param json
   * @param document
   */
  formatOnInit(json: WorkflowJSON, document: WorkflowDocument): WorkflowJSON {
    // Step0: batch compatible processing
    json.nodes.forEach(node => this.transformBatchVariable(node, document));

    // Step1: Create an output variable
    json.nodes.forEach(node => this.formatOutputVariables(node, document));

    // Step2: Handle input median conversion
    json.nodes.forEach(node => this.formatInputVariables(node, document));

    // Step3: Process static copy data such as node description & subTitle (not from the drop database data, but from the latest node data)
    json.nodes.forEach(node => this.formatNodeMeta(node, document));
    return json;
  }

  /**
   * Convert variable data at commit time
   * @param json
   */
  formatOnSubmit(json: WorkflowJSON, document: WorkflowDocument): WorkflowJSON {
    json.nodes = (json.nodes || []).map(node => {
      const registry = document.getNodeRegister<WorkflowNodeRegistry>(
        node.type,
      );
      if (isFunction(registry?.beforeNodeSubmit)) {
        return registry.beforeNodeSubmit(node);
      }
      return node;
    });

    console.log('------------------ save ----------------------', json);
    return json;
  }
}
