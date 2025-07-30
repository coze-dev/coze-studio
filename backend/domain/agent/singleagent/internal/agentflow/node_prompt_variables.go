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
	"fmt"
	"time"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
)

const (
	placeholderOfUserInput   = "_user_input"
	placeholderOfChatHistory = "_chat_history"
)

type promptVariables struct {
	Agent *entity.SingleAgent
	avs   map[string]string
}

func (p *promptVariables) AssemblePromptVariables(ctx context.Context, req *AgentRequest) (variables map[string]any, err error) {
	variables = make(map[string]any)

	variables[placeholderOfTime] = time.Now().Format("Monday 2006/01/02 15:04:05 -07")
	variables[placeholderOfAgentName] = p.Agent.Name

	if req.Input != nil {
		variables[placeholderOfUserInput] = []*schema.Message{req.Input}
	}

	// Handling conversation history
	if len(req.History) > 0 {
		// Add chat history to variable
		variables[placeholderOfChatHistory] = req.History
	}

	if p.avs != nil {
		var memoryVariablesList []string
		for k, v := range p.avs {
			variables[k] = v
			memoryVariablesList = append(memoryVariablesList, fmt.Sprintf("%s: %s\n", k, v))
		}
		variables[placeholderOfVariables] = memoryVariablesList
	}

	return variables, nil
}
