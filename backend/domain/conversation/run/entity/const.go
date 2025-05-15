package entity

const ConversationTurnsDefault = 100

type RunStatus string

const (
	RunStatusCreated        RunStatus = "created"
	RunStatusInProgress     RunStatus = "in_progress"
	RunStatusCompleted      RunStatus = "completed"
	RunStatusFailed         RunStatus = "failed"
	RunStatusExpired        RunStatus = "expired"
	RunStatusCancelled      RunStatus = "cancelled"
	RunStatusRequiredAction RunStatus = "required_action"
	RunStatusDeleted        RunStatus = "deleted"
)

type RunEvent string

const (
	RunEventCreated        RunEvent = "conversation.run.created"
	RunEventInProgress     RunEvent = "conversation.run.in_progress"
	RunEventCompleted      RunEvent = "conversation.run.completed"
	RunEventFailed         RunEvent = "conversation.run.failed"
	RunEventExpired        RunEvent = "conversation.run.expired"
	RunEventCancelled      RunEvent = "conversation.run.cancelled"
	RunEventRequiredAction RunEvent = "conversation.run.required_action"

	RunEventMessageDelta     RunEvent = "conversation.message.delta"
	RunEventMessageCompleted RunEvent = "conversation.message.completed"

	RunEventAck                 = "conversation.ack"
	RunEventError      RunEvent = "conversation.error"
	RunEventStreamDone RunEvent = "conversation.stream.done"
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
	ContentTypeMix    ContentType = "mix"
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
	RoleTypeTool      RoleType = "tool"
)

type MessageType string

const (
	MessageTypeAck          MessageType = "ack"
	MessageTypeQuestion     MessageType = "question"
	MessageTypeFunctionCall MessageType = "function_call"
	MessageTypeToolResponse MessageType = "tool_response"
	MessageTypeKnowledge    MessageType = "knowledge"
	MessageTypeAnswer       MessageType = "answer"
	MessageTypeFlowUp       MessageType = "follow_up"
	MessageTypeVerbose      MessageType = "verbose"
)
