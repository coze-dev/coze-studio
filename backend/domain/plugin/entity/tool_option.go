package entity

type executeOptions struct {
	AgentID int64
	Version string
}

type ExecuteOpts func(o *executeOptions)

func WithAgentID(agentID int64) ExecuteOpts {
	return func(o *executeOptions) {
		o.AgentID = agentID
	}
}

func WithVersion(version string) ExecuteOpts {
	return func(o *executeOptions) {
		o.Version = version
	}
}
