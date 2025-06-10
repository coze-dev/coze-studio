import { I18n } from '@coze-arch/i18n';
import { VariableChannel } from '@coze-arch/bot-api/memory';

import { type Variable, type VariableGroup } from '@/store';

export const requiredRules = {
  validate: (value: Variable) => !!value.name,
  message: I18n.t('bot_edit_variable_field_required_error'),
};

/**
 * 检查变量名称是否重复
 * 1、检查变量名称在同组&同层级是否重复
 * 2、检查变量名称在不同组的Root节点名称是否重复
 */
export const duplicateRules = {
  validate: (value: Variable, groups: VariableGroup[]): boolean => {
    if (!value.name) {
      return true;
    } // 如果名称为空则跳过检查

    // 1. 检查同组同层级是否重复
    const currentGroup = groups.find(group => group.groupId === value.groupId);

    if (!currentGroup) {
      return true;
    }

    // 获取当前节点所在的所有同层级节点（包括嵌套在其他节点children中的）
    const findSiblings = (
      variables: Variable[],
      targetParentId: string | null,
    ): Variable[] => {
      let result: Variable[] = [];

      for (const variable of variables) {
        // 如果当前变量的parentId与目标parentId相同，且不是自身，则添加到结果中
        if (
          variable.parentId === targetParentId &&
          variable.variableId !== value.variableId
        ) {
          result.push(variable);
        }
        // 递归检查children
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

    // 2. 检查是否与其他组的根节点重名
    // 只有当前节点是根节点时才需要检查
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
