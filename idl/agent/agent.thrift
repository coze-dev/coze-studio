include "../playground/playground.thrift"
include "../developer/developer_api.thrift"

namespace go agent

service AgentService {
    playground.UpdateDraftBotInfoAgwResponse UpdateDraftBotInfoAgw(1:playground.UpdateDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/update_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
    developer_api.DraftBotCreateResponse DraftBotCreate(1:developer_api.DraftBotCreateRequest request)(api.post='/api/draftbot/create', api.category="draftbot", api.gen_path="draftbot")
    playground.GetDraftBotInfoAgwResponse GetDraftBotInfoAgw(1:playground.GetDraftBotInfoAgwRequest request)(api.post='/api/playground_api/draftbot/get_draft_bot_info', api.category="draftbot",agw.preserve_base="true")
}