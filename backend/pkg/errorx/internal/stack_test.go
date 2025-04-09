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
