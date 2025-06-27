package internal

import (
	"errors"
	"fmt"
	"strings"
)

type StatusError interface {
	error
	Code() int32
}

type statusError struct {
	statusCode int32
	message    string

	ext Extension
}

type withStatus struct {
	status *statusError

	stack string
	cause error
}

type Extension struct {
	IsAffectStability bool
	Extra             map[string]string
}

func (w *statusError) Code() int32 {
	return w.statusCode
}

func (w *statusError) IsAffectStability() bool {
	return w.ext.IsAffectStability
}

func (w *statusError) Msg() string {
	return w.message
}

func (w *statusError) Error() string {
	return fmt.Sprintf("code=%d message=%s", w.statusCode, w.message)
}

func (w *statusError) Extra() map[string]string {
	return w.ext.Extra
}

// Unwrap supports go errors.Unwrap().
func (w *withStatus) Unwrap() error {
	return w.cause
}

// Is supports go errors.Is().
func (w *withStatus) Is(target error) bool {
	var ws StatusError
	if errors.As(target, &ws) && w.status.Code() == ws.Code() {
		return true
	}
	return false
}

// As supports go errors.As().
func (w *withStatus) As(target interface{}) bool {
	if errors.As(w.status, target) {
		return true
	}

	return false
}

func (w *withStatus) StackTrace() string {
	return w.stack
}

func (w *withStatus) Error() string {
	b := strings.Builder{}
	b.WriteString(w.status.Error())

	if w.cause != nil {
		b.WriteString("\n")
		b.WriteString(fmt.Sprintf("cause=%s", w.cause))
	}

	if w.stack != "" {
		b.WriteString("\n")
		b.WriteString(fmt.Sprintf("stack=%s", w.stack))
	}

	return b.String()
}

type Option func(ws *withStatus)

func Param(k, v string) Option {
	return func(ws *withStatus) {
		if ws == nil || ws.status == nil {
			return
		}
		ws.status.message = strings.Replace(ws.status.message, fmt.Sprintf("{%s}", k), v, -1)
	}
}

func Extra(k, v string) Option {
	return func(ws *withStatus) {
		if ws == nil || ws.status == nil {
			return
		}
		if ws.status.ext.Extra == nil {
			ws.status.ext.Extra = make(map[string]string)
		}
		ws.status.ext.Extra[k] = v
	}
}

func NewByCode(code int32, options ...Option) error {
	ws := &withStatus{
		status: getStatusByCode(code),
		cause:  nil,
		stack:  stack(),
	}

	for _, opt := range options {
		opt(ws)
	}

	return ws
}

func WrapByCode(err error, code int32, options ...Option) error {
	if err == nil {
		return nil
	}

	ws := &withStatus{
		status: getStatusByCode(code),
		cause:  err,
	}

	for _, opt := range options {
		opt(ws)
	}

	// skip if stack has already exist
	var stackTracer StackTracer
	if errors.As(err, &stackTracer) {
		return ws
	}

	ws.stack = stack()

	return ws
}

func getStatusByCode(code int32) *statusError {
	codeDefinition, ok := CodeDefinitions[code]
	if ok {
		// predefined err code
		return &statusError{
			statusCode: code,
			message:    codeDefinition.Message,
			ext: Extension{
				IsAffectStability: codeDefinition.IsAffectStability,
			},
		}
	}

	return &statusError{
		statusCode: code,
		message:    DefaultErrorMsg,
		ext: Extension{
			IsAffectStability: DefaultIsAffectStability,
		},
	}
}
