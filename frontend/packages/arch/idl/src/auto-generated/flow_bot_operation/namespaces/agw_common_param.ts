/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** 接入agw的公参（ClientIp）引入的通用结构体，copy from https://code.byted.org/cpputil/service_rpc_idl/blob/master/api_gateway/agw_common_param.thrift#L59 */
export interface UnifyArgs {
  platform_id?: number;
  is_ios?: boolean;
  is_android?: boolean;
  access_type?: number;
  resolution_width?: number;
  resolution_height?: number;
  unify_version_code?: Int64;
  unify_version_code_611?: Int64;
  product_id?: number;
  region?: Int64;
  app_cn_name?: string;
  app_name?: string;
  /** 来自query里面的"aid"或者"app_id" */
  app_id?: number;
  /** 来自cookie里面的"install_id"或者query的"iid" */
  install_id?: Int64;
  /** 来自query的"device_id", 或者是根据install_id从device_info服务获取的device_id */
  device_id?: Int64;
  /** 最接近用户的ip, 获取逻辑参考: https://wiki.bytedance.net/pages/viewpage.action?pageId=119674842 */
  client_ip?: string;
}
/* eslint-enable */
