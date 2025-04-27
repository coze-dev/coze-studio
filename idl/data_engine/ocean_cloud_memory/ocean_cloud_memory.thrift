include "kvmemory/kvmemory.thrift"
include "kvmemory/project_memory.thrift"
include "knowledge/document2.thrift"

namespace go ocean.cloud.memory

service MemoryService {
    // --- variable
    project_memory.GetProjectVariableListResp GetProjectVariableList(1:project_memory.GetProjectVariableListReq req)(api.get='/api/memory/project/variable/meta_list', api.category="memory_project")
    project_memory.UpdateProjectVariableResp UpdateProjectVariable(1:project_memory.UpdateProjectVariableReq req)(api.post='/api/memory/project/variable/meta_update', api.category="memory_project")
    project_memory.GetMemoryVariableMetaResp GetMemoryVariableMeta(1:project_memory.GetMemoryVariableMetaReq req)(api.post='/api/memory/variable/get_meta', api.category="memory",agw.preserve_base="true")
    kvmemory.DelProfileMemoryResponse DelProfileMemory(1:kvmemory.DelProfileMemoryRequest req)(api.post='/api/memory/variable/delete', api.category="memory",agw.preserve_base="true")
    kvmemory.GetProfileMemoryResponse GetPlayGroundMemory(1:kvmemory.GetProfileMemoryRequest req)(api.post='/api/memory/variable/get', api.category="memory",agw.preserve_base="true")
    kvmemory.GetSysVariableConfResponse GetSysVariableConf(1:kvmemory.GetSysVariableConfRequest req)(api.get='/api/memory/sys_variable_conf', api.category="memory")
    kvmemory.SetKvMemoryResp SetKvMemory(1: kvmemory.SetKvMemoryReq req)(api.post='/api/memory/variable/upsert', api.category="memory",agw.preserve_base="true")
    // ---




    document2.GetDocumentTableInfoResponse GetDocumentTableInfo(1:document2.GetDocumentTableInfoRequest req) (api.get='/api/memory/doc_table_info', api.category="memory", agw.preserve_base="true")
}
