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

/* eslint-disable @coze-arch/max-line-per-function */
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash-es';
import { produce } from 'immer';
import {
  type project_memory as ProjectMemory,
  type VariableChannel,
  VariableType,
} from '@coze-arch/bot-api/memory';

import { traverse } from '../../utils/traverse';
import { type ViewVariableType, ObjectLikeTypes } from './types';
import { getDtoVariable } from './transform/vo2dto';
import { getGroupListByDto } from './transform/dto2vo';

export interface Variable {
  variableId: string;
  type: ViewVariableType;
  name: string;
  children: Variable[];
  defaultValue: string;
  description: string;
  enabled: boolean;
  channel: VariableChannel;
  effectiveChannelList: string[];
  variableType: VariableType;
  readonly: boolean;
  groupId: string;
  parentId: string;
  meta: VariableMeta;
}

export interface VariableMeta {
  isHistory: boolean;
  level?: number;
  hasObjectLike?: boolean;
  field?: string;
}

export interface VariableGroup {
  groupId: string;
  groupName: string;
  groupDesc: string;
  groupExtDesc: string;
  isReadOnly: boolean;
  channel: VariableChannel;
  subGroupList: VariableGroup[];
  varInfoList: Variable[];
  raw: ProjectMemory.GroupVariableInfo;
}

export interface VariableGroupsStore {
  variableGroups: VariableGroup[];
  canEdit: boolean;
}

export const getDefaultVariableGroupStore = (): VariableGroupsStore => ({
  canEdit: false,
  variableGroups: [],
});

export interface VariableGroupsAction {
  setVariableGroups: (variableGroups: VariableGroup[]) => void;
  createVariable: (variableInfo: {
    variableType: ViewVariableType;
    groupId: string;
    parentId: string;
    channel: VariableChannel;
  }) => Variable;
  // Update variables, according to groupId and variableId
  updateVariable: (newVariable: Variable) => void;
  // Update the meta information of the variable
  updateMeta: (params: {
    variables: Variable[];
    level?: number;
    parentId?: string;
  }) => void;
  // Add root node variable
  addRootVariable: (variable: Omit<Variable, 'channel'>) => void;
  // Add sub-node variable
  addChildVariable: (variable: Variable) => void;
  // Delete variable
  deleteVariable: (variable: Variable) => void;
  // After being preserved, it is treated as a historical variable
  saveHistory: () => void;
  // Get DTO variable
  getDtoVariable: (variable: Variable) => ProjectMemory.Variable;
  // Get all the variables under groups
  getAllRootVariables: () => Variable[];
  // Get all the variables under groups
  getAllVariables: () => Variable[];
  transformDto2Vo: (data: ProjectMemory.GroupVariableInfo[]) => VariableGroup[];
  initStore: (data: {
    variableGroups: ProjectMemory.GroupVariableInfo[];
    canEdit: boolean;
  }) => void;
  clear: () => void;
  // Locate variables in the variable tree and optionally modify or delete them
  findAndModifyVariable: (
    groupId: string,
    predicate: (variable: Variable) => boolean,
    options?: {
      modifyVariable?: (variable: Variable) => void;
      removeVariable?: boolean;
      mark?: string;
    },
  ) => Variable | null;
}

export const useVariableGroupsStore = create<
  VariableGroupsStore & VariableGroupsAction
