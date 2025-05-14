package errorx

import (
	"fmt"
	"strings"

	"code.byted.org/flow/opencoze/backend/pkg/errorx/internal"
)

// StatusError is an interface for error with status code, you can
// create an error through New or WrapByCode and convert it back to
// StatusError through FromStatusError to obtain information such as
// error status code.
type StatusError interface {
	error
	Code() int32
	Msg() string
	Extra() map[string]string
}

// Option is used to configure an StatusError.
type Option = internal.Option

func KV(k, v string) Option {
	return internal.Param(k, v)
}

func KVf(k, v string, a ...any) Option {
	formatValue := fmt.Sprintf(v, a...)
	return internal.Param(k, formatValue)
}

// New get an error predefined in the configuration file by statusCode
// with a stack trace at the point New is called.
func New(code int32, options ...Option) error {
	return internal.NewByCode(code, options...)
}

// WrapByCode returns an error annotating err with a stack trace
// at the point WrapByCode is called, and the status code.
func WrapByCode(err error, statusCode int32, options ...Option) error {
	if err == nil {
		return nil
	}

	return internal.WrapByCode(err, statusCode, options...)
}

// Wrapf returns an error annotating err with a stack trace
// at the point Wrapf is called, and the format specifier.
func Wrapf(err error, format string, args ...interface{}) error {
	if err == nil {
		return nil
	}

	return internal.Wrapf(err, format, args...)
}

func ErrorWithoutStack(err error) string {
	if err == nil {
		return ""
	}
	errMsg := err.Error()
	index := strings.Index(errMsg, "stack=")
	if index != -1 {
		errMsg = errMsg[:index]
	}
	return errMsg
}
