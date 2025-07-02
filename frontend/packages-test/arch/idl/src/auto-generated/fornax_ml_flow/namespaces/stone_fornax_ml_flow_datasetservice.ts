/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as dataset from './dataset';
import * as base from './base';

export type Int64 = string | number;

export interface CreateDatasetIOTaskReq {
  spaceID: string;
  datasetID: string;
  file: dataset.StorageFile;
  ioType: dataset.DatasetIOType;
  option?: dataset.DatasetIOTaskOption;
  base?: base.Base;
}

export interface CreateDatasetIOTaskResp {
  taskID?: string;
  baseResp?: base.BaseResp;
}

export interface GetDatasetIOTaskReq {
  spaceID: string;
  taskID: string;
  base?: base.Base;
}

export interface GetDatasetIOTaskResp {
  task: dataset.DatasetIOTask;
  baseResp?: base.BaseResp;
}
/* eslint-enable */
