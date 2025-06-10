/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_evaluation_callback_common from './flow_devops_evaluation_callback_common';

export type Int64 = string | number;

export interface Cell {
  column_name: string;
  /** deprecated */
  content?: flow_devops_evaluation_callback_common.Content;
  value?: OpenContent;
}

export interface MultiContentInfo {
  multi_contents?: Array<OpenContent>;
}

export interface OpenContent {
  data_type: string;
  plain_text?: string;
  markdown_box?: flow_devops_evaluation_callback_common.MarkdownBox;
  image_info?: flow_devops_evaluation_callback_common.ImageInfo;
  file_info?: flow_devops_evaluation_callback_common.FileInfo;
  json_info?: flow_devops_evaluation_callback_common.JSONInfo;
  text_file?: flow_devops_evaluation_callback_common.TextFile;
  multi_content_info?: MultiContentInfo;
  defined_text?: flow_devops_evaluation_callback_common.DefinedText;
}

export interface Row {
  row_id: string;
  cells?: Array<Cell>;
}

export interface RowGroup {
  row_group_id: string;
  group_name: string;
  /** 新增创建时指定tags */
  tags?: Array<string>;
  rows?: Array<Row>;
}
/* eslint-enable */
