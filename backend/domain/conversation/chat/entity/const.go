package entity

const ConversationTurnsDefault = 100

type ChatStatus string

const (
	ChatStatusCreated        ChatStatus = "created"
	ChatStatusInProgress     ChatStatus = "in_progress"
	ChatStatusCompleted      ChatStatus = "completed"
	ChatStatusFailed         ChatStatus = "failed"
	ChatStatusExpired        ChatStatus = "expired"
	ChatStatusCancelled      ChatStatus = "cancelled"
	ChatStatusRequiredAction ChatStatus = "required_action"
)

type ChatEvent string

const (
	ChatEventCreated        ChatEvent = "conversation.chat.created"
	ChatEventInProgress     ChatEvent = "conversation.chat.in_progress"
	ChatEventCompleted      ChatEvent = "conversation.chat.completed"
	ChatEventFailed         ChatEvent = "conversation.chat.failed"
	ChatEventExpired        ChatEvent = "conversation.chat.expired"
	ChatEventCancelled      ChatEvent = "conversation.chat.cancelled"
	ChatEventRequiredAction ChatEvent = "conversation.chat.required_action"

	ChatEventMessageDelta     ChatEvent = "conversation.message.delta"
	ChatEventMessageCompleted ChatEvent = "conversation.message.completed"

	ChatEventError      ChatEvent = "conversation.error"
	ChatEventStreamDone ChatEvent = "conversation.stream.done"
)

type ContentType string

const (
	ContentTypeText   ContentType = "text"
	ContentTypeImage  ContentType = "image"
	ContentTypeVideo  ContentType = "video"
	ContentTypeMusic  ContentType = "music"
	ContentTypeCard   ContentType = "card"
	ContentTypeWidget ContentType = "widget"
	ContentTypeAPP    ContentType = "app"
)

type ReplyType int64

const (
	ReplyTypeAnswer      ReplyType = 1
	ReplyTypeSuggest     ReplyType = 2
	ReplyTypeLLMOutput   ReplyType = 3
	ReplyTypeToolOutput  ReplyType = 4
	ReplyTypeVerbose     ReplyType = 100
	ReplyTypePlaceHolder ReplyType = 101
)

type MetaType int64

const (
	MetaTypeKnowledgeCard MetaType = 4
)

type InputType string

const (
	InputTypeText  InputType = "text"
	InputTypeFile  InputType = "file"
	InputTypeImage InputType = "image"
)

type RoleType string

const (
	RoleTypeSystem    RoleType = "system"
	RoleTypeUser      RoleType = "user"
	RoleTypeAssistant RoleType = "assistant"
)

type MessageType string

const (
	MessageTypeQuery        MessageType = "query"
	MessageTypeFunctionCall MessageType = "function_call"
	MessageTypeToolResponse MessageType = "tool_response"
	MessageTypeKnowledge    MessageType = "knowledge"
	MessageTypeAnswer       MessageType = "answer"
	MessageTypeFlowUp       MessageType = "follow_up"
	MessageTypeVerbose      MessageType = "verbose"
)
