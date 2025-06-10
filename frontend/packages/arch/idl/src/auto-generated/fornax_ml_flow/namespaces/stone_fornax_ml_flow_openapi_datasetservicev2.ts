/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as datasetv2 from './datasetv2';
import * as datasetv2lineage from './datasetv2lineage';
import * as base from './base';

export type Int64 = string | number;

export interface DatasetItemWithSource {
  item?: datasetv2.DatasetItem;
  source?: datasetv2lineage.ItemSource;
  deepSources?: Array<datasetv2lineage.ItemSource>;
}

export interface OpenBatchCreateDatasetItemsRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  items: Array<datasetv2.DatasetItem>;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  /** 是否跳过无效数据 */
  skipInvalidItems?: boolean;
  /** 是否允许写入不超过容量限制的数据 */
  allowPartialAdd?: boolean;
  base?: base.Base;
}

export interface OpenBatchCreateDatasetItemsResponse {
  /** key: item在输入数据的索引, value:item的唯一ID */
  addedItems?: Record<number, Int64>;
  errors?: Array<datasetv2.ItemErrorGroup>;
  baseResp?: base.BaseResp;
}

export interface OpenBatchDeleteDatasetItemsRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  itemIDs: Array<string>;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  base?: base.Base;
}

export interface OpenBatchDeleteDatasetItemsResponse {
  baseResp?: base.BaseResp;
}

export interface OpenBatchGetDatasetItemsByVersionRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  versionID: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  itemIDs: Array<string>;
  base?: base.Base;
}

export interface OpenBatchGetDatasetItemsByVersionResponse {
  data?: Array<datasetv2.DatasetItem>;
  baseResp?: base.BaseResp;
}

export interface OpenBatchGetDatasetItemsRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  itemIDs: Array<string>;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  base?: base.Base;
}

export interface OpenBatchGetDatasetItemsResponse {
  data?: Array<datasetv2.DatasetItem>;
  baseResp?: base.BaseResp;
}

export interface OpenClearDatasetItemsRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  base?: base.Base;
}

export interface OpenClearDatasetItemsResponse {
  baseResp?: base.BaseResp;
}

export interface OpenCreateDatasetVersionRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  /** 展示版本号，SemVer2三段式，需要大于上一个版本 */
  version: string;
  desc?: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  base?: base.Base;
}

export interface OpenCreateDatasetVersionResponse {
  versionID?: string;
  baseResp?: base.BaseResp;
}

export interface OpenGetDatasetItemRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  itemID: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  withDeepSources?: boolean;
  base?: base.Base;
}

export interface OpenGetDatasetItemResponse {
  data?: DatasetItemWithSource;
  baseResp?: base.BaseResp;
}

export interface OpenListDatasetItemsByVersionRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  versionID: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  cursor?: string;
  base?: base.Base;
}

export interface OpenListDatasetItemsByVersionResponse {
  data?: Array<datasetv2.DatasetItem>;
  nextCursor?: string;
  total?: string;
  baseResp?: base.BaseResp;
}

export interface OpenListDatasetItemsRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  cursor?: string;
  base?: base.Base;
}

export interface OpenListDatasetItemsResponse {
  data?: Array<datasetv2.DatasetItem>;
  nextCursor?: string;
  baseResp?: base.BaseResp;
}

export interface OpenListDatasetVersionsRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  cursor?: string;
  base?: base.Base;
}

export interface OpenListDatasetVersionsResponse {
  data?: Array<datasetv2.DatasetVersion>;
  nextCursor?: string;
  baseResp?: base.BaseResp;
}

export interface OpenPatchDatasetItemRequest {
  datasetID: string;
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  itemID: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  /** 单轮数据内容，当数据集为单轮时，写入此处的值 */
  data?: Array<datasetv2.FieldData>;
  /** 多轮对话数据内容，当数据集为多轮对话时，写入此处的值 */
  repeatedData?: Array<datasetv2.ItemData>;
  base?: base.Base;
}

export interface OpenPatchDatasetItemResponse {
  baseResp?: base.BaseResp;
}

export interface OpenSearchDatasetsRequest {
  'FlowDevops-Agw-OpenAPI-AppId'?: string;
  name?: string;
  createdBys?: Array<string>;
  'FlowDevops-Agw-OpenAPI-SpaceId'?: string;
  'FlowDevops-Agw-OpenAPI-AccountId'?: string;
  cursor?: string;
  base?: base.Base;
}

export interface OpenSearchDatasetsResponse {
  data?: Array<datasetv2.Dataset>;
  nextCursor?: string;
  baseResp?: base.BaseResp;
}
/* eslint-enable */
