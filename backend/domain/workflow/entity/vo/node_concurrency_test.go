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

package vo

import (
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestChangeErrLevelIsSafeForConcurrency verifies that ChangeErrLevel does
// not mutate shared state on package-level error singletons. The previous
// implementation wrote to StatusError.Extra()["level"] in place, which
// caused "fatal error: concurrent map writes" when multiple goroutines
// concurrently handled timeouts/cancellations.
func TestChangeErrLevelIsSafeForConcurrency(t *testing.T) {
	const goroutines = 100

	var wg sync.WaitGroup
	wg.Add(goroutines)

	for i := 0; i < goroutines; i++ {
		go func() {
			defer wg.Done()
			// Call ChangeErrLevel on the global singletons concurrently.
			// The fix ensures this no longer writes to a shared map.
			e1 := NodeTimeoutErr.ChangeErrLevel(LevelWarn)
			e2 := CancelErr.ChangeErrLevel(LevelWarn)
			e3 := WorkflowTimeoutErr.ChangeErrLevel(LevelWarn)

			assert.Equal(t, LevelWarn, e1.Level())
			assert.Equal(t, LevelWarn, e2.Level())
			assert.Equal(t, LevelWarn, e3.Level())
		}()
	}

	wg.Wait()
}

// TestChangeErrLevelDoesNotMutateSingleton verifies that calling
// ChangeErrLevel on a global singleton does not change the singleton's
// level — a copy is returned instead.
func TestChangeErrLevelDoesNotMutateSingleton(t *testing.T) {
	assert.Equal(t, LevelCancel, CancelErr.Level())
	assert.Equal(t, LevelError, NodeTimeoutErr.Level())
	assert.Equal(t, LevelError, WorkflowTimeoutErr.Level())

	// Change the level on copies.
	_ = CancelErr.ChangeErrLevel(LevelWarn)
	_ = NodeTimeoutErr.ChangeErrLevel(LevelWarn)
	_ = WorkflowTimeoutErr.ChangeErrLevel(LevelWarn)

	// The singletons must remain unchanged.
	assert.Equal(t, LevelCancel, CancelErr.Level())
	assert.Equal(t, LevelError, NodeTimeoutErr.Level())
	assert.Equal(t, LevelError, WorkflowTimeoutErr.Level())
}
