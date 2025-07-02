import { isNil } from 'lodash-es';
import { type ApiNodeIdentifier } from '@coze-workflow/nodes';
import { BlockInput } from '@coze-workflow/base';

export function getApiNodeIdentifier(
  apiParam: BlockInput[],
): ApiNodeIdentifier {
  // 定义要提取的字段及其转换方式
  const fieldsToExtract = [
    { name: 'apiName', key: 'apiName' },
    { name: 'pluginID', key: 'pluginID' },
    { name: 'apiID', key: 'api_id', optional: true },
    { name: 'pluginVersion', key: 'plugin_version', optional: true },
  ];

  // 使用reduce构建结果对象
  return fieldsToExtract.reduce(
    (result, field) => {
      const blockInput = apiParam.find(
        (item: BlockInput) => item.name === field.name,
      );

      if (blockInput) {
        const value = BlockInput.toLiteral<string>(blockInput);
        if (!isNil(value)) {
          result[field.key] = value;
        }
      }
      return result;
    },
    {} as unknown as ApiNodeIdentifier,
  );
}