>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultVariableGroupStore(),
      setVariableGroups: variableGroups =>
        set({ variableGroups }, false, 'setVariableGroups'),
      createVariable: baseInfo => ({
        variableId: nanoid(),
        type: baseInfo.variableType,
        name: '',
        enabled: true,
        children: [],
        defaultValue: '',
        description: '',
        channel: baseInfo.channel,
        effectiveChannelList: [],
        variableType: VariableType.KVVariable,
        readonly: false,
        groupId: baseInfo.groupId,
        parentId: baseInfo.parentId,
        meta: {
          isHistory: false,
        },
      }),
      addRootVariable: variable => {
        set(
          produce<VariableGroupsStore>(state => {
            const findGroup = state.variableGroups.find(
              item => item.groupId === variable.groupId,
            );
            if (!findGroup) {
              return;
            }
            findGroup.varInfoList.push({
              ...variable,
              channel: findGroup.channel,
            });
            get().updateMeta({
              variables: findGroup.varInfoList,
              level: 0,
              parentId: '',
            });
          }),
          false,
          'addRootVariable',
        );
      },
      addChildVariable: variable => {
        get().findAndModifyVariable(
          variable.groupId,
          item => item.variableId === variable.parentId,
          {
            modifyVariable: parentNode => {
              parentNode.children.push(variable);
              get().updateMeta({
                variables: parentNode.children,
                level: (parentNode.meta.level || 0) + 1,
                parentId: parentNode.variableId,
              });
            },
            mark: 'addChildVariable',
          },
        );
      },
      deleteVariable: variable => {
        get().findAndModifyVariable(
          variable.groupId,
          item => item.variableId === variable.variableId,
          { removeVariable: true, mark: 'deleteVariable' },
        );
      },
      findAndModifyVariable: (groupId, predicate, options) => {
        let foundVariable: Variable | null = null;

        set(
          produce<VariableGroupsStore>(state => {
            const findInGroups = (groups: VariableGroup[]): boolean => {
              for (const group of groups) {
                if (group.groupId === groupId) {
                  if (findInTree(group.varInfoList, predicate, options)) {
                    return true;
                  }
                }
                if (group.subGroupList?.length) {
                  if (findInGroups(group.subGroupList)) {
                    return true;
                  }
                }
              }
              return false;
            };

            const findInTree = (
              variables: Variable[],
              predicateIn: (variable: Variable) => boolean,
              optionsIn?: {
                modifyVariable?: (variable: Variable) => void;
                removeVariable?: boolean;
              },
            ): boolean => {
              for (let i = 0; i < variables.length; i++) {
                if (predicateIn(variables[i])) {
                  foundVariable = cloneDeep(variables[i]);
                  if (optionsIn?.removeVariable) {
                    variables.splice(i, 1);
                  }
                  if (optionsIn?.modifyVariable) {
                    optionsIn.modifyVariable(variables[i]);
                  }
                  return true;
                }
                if (variables[i].children?.length) {
                  if (
                    findInTree(variables[i].children, predicateIn, optionsIn)
                  ) {
                    return true;
                  }
                }
              }
              return false;
            };

            findInGroups(state.variableGroups);
          }),
          false,
          options?.mark || 'findVariableInTree',
        );

        return foundVariable;
      },
      updateVariable: newVariable => {
        get().findAndModifyVariable(
          newVariable.groupId,
          variable => variable.variableId === newVariable.variableId,
          {
            mark: 'updateVariable',
            modifyVariable: variable => {
              Object.assign(variable, newVariable);
              get().updateMeta({
                variables: [variable],
                level: variable.meta.level,
                parentId: variable.parentId,
              });
            },
          },
        );
      },
      updateMeta: ({ variables, level = 0, parentId = '' }) => {
        variables.forEach(item => {
          item.meta.level = level;
          item.meta.hasObjectLike = ObjectLikeTypes.includes(item.type);
          item.parentId = parentId;
          if (item.children?.length) {
            get().updateMeta({
              variables: item.children,
              level: level + 1,
              parentId: item.variableId,
            });
          }
        });
      },
      saveHistory: () => {
        set(
          produce<VariableGroupsStore>(state => {
            state.variableGroups.forEach(item => {
              traverse(item.varInfoList, itemIn => {
                itemIn.meta.isHistory = true;
              });
            });
          }),
          false,
          'saveHistory',
        );
      },
      getAllRootVariables: () => {
        const { variableGroups } = get();
        const res: Variable[] = [];
        traverse(
          variableGroups,
          item => {
            res.push(...item.varInfoList);
          },
          'subGroupList',
        );
        return res;
      },
      getAllVariables: () => {
        const { variableGroups } = get();
        const variables = variableGroups.map(item => item.varInfoList).flat();
        const res: Variable[] = [];
        traverse(
          variables,
          item => {
            res.push(item);
          },
          'children',
        );
        return res;
      },
      transformDto2Vo: data => {
        const transformedData = getGroupListByDto(data);
        // After the data conversion is completed, update the meta information immediately
        transformedData.forEach(group => {
          get().updateMeta({ variables: group.varInfoList });
        });
        return transformedData;
      },
      getDtoVariable: (variable: Variable) => getDtoVariable(variable),
      initStore: data => {
        const { transformDto2Vo } = get();
        const transformedData = transformDto2Vo(data.variableGroups);
        set(
          {
            variableGroups: transformedData,
            canEdit: data.canEdit,
          },
          false,
          'initStore',
        );
      },
      clear: () => {
        set({ ...getDefaultVariableGroupStore() }, false, 'clear');
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'knowledge.variableGroups',
    },
  ),
);
