package model

type DraftAgentToolIdentity struct {
	AgentID int64
	UserID  int64
	ToolID  int64
}

type VersionTool struct {
	ToolID  int64
	Version *string
}

type VersionAgentTool struct {
	AgentID   int64
	ToolID    int64
	VersionMs *int64
}
