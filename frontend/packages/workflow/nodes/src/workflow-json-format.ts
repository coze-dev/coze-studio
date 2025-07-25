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
 * 全局转换表单数据，这里主要处理变量生成逻辑
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
   * 转换节点变量
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
   * 兼容仅有单个batch变量的历史数据
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
      // 无需兼容
      return;
    }
    const inputList: BatchDTOInputList = {
      name: 'item', // 按照PRD，写死即可
      input,
    };
    // 在json中填充新数据
    json.data.inputs.batch.inputLists = [inputList];
    // 删掉旧数据
    delete json.data.inputs.batch.inputList;
  }

  /**
   * 修复变量引用逻辑
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
   * 处理节点元数据 & 静态文案
   * @param json
   * @param doc
   * @protected
   */
  protected formatNodeMeta(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
  ): void {
    // API 插件节点暂时不需要处理文案
    if (
      json?.type &&
      [StandardNodeType.Api, StandardNodeType.SubWorkflow].includes(
        json.type as StandardNodeType,
      )
    ) {
      return;
    }

    const nodeMeta = get(json, 'data.nodeMeta');
    // 拉取的最新配置数据
    const meta = this.playgroundContext.getNodeTemplateInfoByType(json.type);

    if (
      nodeMeta &&
      typeof nodeMeta === 'object' &&
      meta &&
      typeof meta === 'object'
    ) {
      // 根据后端配置确定，不由用户控制节点元数据
      const staticMeta = pick(meta, ['icon', 'subTitle']);

      set(json, 'data.nodeMeta', {
        ...nodeMeta,
        ...staticMeta,
      });
    }
  }

  /**
   * 初始化节点
   * @param json
   * @param doc
   * @param isClone
   */
  formatNodeOnInit(
    json: WorkflowNodeJSON,
    doc: WorkflowDocument,
    isClone?: boolean,
  ): WorkflowNodeJSON {
    // 非 clone 在 formatOnInit 已经触发
    if (!isClone) {
      return json;
    }
    this.formatOutputVariables(json, doc);
    this.formatInputVariables(json, doc);
    return json;
  }

  /**
   * 提交节点
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
      // 转换 output
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
      // 转换 input
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
          // 过滤掉空值
          set(json.data, inputsPath, inputValues.filter(Boolean));
        }
      });
    }
    json.type = String(nodeDTOType || json.type);
    return json;
  }
  /**
   * 初始化时候转换变量数据
   * @param json
   * @param document
   */
  formatOnInit(json: WorkflowJSON, document: WorkflowDocument): WorkflowJSON {
    // Step0: batch 兼容处理
    json.nodes.forEach(node => this.transformBatchVariable(node, document));

    // Step1: 创建输出变量
    json.nodes.forEach(node => this.formatOutputVariables(node, document));

    // Step2: 处理input中值转换
    json.nodes.forEach(node => this.formatInputVariables(node, document));

    // Step3: 处理节点 description & subTitle 等静态文案数据 (不从落库数据中取，而是根据最新节点数据中获取)
    json.nodes.forEach(node => this.formatNodeMeta(node, document));
    return json;
  }

  /**
   * 提交时候转换变量数据
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
