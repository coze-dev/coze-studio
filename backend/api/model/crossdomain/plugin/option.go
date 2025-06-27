package plugin

type ExecuteToolOption struct {
	ProjectInfo *ProjectInfo

	AutoGenRespSchema bool

	ToolVersion                string
	Operation                  *Openapi3Operation
	InvalidRespProcessStrategy InvalidResponseProcessStrategy
}

type ExecuteToolOpt func(o *ExecuteToolOption)

type ProjectInfo struct {
	ProjectID      int64       // agentID or appID
	ProjectVersion *string     // if version si nil, use latest version
	ProjectType    ProjectType // agent or app

	ConnectorID int64
}

func WithProjectInfo(info *ProjectInfo) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.ProjectInfo = info
	}
}

func WithToolVersion(version string) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.ToolVersion = version
	}
}

func WithOpenapiOperation(op *Openapi3Operation) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.Operation = op
	}
}

func WithInvalidRespProcessStrategy(strategy InvalidResponseProcessStrategy) ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.InvalidRespProcessStrategy = strategy
	}
}

func WithAutoGenRespSchema() ExecuteToolOpt {
	return func(o *ExecuteToolOption) {
		o.AutoGenRespSchema = true
	}
}
