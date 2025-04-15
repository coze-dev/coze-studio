package milvus

import (
	"fmt"
	"strings"
	"sync"
)

type errSlice struct {
	mu     sync.Mutex
	errors []error
}

func (e *errSlice) Add(err error) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.errors = append(e.errors, err)
}

func (e *errSlice) Error() error {
	e.mu.Lock()
	defer e.mu.Unlock()
	if len(e.errors) == 0 {
		return nil
	}

	sb := strings.Builder{}
	for i := range e.errors {
		sb.WriteString(fmt.Sprintf("%d: %v\n", i, e.errors[i].Error()))
	}

	return fmt.Errorf("%v", sb.String())
}
