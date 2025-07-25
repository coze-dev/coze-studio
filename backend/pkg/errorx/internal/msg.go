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
	"fmt"
)

type withMessage struct {
	cause error
	msg   string
}

func (w *withMessage) Unwrap() error {
	return w.cause
}

func (w *withMessage) Error() string {
	return fmt.Sprintf("%s\ncause=%s", w.msg, w.cause.Error())
}

func wrapf(err error, format string, args ...interface{}) error {
	if err == nil {
		return nil
	}
	err = &withMessage{
		cause: err,
		msg:   fmt.Sprintf(format, args...),
	}

	return err
}

func Wrapf(err error, format string, args ...interface{}) error {
	return withStackTraceIfNotExists(wrapf(err, format, args...))
}
