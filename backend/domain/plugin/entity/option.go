package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
)

type ExecuteOptions struct {
	AgentID                    int64
	SpaceID                    int64
	Version                    string
	AgentToolVersion           int64
	Operation                  *Openapi3Operation
	InvalidRespProcessStrategy consts.InvalidResponseProcessStrategy
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

func WithSpaceID(spaceID int64) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.SpaceID = spaceID
	}
}

func WithOpenapiOperation(op *Openapi3Operation) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.Operation = op
	}
}

func WithInvalidRespProcessStrategy(strategy consts.InvalidResponseProcessStrategy) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.InvalidRespProcessStrategy = strategy
	}
}
