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

package tool

import (
	"context"
	"fmt"
)

var customToolMap = make(map[string]Invocation)

func RegisterCustomTool(toolID string, t Invocation) error {
	if _, ok := customToolMap[toolID]; ok {
		return fmt.Errorf("custom tool path %s already registered", toolID)
	}

	customToolMap[toolID] = t

	return nil
}

// InvokableRun(ctx context.Context, argumentsInJSON string, opts ...Option) (string, error)
type customCallImpl struct{}

func NewCustomCallImpl() Invocation {
	return &customCallImpl{}
}

func (c *customCallImpl) Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error) {
	if t, ok := customToolMap[fmt.Sprintf("%d", args.Tool.ID)]; ok {
		return t.Do(ctx, args)
	}

	return "", "", fmt.Errorf("custom tool not found")
}
