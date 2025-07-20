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

package agentflow

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type suggestPromptVariables struct {
}

func (p *suggestPromptVariables) AssembleSuggestPromptVariables(ctx context.Context, vb []*schema.Message) (variables map[string]any, err error) {
	variables = make(map[string]any)

	for _, item := range vb {
		if item.Role == schema.Assistant {
			variables[placeholderOfChaAnswer] = item.Content
		}
		if item.Role == schema.User {
			variables[placeholderOfChaInput] = item.Content
		}
	}
	return variables, nil
}
