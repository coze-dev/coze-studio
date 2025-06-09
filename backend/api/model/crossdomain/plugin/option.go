package plugin

type ExecuteToolOption struct {
	ProjectInfo *ProjectInfo

	ToolVersion                string
	Operation                  *Openapi3Operation
	InvalidRespProcessStrategy InvalidResponseProcessStrategy
}

type ExecuteToolOpt func(o *ExecuteToolOption)

type ProjectInfo struct {
	ProjectID      int64
	ProjectVersion *string
	ProjectType    ProjectType

	ConnectorID int64
	UserID      int64
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
