
include "./conversation/conversation.thrift"
namespace go conversation_service

service ConversationService {
    conversation.ClearConversationCtxResponse ClearConversationCtx(1: conversation.ClearConversationCtxRequest request)(api.post='/api/conversation/create_section', api.category="conversation", api.gen_path= "conversation")
    conversation.ClearConversationHistoryResponse ClearConversationHistory(1: conversation.ClearConversationHistoryRequest request)(api.post='/api/conversation/clear_message', api.category="conversation", api.gen_path= "conversation")
}