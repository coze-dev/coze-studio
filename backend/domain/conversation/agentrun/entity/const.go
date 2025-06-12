package entity

const ConversationTurnsDefault int32 = 100

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

type RoleType string

const (
	RoleTypeSystem    RoleType = "system"
	RoleTypeUser      RoleType = "user"
	RoleTypeAssistant RoleType = "assistant"
	RoleTypeTool      RoleType = "tool"
)

type MessageSubType string

const (
	MessageSubTypeKnowledgeCall  MessageSubType = "knowledge_recall"
	MessageSubTypeGenerateFinish MessageSubType = "generate_answer_finish"
	MessageSubTypeInterrupt      MessageSubType = "interrupt"
)
