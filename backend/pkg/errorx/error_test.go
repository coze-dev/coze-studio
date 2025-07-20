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
	"errors"
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/pkg/errorx/code"
)

var (
	ErrPermissionCode            = int32(1000000)
	errPermissionMessage         = "unauthorized access : {msg}"
	errPermissionAffectStability = false
)

func TestError(t *testing.T) {
	code.Register(
		ErrPermissionCode,
		errPermissionMessage,
		code.WithAffectStability(errPermissionAffectStability),
	)

	err := New(ErrPermissionCode, KV("msg", "test"))
	fmt.Println(err)
	fmt.Println(err.Error())
	fmt.Println(err)

	var customErr StatusError
	b := errors.As(err, &customErr)
	assert.Equal(t, b, true)
	assert.Equal(t, customErr.Code(), ErrPermissionCode)
	assert.Equal(t, customErr.Msg(), strings.Replace(errPermissionMessage, "{msg}", "test", 1))
}
