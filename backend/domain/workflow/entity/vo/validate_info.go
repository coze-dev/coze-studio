package vo

type ValidateTreeConfig struct {
	CanvasSchema string
	AppID        *int64
	AgentID      *int64
}

type ValidateIssue struct {
	WorkflowName  string
	WorkflowID    int64
	IssueMessages []string
}
