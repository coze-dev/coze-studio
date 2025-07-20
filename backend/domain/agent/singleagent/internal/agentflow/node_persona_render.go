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

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/maps"
)

type personaRender struct {
	persona              string
	personaVariableNames []string
	// variables            crossdomain.Variables
	variables map[string]string
}

func (p *personaRender) RenderPersona(ctx context.Context, req *AgentRequest) (persona string, err error) {
	variables := make(map[string]string, len(p.personaVariableNames))

	for _, name := range p.personaVariableNames {
		// First try to get from req.Variables
		if val, ok := req.Variables[name]; ok {
			variables[name] = val
			continue
		}
		// Fall back to personaRender.variables
		if val, ok := p.variables[name]; ok {
			variables[name] = val
			continue
		}
		variables[name] = ""
	}

	msgs, err := prompt.FromMessages(schema.Jinja2, schema.UserMessage(p.persona)).Format(ctx, maps.ToAnyValue(variables))
	if err != nil {
		return "", fmt.Errorf("render persona failed, err=%w", err)
	}

	return msgs[0].Content, nil
}
