import { TestFormFieldName } from '@coze-workflow/test-run-next';

export const getTestsetField = () => ({
  [TestFormFieldName.TestsetSelect]: {
    // 排序在最前面
    ['x-index']: 0,
    ['x-component']: 'TestsetSelect',
  },
  [TestFormFieldName.TestsetSave]: {
    ['x-component']: 'TestsetSave',
  },
});
