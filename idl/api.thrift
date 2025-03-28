include "./prompt/prompt.thrift"

namespace go coze

service CozeService {
    prompt.UpsertPromptResourceResponse UpsertPromptResource(1:prompt.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource",agw.preserve_base="true")
}