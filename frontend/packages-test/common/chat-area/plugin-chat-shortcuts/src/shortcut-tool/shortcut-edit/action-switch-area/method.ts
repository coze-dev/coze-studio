import {
  InputType,
  type shortcut_command,
  type ToolParams,
} from '@coze-arch/bot-api/playground_api';

import { type ShortcutEditFormValues } from '../../types';

export const initComponentsByToolParams = (
  params: ToolParams[],
): shortcut_command.Components[] =>
  params?.map(param => {
    const { name, desc, refer_component } = param;
    return {
      name,
      parameter: name,
      description: desc,
      input_type: InputType.TextInput,
      default_value: {
        value: '',
      },
      hide: !refer_component,
    };
  });

// 获取没有被使用的组件
export const getUnusedComponents = (
  shortcut: ShortcutEditFormValues,
): shortcut_command.Components[] => {
  const { components_list, template_query } = shortcut;
  return (
    components_list?.filter(
      component => !template_query?.includes(`{{${component.name}}}`),
    ) ?? []
  );
};
