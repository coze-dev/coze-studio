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
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWithStack(t *testing.T) {
	err := withStackTraceIfNotExists(errors.New("test error"))
	output1 := fmt.Sprintf("%+v", err)
	assert.Contains(t, output1, "stack_test.go")
	assert.Contains(t, output1, "withStackTraceIfNotExists")
	t.Log(output1)
}

func TestPrintStack(t *testing.T) {
	t.Run("New with stack", func(t *testing.T) {
		err := NewByCode(1)
		output1 := fmt.Sprintf("%v", err)
		assert.Contains(t, output1, "stack_test.go")
		assert.Contains(t, output1, "TestPrintStack")
		t.Log(output1)
	})

	t.Run("New with stack and wrap with fmt.Errorf", func(t *testing.T) {
		err := NewByCode(1)
		err1 := fmt.Errorf("err=%w", err)
		output1 := fmt.Sprintf("%v", err1)
		assert.Contains(t, output1, "stack_test.go")
		assert.Contains(t, output1, "TestPrintStack")
		t.Log(output1)
	})

	t.Run("wrapf with stack", func(t *testing.T) {
		err := errors.New("original error")
		err1 := Wrapf(err, "wrapped error")
		output1 := fmt.Sprintf("%v", err1)
		assert.Contains(t, output1, "stack_test.go")
		assert.Contains(t, output1, "TestPrintStack")
		t.Log(output1)
	})

	t.Run("skip wrap with stack if stack has already exist", func(t *testing.T) {
		err := NewByCode(1)
		err1 := fmt.Errorf("err1=%w", err)
		err2 := withStackTraceIfNotExists(err1)
		_, ok := err2.(StackTracer)
		assert.False(t, ok)
		output1 := fmt.Sprintf("%v", err2)
		assert.Contains(t, output1, "stack_test.go")
		assert.Contains(t, output1, "TestPrintStack")
		t.Log(output1)
	})
}
