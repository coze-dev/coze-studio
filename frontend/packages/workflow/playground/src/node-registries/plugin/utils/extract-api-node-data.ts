import { pick } from 'lodash-es';
import { type ApiNodeDetailDTO } from '@coze-workflow/nodes';

export const extractApiNodeData = (
  apiDetailData: ApiNodeDetailDTO,
): Partial<ApiNodeDetailDTO> => ({
  ...pick(apiDetailData, [
    'icon',
    'description',
    'apiName',
    'pluginID',
    'pluginProductStatus',
    'pluginProductUnlistType',
    'pluginType',
    'spaceID',
    'inputs',
    'outputs',
    'updateTime',
  ]),
});
