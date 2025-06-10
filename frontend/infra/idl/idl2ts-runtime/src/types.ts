export interface IMeta {
  reqType: string;
  resType: string;
  url: string;
  method: string;
  reqMapping: IHttpRpcMapping;
  resMapping?: IHttpRpcMapping; // res mapping
  name: string;
  service: string;
  schemaRoot: string;
  serializer?: string;
}

type Fields = string[];

export interface IHttpRpcMapping {
  path?: Fields; // path参数
  query?: Fields; // query参数
  body?: Fields; // body 参数
  header?: Fields; // header 参数
  status_code?: Fields; // http状态码
  cookie?: Fields; // cookie
  entire_body?: Fields;
  raw_body?: Fields;
}

export interface CustomAPIMeta {
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  reqMapping?: IHttpRpcMapping;
}
