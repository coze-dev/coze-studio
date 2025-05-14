package entity

import (
	"github.com/getkin/kin-openapi/openapi3"
)

type ExecuteOptions struct {
	AgentID          int64
	SpaceID          int64
	Version          string
	AgentToolVersion int64
	Operation        *openapi3.Operation
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

func WithOpenapiOperation(op *openapi3.Operation) ExecuteToolOpts {
	return func(o *ExecuteOptions) {
		o.Operation = op
	}
}
