
include "./conversation.thrift"
namespace go conversation.conversation

service ConversationService {
    conversation.ClearConversationCtxResponse ClearConversationCtx(1: conversation.ClearConversationCtxRequest request)(api.post='/api/conversation/create_section', api.category="conversation", api.gen_path= "conversation")
    conversation.ClearConversationHistoryResponse ClearConversationHistory(1: conversation.ClearConversationHistoryRequest request)(api.post='/api/conversation/clear_message', api.category="conversation", api.gen_path= "conversation")
    conversation.CreateConversationResponse CreateConversation(1: conversation.CreateConversationRequest request)(api.post='/v1/conversation/create', api.category="conversation", api.gen_path= "conversation")
    
    conversation.ClearConversationApiResponse ClearConversationApi(1: conversation.ClearConversationApiRequest req)(api.post='/v1/conversations/:conversation_id/clear', api.category="conversation", api.tag="openapi", agw.preserve_base="true")

    conversation.ListConversationsApiResponse ListConversationsApi(1: conversation.ListConversationsApiRequest request) (api.get = '/v1/conversations', api.category = "conversation", api.tag="openapi", agw.preserve_base = "true")
    conversation.UpdateConversationApiResponse UpdateConversationApi(1: conversation.UpdateConversationApiRequest request) (api.put = '/v1/conversations/:conversation_id', api.category = "conversation", api.tag="openapi", agw.preserve_base = "true")
    conversation.DeleteConversationApiResponse DeleteConversationApi(1: conversation.DeleteConversationApiRequest req)(api.delete='/v1/conversations/:conversation_id', api.category="conversation", api.tag="openapi", agw.preserve_base="true")
    conversation.RetrieveConversationApiResponse RetrieveConversationApi(1: conversation.RetrieveConversationApiRequest request) (api.get = '/v1/conversation/retrieve', api.category = "conversation", api.tag="openapi", agw.preserve_base = "true") //查询会话详情
}
