/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface GetTradeConf {
  /** 场景开关。0-关闭；1-开启。当前支持 trade_available(交易可用性)，根据国家限制; */
  scene_switch?: Record<string, number>;
}

export interface GetTradeConfRequest {
  /** 场景列表，不填默认返回全部SceneSwitch。当前支持 trade_available(交易可用性); */
  scenes?: Array<string>;
  'Tt-Agw-Client-Ip'?: string;
}

export interface GetTradeConfResponse {
  data?: GetTradeConf;
  code: number;
  message: string;
}
/* eslint-enable */
