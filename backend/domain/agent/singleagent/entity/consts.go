package entity

type AgentType int64

type AgentState string

const (
	AgentStateOfDraft     AgentState = "draft"
	AgentStateOfPublished AgentState = "published"
)
