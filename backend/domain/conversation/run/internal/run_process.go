package internal

import (
	"context"
)

type RunProcess struct {
	ctx   context.Context
	event *Event
}

func NewRunProcess(ctx context.Context, event *Event) *RunProcess {
	return &RunProcess{
		ctx:   ctx,
		event: event,
	}
}

func (r *RunProcess) StepToCreate() {
	//todo:: implement
}
func (r *RunProcess) StepToInProgress() {
	//todo:: implement
}

func (r *RunProcess) StepToComplete() {
	//todo:: implement
}
func (r *RunProcess) StepToFailed() {
	//todo:: implement
}
