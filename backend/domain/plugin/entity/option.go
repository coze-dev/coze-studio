package entity

type ExecuteOptions struct {
	AgentID          int64
	UserID           int64
	Version          string
	AgentToolVersion int64
}

type ExecuteToolOpts func(o *ExecuteOptions)

func WithAgentID(agentID int64) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.AgentID = agentID
	}
}

func WithVersion(version string) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.Version = version
	}
}

func WithAgentToolVersion(version int64) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.AgentToolVersion = version
	}
}

func WithUserID(userID int64) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.UserID = userID
	}
}
