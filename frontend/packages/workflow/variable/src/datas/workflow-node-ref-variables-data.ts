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

import { set } from 'lodash-es';
import { FlowNodeVariableData } from '@flowgram-adapter/free-layout-editor';
import {
  Emitter,
  type FormModelV2,
  isFormV2,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { EntityData } from '@flowgram-adapter/free-layout-editor';

import { convertGlobPath } from '../utils/path';
import { type ValueExpression } from '../typings';
import { traverseAllRefExpressions } from '../core/utils/traverse-refs';
import { matchPath } from '../core/utils/name-path';
import { type WorkflowVariable, WorkflowVariableFacadeService } from '../core';
import { allGlobalVariableKeys } from '../constants';

type KeyPath = string[];
type DataPath = string;
type Refs = Record<DataPath, KeyPath>;
type RefVariables = Record<DataPath, WorkflowVariable | undefined>;

export interface UpdateRefInfo {
  beforeKeyPath: KeyPath;
  afterKeyPath?: KeyPath;
  afterExpression?: ValueExpression;
}

/**
 * Represents the data for ref variables of a flow node.
 */
export class WorkflowNodeRefVariablesData extends EntityData {
  static readonly type = 'WorkflowNodeRefVariablesData';

  declare entity: FlowNodeEntity;

  protected onBatchUpdateRefsEmitter = new Emitter<UpdateRefInfo[]>();

  onBatchUpdateRefs = this.onBatchUpdateRefsEmitter.event;

  constructor(entity: FlowNodeEntity) {
    super(entity);

    this.toDispose.push(this.onBatchUpdateRefsEmitter);
  }

  getDefaultData() {
    return {};
  }

  protected get formData(): FlowNodeFormData {
    return this.entity.getData(FlowNodeFormData);
  }

  protected get variableData(): FlowNodeVariableData {
    return this.entity.getData(FlowNodeVariableData);
  }

  protected get facadeService() {
    return this.entity.getService(WorkflowVariableFacadeService);
  }

  get refs(): Refs {
    const refs: Refs = {};

    const fullData = this.formData.formModel.getFormItemValueByPath('/');

    if (fullData) {
      traverseAllRefExpressions(fullData, (_ref, _dataPath) => {
        const keyPath = _ref?.content?.keyPath;
        if (!keyPath?.length) {
          return;
        }
        refs[convertGlobPath(_dataPath)] = keyPath;
      });
    }

    return refs;
  }

  get refVariables(): RefVariables {
    return Object.entries(this.refs).reduce((_acm, _curr) => {
      const [dataPath, keyPath] = _curr;

      return {
        ..._acm,
        [dataPath]: this.facadeService.getVariableFacadeByKeyPath(keyPath, {
          node: this.entity,
          checkScope: true,
        }),
      };
    }, {} satisfies RefVariables);
  }

  /**
   * Batch update variable references
   * @param updateInfos changed KeyPath information
   */
  batchUpdateRefs(updateInfos: UpdateRefInfo[]) {
    let needUpdate = false;
    const fullData = this.formData.formModel.getFormItemValueByPath('/');

    const setValueIn = (path: string, nextValue: unknown) => {
      // New form engine updates data
      if (isFormV2(this.entity)) {
        (this.formData.formModel as FormModelV2).setValueIn(path, nextValue);
        return;
      }

      // Old form engine updates data
      set(fullData, path, nextValue);
      return;
    };

    Object.entries(this.refs).forEach(_entry => {
      const [dataPath, keyPath] = _entry;
      const updateInfo = updateInfos.find(_info =>
        matchPath(_info.beforeKeyPath, keyPath),
      );

      if (updateInfo) {
        needUpdate = true;

        // No updated KeyPath is passed in, the content is updated
        if (!updateInfo.afterKeyPath) {
          // Rehaje update bug: When setting the value, the value in the setter needs to be updated locally, and the overall value of the setter cannot be changed
          setValueIn(
            `${dataPath}.content`,
            updateInfo.afterExpression?.content,
          );
          setValueIn(`${dataPath}.type`, updateInfo.afterExpression?.type);
          return;
        }

        /**
         * Get the updated KeyPath
         * Suppose you want to replace: [A, B] - > [C, D, E]
         * Current KeyPath is [A, B, F, G]
         * Then nextPath is [C, D, E] + [F, G] = [C, D, E, F, G]
         */
        const nextPath = [
          ...updateInfo.afterKeyPath,
          ...keyPath.slice(updateInfo.beforeKeyPath.length),
        ];

        setValueIn(`${dataPath}.content.keyPath`, nextPath);
      }
    });

    if (needUpdate) {
      this.onBatchUpdateRefsEmitter.fire(updateInfos);
      this.formData.fireChange();
    }
  }

  // References to global variables
  get hasGlobalRef(): boolean {
    return Object.values(this.refs).some(_keyPath =>
      (allGlobalVariableKeys as string[]).includes(_keyPath[0]),
    );
  }
}
