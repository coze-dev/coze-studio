export interface TrafficEnv {
  Open: boolean,
  Env: string,
}
export interface Base {
  LogID: string,
  Caller: string,
  Addr: string,
  Client: string,
  TrafficEnv?: TrafficEnv,
  Extra?: {
    [key: string | number]: string
  },
}
export interface BaseResp {
  StatusMessage: string,
  StatusCode: number,
  Extra?: {
    [key: string | number]: string
  },
}
export interface EmptyReq {}
export interface EmptyData {}
export interface EmptyResp {
  code: number,
  msg: string,
  data: EmptyData,
}
export interface EmptyRpcReq {}
export interface EmptyRpcResp {}