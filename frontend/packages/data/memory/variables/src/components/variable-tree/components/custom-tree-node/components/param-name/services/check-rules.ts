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

import { I18n } from '@coze-arch/i18n';
import { VariableChannel } from '@coze-arch/bot-api/memory';

import { type Variable, type VariableGroup } from '@/store';

export const requiredRules = {
  validate: (value: Variable) => !!value.name,
  message: I18n.t('bot_edit_variable_field_required_error'),
};

/**
 * Check if variable names are duplicate
 * 1. Check whether the variable names are duplicated in the same group & level
 * 2. Check whether the variable names are duplicated in the root node names of different groups
 */
export const duplicateRules = {
  validate: (value: Variable, groups: VariableGroup[]): boolean => {
    if (!value.name) {
      return true;
    } // Skip check if name is empty

    // 1. Check whether the same group and level are duplicated
    const currentGroup = groups.find(group => group.groupId === value.groupId);

    if (!currentGroup) {
      return true;
    }

    // Get all nodes at the same level as the current node (including those nested in other node children)
    const findSiblings = (
      variables: Variable[],
      targetParentId: string | null,
    ): Variable[] => {
      let result: Variable[] = [];

      for (const variable of variables) {
        // If the parentId of the current variable is the same as the target parentId and is not itself, it is added to the result
        if (
          variable.parentId === targetParentId &&
          variable.variableId !== value.variableId
        ) {
          result.push(variable);
        }
        // Check children recursively
        if (variable.children?.length) {
          result = result.concat(
            findSiblings(variable.children, targetParentId),
          );
        }
      }

      return result;
    };

    const siblings = findSiblings(currentGroup.varInfoList, value.parentId);

    if (siblings.some(sibling => sibling.name === value.name)) {
      return false;
    }

    // 2. Check if it has the same name as the root node of other groups
    // Check only if the current node is the root node
    if (!value.parentId) {
      const otherGroupsRootNodes = groups
        .filter(group => group.groupId !== value.groupId)
        .flatMap(group => {
          const rootVariableList = group.varInfoList;
          const subGroupVarInfoList = group.subGroupList.flatMap(
            subGroup => subGroup.varInfoList,
          );
          return rootVariableList.concat(subGroupVarInfoList);
        });

      if (otherGroupsRootNodes.some(node => node.name === value.name)) {
        return false;
      }
    }

    return true;
  },
  message: I18n.t('workflow_detail_node_error_variablename_duplicated'),
};

export const existKeywordRules = {
  validate: (value: Variable) =>
    /^(?!.*\b(true|false|and|AND|or|OR|not|NOT|null|nil|If|Switch)\b)[a-zA-Z_][a-zA-Z_$0-9]*$/.test(
      value.name,
    ),
  message: I18n.t('variables_app_name_limit'),
};

export const checkParamNameRules = (
  value: Variable,
  groups: VariableGroup[],
  validateExistKeyword: boolean,
):
  | {
      valid: boolean;
      message: string;
    }
  | undefined => {
  if (!requiredRules.validate(value)) {
    return {
      valid: false,
      message: requiredRules.message,
    };
  }
  if (!duplicateRules.validate(value, groups)) {
    return {
      valid: false,
      message: duplicateRules.message,
    };
  }
  if (
    validateExistKeyword &&
    !existKeywordRules.validate(value) &&
    value.channel === VariableChannel.APP
  ) {
    return {
      valid: false,
      message: existKeywordRules.message,
    };
  }
  return {
    valid: true,
    message: '',
  };
};
