package code

import "context"

type Language string

const (
	Python     Language = "Python"
	JavaScript Language = "JavaScript"
)

type RunRequest struct {
	Code     string
	Params   map[string]any
	Language Language
}
type RunResponse struct {
	Result map[string]any
}

var RunnerImpl Runner

//go:generate mockgen -destination  ../../../../internal/mock/domain/workflow/crossdomain/code/code_mock.go  --package code  -source code.go
type Runner interface {
	Run(ctx context.Context, request *RunRequest) (*RunResponse, error)
}
