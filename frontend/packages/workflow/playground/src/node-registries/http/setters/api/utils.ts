import { ViewVariableType } from '@coze-workflow/base';

export function transJsTypeToViewVariableType(value: unknown) {
  switch (typeof value) {
    case 'string':
      return ViewVariableType.String;
    case 'number':
      return ViewVariableType.Number;
    case 'boolean':
      return ViewVariableType.Boolean;
    default:
      return ViewVariableType.String;
  }
}

export function transStringParamsToFormData(params: Record<string, string>) {
  if (!params) {
    return [];
  }
  return Object.entries(params).map(([key, value]) => ({
    name: key,
    type: transJsTypeToViewVariableType(value),
    input: { type: 'literal', content: value },
  }));
}
