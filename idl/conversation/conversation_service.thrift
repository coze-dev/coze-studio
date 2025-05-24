
include "./conversation.thrift"
namespace go conversation.conversation

service ConversationService {
    conversation.ClearConversationCtxResponse ClearConversationCtx(1: conversation.ClearConversationCtxRequest request)(api.post='/api/conversation/create_section', api.category="conversation", api.gen_path= "conversation")
    conversation.ClearConversationHistoryResponse ClearConversationHistory(1: conversation.ClearConversationHistoryRequest request)(api.post='/api/conversation/clear_message', api.category="conversation", api.gen_path= "conversation")
    conversation.CreateConversationResponse CreateConversation(1: conversation.CreateConversationRequest request)(api.post='/v1/conversation/create', api.category="conversation", api.gen_path= "conversation")
    
    conversation.ClearConversationApiResponse ClearConversationApi(1: conversation.ClearConversationApiRequest req)(api.post='/v1/conversations/:conversation_id/clear', api.category="conversation", api.tag="openapi", agw.preserve_base="true")

    conversation.ListConversationsApiResponse ListConversationsApi(1: conversation.ListConversationsApiRequest request) (api.get = '/v1/conversations', api.category = "conversation", api.tag="openapi", agw.preserve_base = "true")

}