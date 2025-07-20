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

package internal

import (
	"errors"
	"fmt"
	"runtime"
	"strings"
)

type StackTracer interface {
	StackTrace() string
}

type withStack struct {
	cause error
	stack string
}

func (w *withStack) Unwrap() error {
	return w.cause
}

func (w *withStack) StackTrace() string {
	return w.stack
}

func (w *withStack) Error() string {
	return fmt.Sprintf("%s\nstack=%s", w.cause.Error(), w.stack)
}

func stack() string {
	const depth = 32
	var pcs [depth]uintptr
	n := runtime.Callers(2, pcs[:])

	b := strings.Builder{}
	for i := 0; i < n; i++ {
		fn := runtime.FuncForPC(pcs[i])

		file, line := fn.FileLine(pcs[i])
		name := trimPathPrefix(fn.Name())
		b.WriteString(fmt.Sprintf("%s:%d %s\n", file, line, name))
	}

	return b.String()
}

func trimPathPrefix(s string) string {
	i := strings.LastIndex(s, "/")
	s = s[i+1:]
	i = strings.Index(s, ".")
	return s[i+1:]
}

func withStackTraceIfNotExists(err error) error {
	if err == nil {
		return nil
	}

	// skip if stack has already exist
	var stackTracer StackTracer
	if errors.As(err, &stackTracer) {
		return err
	}

	return &withStack{
		err,
		stack(),
	}
}
