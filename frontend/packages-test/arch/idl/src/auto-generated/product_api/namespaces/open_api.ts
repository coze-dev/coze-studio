/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface DuplicateTemplateData {
  /** 复制后的实体ID，如果复制的是智能体模板，对应复制后的智能体ID */
  entity_id?: string;
  /** 枚举类型，目前只有 agent（智能体） */
  entity_type?: string;
}

export interface DuplicateTemplateRequest {
  /** 模板ID（目前仅支持复制智能体） */
  template_id?: string;
  /** 工作空间ID（预期将模板复制该空间） */
  workspace_id?: string;
  /** 复制后的实体名称（对于复制智能体来说，未指定则默认用复制的智能体的名称） */
  name?: string;
}

export interface DuplicateTemplateResponse {
  code?: number;
  msg?: string;
  data?: DuplicateTemplateData;
}
/* eslint-enable */
