import { type IFormSchema } from '@coze-workflow/test-run-next';

export const visitNodeLeaf = (
  properties: IFormSchema['properties'],
  fn: (groupKey: string, key: string, field: IFormSchema) => void,
) => {
  Object.entries(properties || {}).forEach(([groupKey, groupField]) => {
    Object.entries(groupField?.properties || {}).forEach(([key, field]) => {
      fn(groupKey, key, field);
    });
  });
};
