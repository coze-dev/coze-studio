package entity

type EventType int64

const (
	EventType_LocalPlugin         EventType = 1
	EventType_Question            EventType = 2
	EventType_RequireInfos        EventType = 3
	EventType_SceneChat           EventType = 4
	EventType_InputNode           EventType = 5
	EventType_WorkflowLocalPlugin EventType = 6
	EventType_OauthPlugin         EventType = 7
	EventType_WorkflowLLM         EventType = 100
)
