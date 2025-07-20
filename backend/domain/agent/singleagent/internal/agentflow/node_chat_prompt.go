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
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
)

var (
	chatPrompt = prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage(REACT_SYSTEM_PROMPT_JINJA2),
		schema.MessagesPlaceholder(placeholderOfChatHistory, true),
		schema.MessagesPlaceholder(placeholderOfUserInput, false),
	)
)
