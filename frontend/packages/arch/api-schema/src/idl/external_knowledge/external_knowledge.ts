import { createAPI } from './../../api/config';
/** 外部知识库绑定信息 */
export interface ExternalKnowledgeBinding {
  id: string,
  user_id: string,
  binding_key: string,
  binding_name?: string,
  binding_type?: string,
  /** JSON string */
  extra_config?: string,
  /** 0: disabled, 1: enabled */
  status: number,
  last_sync_at?: number,
  created_at: number,
  updated_at?: number,
}
/** 创建绑定请求 */
export interface CreateBindingRequest {
  binding_key: string,
  binding_name?: string,
  binding_type?: string,
  extra_config?: string,
}
/** 创建绑定响应 */
export interface CreateBindingResponse {
  code: number,
  msg: string,
  data: ExternalKnowledgeBinding,
}
/** 获取绑定列表请求 */
export interface GetBindingListRequest {
  page?: number,
  page_size?: number,
  /** filter by status */
  status?: number,
}
/** 获取绑定列表响应 */
export interface GetBindingListResponse {
  code: number,
  msg: string,
  data: ExternalKnowledgeBinding[],
  total: number,
}
/** 更新绑定请求 */
export interface UpdateBindingRequest {
  /** binding id */
  id: string,
  binding_name?: string,
  status?: number,
  extra_config?: string,
}
/** 更新绑定响应 */
export interface UpdateBindingResponse {
  code: number,
  msg: string,
  data: ExternalKnowledgeBinding,
}
/** 删除绑定请求 */
export interface DeleteBindingRequest {
  /** binding id */
  id: string
}
/** 删除绑定响应 */
export interface DeleteBindingResponse {
  code: number,
  msg: string,
}
/** 验证绑定密钥请求 */
export interface ValidateBindingKeyRequest {
  binding_key: string
}
/** 验证绑定密钥响应 */
export interface ValidateBindingKeyResponse {
  code: number,
  msg: string,
  is_valid: boolean,
  /** validation message */
  message?: string,
}
/** RAGFlow知识库信息 */
export interface RAGFlowDataset {
  id: string,
  name: string,
  description?: string,
  avatar?: string,
  document_count: number,
  chunk_count: number,
  token_num: number,
  language: string,
  embedding_model: string,
  create_date: string,
  create_time: number,
  update_date: string,
  update_time: number,
  /** "1" for active */
  status: number,
}
/** 获取RAGFlow知识库列表请求 */
export interface GetRAGFlowDatasetsRequest {}
/**
 * 空请求体，使用header中的Authorization
 * 获取RAGFlow知识库列表响应
*/
export interface GetRAGFlowDatasetsResponse {
  code: number,
  msg: string,
  data: RAGFlowDataset[],
}
/** 知识库检索请求 */
export interface RetrievalRequest {
  question: string,
  bot_id: string,
  draft_mode?: boolean,
}
/** 知识库检索响应（保持RAGFlow返回格式） */
export interface RetrievalResponse {
  code: number,
  msg: string,
  data?: RetrievalData,
}
export interface RetrievalData {
  chunks?: RetrievalChunk[],
  total?: number,
}
export interface RetrievalChunk {
  id?: string,
  content?: string,
  document_id?: string,
  document_name?: string,
  dataset_id?: string,
  dataset_name?: string,
  similarity?: number,
  metadata?: {
    [key: string | number]: string
  },
  highlight?: string,
  position?: number,
}
/** 创建绑定 */
export const CreateBinding = /*#__PURE__*/createAPI<CreateBindingRequest, CreateBindingResponse>({
  "url": "/api/external-knowledge/binding/create",
  "method": "POST",
  "name": "CreateBinding",
  "reqType": "CreateBindingRequest",
  "reqMapping": {
    "body": ["binding_key", "binding_name", "binding_type", "extra_config"]
  },
  "resType": "CreateBindingResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});
/** 获取绑定列表 */
export const GetBindingList = /*#__PURE__*/createAPI<GetBindingListRequest, GetBindingListResponse>({
  "url": "/api/external-knowledge/binding/list",
  "method": "GET",
  "name": "GetBindingList",
  "reqType": "GetBindingListRequest",
  "reqMapping": {
    "query": ["page", "page_size", "status"]
  },
  "resType": "GetBindingListResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});
/** 更新绑定 */
export const UpdateBinding = /*#__PURE__*/createAPI<UpdateBindingRequest, UpdateBindingResponse>({
  "url": "/api/external-knowledge/binding/:id",
  "method": "PUT",
  "name": "UpdateBinding",
  "reqType": "UpdateBindingRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["binding_name", "status", "extra_config"]
  },
  "resType": "UpdateBindingResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});
/** 删除绑定 */
export const DeleteBinding = /*#__PURE__*/createAPI<DeleteBindingRequest, DeleteBindingResponse>({
  "url": "/api/external-knowledge/binding/:id",
  "method": "DELETE",
  "name": "DeleteBinding",
  "reqType": "DeleteBindingRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "DeleteBindingResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});
/** 验证绑定密钥 */
export const ValidateBindingKey = /*#__PURE__*/createAPI<ValidateBindingKeyRequest, ValidateBindingKeyResponse>({
  "url": "/api/external-knowledge/binding/validate",
  "method": "POST",
  "name": "ValidateBindingKey",
  "reqType": "ValidateBindingKeyRequest",
  "reqMapping": {
    "body": ["binding_key"]
  },
  "resType": "ValidateBindingKeyResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});
/** 获取RAGFlow知识库列表 */
export const GetRAGFlowDatasets = /*#__PURE__*/createAPI<GetRAGFlowDatasetsRequest, GetRAGFlowDatasetsResponse>({
  "url": "/api/external-knowledge/ragflow/datasets",
  "method": "GET",
  "name": "GetRAGFlowDatasets",
  "reqType": "GetRAGFlowDatasetsRequest",
  "reqMapping": {},
  "resType": "GetRAGFlowDatasetsResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});
/** 知识库检索接口 */
export const Retrieval = /*#__PURE__*/createAPI<RetrievalRequest, RetrievalResponse>({
  "url": "/api/external-knowledge/retrieval",
  "method": "POST",
  "name": "Retrieval",
  "reqType": "RetrievalRequest",
  "reqMapping": {
    "body": ["question", "bot_id", "draft_mode"]
  },
  "resType": "RetrievalResponse",
  "schemaRoot": "api://schemas/idl_external_knowledge_external_knowledge",
  "service": "external_knowledge"
});