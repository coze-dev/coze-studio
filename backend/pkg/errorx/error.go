/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package errorx

import (
	"fmt"
	"strings"

	"github.com/coze-dev/coze-studio/backend/pkg/errorx/internal"
)

// StatusError is an interface for error with status code, you can
// create an error through New or WrapByCode and convert it back to
// StatusError through FromStatusError to obtain information such as
// error status code.
type StatusError interface {
	error
	Code() int32
	Msg() string
	IsAffectStability() bool
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

func Extra(k, v string) Option {
	return internal.Extra(k, v)
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
