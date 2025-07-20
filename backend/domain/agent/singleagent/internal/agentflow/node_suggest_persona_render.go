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
)

type suggestPersonaRender struct {
	persona string
}

func (p *suggestPersonaRender) RenderPersona(ctx context.Context, _ []*schema.Message) (persona string, err error) {

	if p.persona == "" {
		return "", nil
	}

	msgs, err := prompt.FromMessages(schema.Jinja2, schema.UserMessage(p.persona)).Format(ctx, nil)
	if err != nil {
		return "", fmt.Errorf("render persona failed, err=%w", err)
	}

	return msgs[0].Content, nil
}
