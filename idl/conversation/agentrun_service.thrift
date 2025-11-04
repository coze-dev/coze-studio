
include "./run.thrift"
namespace go conversation.agentrun

service AgentRunService {
    run.AgentRunResponse AgentRun(1: run.AgentRunRequest request)(api.post='/api/conversation/chat', api.category="conversation", api.gen_path= "agent_run")
    run.ChatV3Response ChatV3(1: run.ChatV3Request request)(api.post = "/v3/chat", api.category="chat", api.tag="openapi", api.gen_path="chat")
    run.CancelChatApiResponse CancelChatApi(1: run.CancelChatApiRequest request) (api.post = '/v3/chat/cancel', api.category = "chat", api.tag="openapi", agw.preserve_base = "true")
    run.RetrieveChatOpenResponse RetrieveChatOpen(1: run.RetrieveChatOpenRequest request) (api.get = "/v3/chat/retrieve", api.tag="openapi", agw.preserve_base = "true")
}