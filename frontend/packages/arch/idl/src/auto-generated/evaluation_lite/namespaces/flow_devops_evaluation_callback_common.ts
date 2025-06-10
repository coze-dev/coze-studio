/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum DataType {
  /** 默认，纯文本类型 */
  PlainText = 0,
  /** markdown-box 类型，用于展示markdown内容，字节基于标准 markdown 语法进行了扩展和修改
@flow-web/md-box:  */
  MarkdownBox = 11,
  Image = 12,
  File = 13,
  JSONString = 14,
  TextFile = 15,
  MultiContent = 16,
  DefinedText = 17,
}

export enum DefinedType {
  Unknown = 0,
  Null = 1,
  String = 2,
  Number = 3,
  Bool = 4,
  Array = 5,
  Object = 6,
}

export enum Role {
  System = 1,
  User = 2,
  Assistant = 3,
  Placeholder = 4,
  LLMOutput = 5,
  ToolOutput = 6,
  Function = 7,
}

export interface CardInfo {
  /** card string 是json序列化字段，只透传obric/card返回的内容，具体cardBody，参考
前端可以直接根据前端组件解析这个字段 */
  card_body?: string;
}

export interface Content {
  text?: string;
  data_type?: DataType;
  markdown_box?: MarkdownBox;
  image_info?: ImageInfo;
  file_info?: FileInfo;
  json_info?: JSONInfo;
  text_file?: TextFile;
  multi_content_info?: MultiContentInfo;
  defined_text?: DefinedText;
  /** #31开始是输出字段
card不单独作为类型，与其他DataType组合返回，不为空，即需要解析 */
  card_infos?: Array<CardInfo>;
}

export interface DefinedText {
  defined_type?: DefinedType;
  content?: string;
}

export interface File {
  name?: string;
  url?: string;
  uri?: string;
}

export interface FileInfo {
  files?: Array<File>;
}

export interface Image {
  name?: string;
  url?: string;
  uri?: string;
  thumb_url?: string;
}

export interface ImageInfo {
  images?: Array<Image>;
}

export interface JSONInfo {
  content?: string;
}

export interface MarkdownBox {
  text?: string;
}

export interface MultiContentInfo {
  multi_content?: Array<Content>;
}

export interface TextFile {
  preview_text?: string;
  name?: string;
  url?: string;
  uri?: string;
}
/* eslint-enable */
