import type t from '@babel/types';

import {
  type IParseResultItem,
  type ServiceDefinition,
  type FunctionDefinition,
  type UnifyStatement,
} from './types';
interface BaseCtx {
  [key: string]: any;
}

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
export interface BaseContent {
  ast: IParseResultItem[];
}

interface BabelDist {
  type: 'babel';
  content: t.File;
}

interface TextDist {
  type: 'text';
  content: string;
}

interface JsonDist {
  type: 'json';
  content: { [key: string]: any };
}
type Dist = JsonDist | BabelDist | TextDist;

export type IGentsRes = Map<string, Dist>;
export interface IParseEntryCtx<T = any> extends BaseCtx {
  ast: IParseResultItem[];
  files: IGentsRes;
  instance: T;
  entries: string[];
}
export interface IGenTemplateCtx extends BaseCtx {
  ast: IParseResultItem;
  service: ServiceDefinition;
  method: FunctionDefinition;
  meta: IMeta;
  template: string;
}

export interface ProcessIdlCtx extends BaseCtx {
  ast: IParseResultItem;
  output: IGentsRes;
  dts: t.File;
  mock: t.File;
  node?: UnifyStatement;
  mockStatements: t.Statement[];
  meta: IMeta[];
}
