import { get } from 'lodash-es';

import { type SchemaExtractorDatasetParamParser } from '../type';

export const datasetParamParser: SchemaExtractorDatasetParamParser =
  datasetParam => {
    const datasetListItem = datasetParam.find(
      param => param.name === 'datasetList',
    );
    const datasetList = get(datasetListItem, 'input.value.content');
    if (!datasetList || !Array.isArray(datasetList)) {
      return {
        datasetList: [],
      };
    }
    return {
      datasetList,
    };
  };
