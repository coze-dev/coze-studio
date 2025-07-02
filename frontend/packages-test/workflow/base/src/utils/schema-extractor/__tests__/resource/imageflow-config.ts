/* eslint-disable @coze-arch/no-deep-relative-import */
import { type SchemaExtractorConfig } from '../../type';
import { SchemaExtractorParserName } from '../../constant';
import { StandardNodeType } from '../../../../types';

export const imageflowExtractorConfig: SchemaExtractorConfig = {
  // api 节点 4
  [StandardNodeType.Api]: [
    {
      // 对应input name
      name: 'inputs',
      path: 'inputs.inputParameters',
      parser: SchemaExtractorParserName.INPUT_PARAMETERS,
    },
  ],
};
