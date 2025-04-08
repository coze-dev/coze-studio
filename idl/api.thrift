include "./prompt/prompt.thrift"
include "./agent/agent.thrift"

namespace go coze

service CozeService {
    prompt.UpsertPromptResourceResponse UpsertPromptResource(1:prompt.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource")

    agent.UpdateDraftBotInfoResponse UpdateDraftBotInfo(1:agent.UpdateDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot")
    agent.DraftBotCreateResponse DraftBotCreate(1:agent.DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
}