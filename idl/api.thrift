include "./prompt/prompt.thrift"
include "./playground/playground.thrift"

namespace go coze

service CozeService {
    prompt.UpsertPromptResourceResponse UpsertPromptResource(1:prompt.UpsertPromptResourceRequest request)(api.post='/api/playground_api/upsert_prompt_resource', api.category="prompt_resource")

    playground.UpdateDraftBotInfoResponse UpdateDraftBotInfo(1:playground.UpdateDraftBotInfoRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot")

}