/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** 组件元信息 */
export interface ComponentMetaInfo {
  id?: string;
  /** 组件名 */
  name?: string;
  /** 组件标题 */
  title?: string;
  /** 组件描述 */
  description?: string;
  /** 组件icon */
  iconUri?: string;
  /** 组件url */
  iconUrl?: string;
}

export interface Package {
  id?: string;
  metaInfo?: PackageMetaInfo;
  /** 组件包名 */
  pkgName?: string;
  /** 组件包版本 */
  version?: string;
  /** 组件包创建者uid */
  uid?: string;
  /** 组件包可访问空间id */
  spaceIds?: Array<string>;
  /** 组件包更新时间 */
  updateTime?: string;
  /** 是否最新 */
  isLatest?: boolean;
  /** 组件包渠道 */
  channel?: number;
  /** 组件包在registry中的id */
  registryComponentId?: string;
  /** 产物cdn地址 */
  cdnHost?: string;
}

/** 组件包元信息 */
export interface PackageMetaInfo {
  /** 组件包名 */
  name?: string;
  /** 组件包标题 */
  title?: string;
  /** 组件包描述 */
  description?: string;
  /** 组件包包含的组件 */
  contains?: Array<ComponentMetaInfo>;
  /** 组件包icon */
  iconUri?: string;
  /** 组件包url */
  iconUrl?: string;
}
/* eslint-enable */
