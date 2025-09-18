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
	"errors"
)

type mcpCallImpl struct{}

func NewMcpCallImpl() Invocation {
	return &mcpCallImpl{}
}

func (m *mcpCallImpl) Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error) {
	// only for tool debug scene
	return "", "", errors.New("mcp call not implemented")
}
