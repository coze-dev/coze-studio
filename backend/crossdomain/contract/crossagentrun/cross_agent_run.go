package crossagentrun

import (
	"context"
)

type AgentRun interface {
	Delete(ctx context.Context, runID []int64) error
}

var defaultSVC AgentRun

func DefaultSVC() AgentRun {
	return defaultSVC
}

func SetDefaultSVC(svc AgentRun) {
	defaultSVC = svc
}
