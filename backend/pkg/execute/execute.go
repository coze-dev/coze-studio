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

package execute

import (
	"context"
	"fmt"
	"runtime/debug"
)

func RunWithContextDone(ctx context.Context, fn func() error) error {
	errChan := make(chan error, 1)
	go func() {
		defer func() {
			if err := recover(); err != nil {
				errChan <- fmt.Errorf("exec func panic, %v \n %s", err, debug.Stack())
			}
			close(errChan)
		}()
		err := fn()
		errChan <- err
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errChan:
		return err
	}
}
