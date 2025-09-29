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

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

const (
	keyOfSuggestPromptVariables = "suggest_prompt_variables"
	keyOfSuggestGraph           = "suggest_graph"
	keyOfSuggestPreInputParse   = "suggest_pre_input_parse"
	keyOfSuggestPersonParse     = "suggest_persona"
	keyOfSuggestChatModel       = "suggest_chat_model"
	keyOfSuggestParser          = "suggest_parser"
	keyOfSuggestTemplate        = "suggest_template"
)

func newSuggestGraph(_ context.Context, conf *Config, chatModel chatmodel.ToolCallingChatModel) (*compose.Graph[[]*schema.Message, *schema.Message], bool) {

	isNeedGenerateSuggest := false
	agentSuggestionSetting := conf.Agent.SuggestReply

	sp := &suggestPersonaRender{}
	if agentSuggestionSetting != nil && ptr.From(agentSuggestionSetting.SuggestReplyMode) != bot_common.SuggestReplyMode_Disable {
		isNeedGenerateSuggest = true
		if ptr.From(agentSuggestionSetting.SuggestReplyMode) == bot_common.SuggestReplyMode_Custom {
			sp.persona = ptr.From(agentSuggestionSetting.CustomizedSuggestPrompt)
		}
	}

	if !isNeedGenerateSuggest {
		return nil, isNeedGenerateSuggest
	}
	suggestPrompt := prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage(SUGGESTION_PROMPT_JINJA2),
		schema.UserMessage("Based on the contextual information, provide three recommended questions"),
	)

	suggestGraph := compose.NewGraph[[]*schema.Message, *schema.Message]()
	suggestPromptVars := &suggestPromptVariables{}
	_ = suggestGraph.AddLambdaNode(keyOfSuggestPromptVariables,
		compose.InvokableLambda[[]*schema.Message, map[string]any](suggestPromptVars.AssembleSuggestPromptVariables))

	_ = suggestGraph.AddLambdaNode(keyOfSuggestPersonParse,
		compose.InvokableLambda[[]*schema.Message, string](sp.RenderPersona),
		compose.WithOutputKey(keyOfSuggestPersonParse),
	)

	_ = suggestGraph.AddChatTemplateNode(keyOfSuggestTemplate, suggestPrompt)
	_ = suggestGraph.AddChatModelNode(keyOfSuggestChatModel, chatModel, compose.WithNodeName(keyOfSuggestChatModel))
	_ = suggestGraph.AddLambdaNode(keyOfSuggestParser, compose.InvokableLambda[*schema.Message, *schema.Message](suggestParser), compose.WithNodeName(keyOfSuggestParser))

	_ = suggestGraph.AddEdge(compose.START, keyOfSuggestPromptVariables)
	_ = suggestGraph.AddEdge(compose.START, keyOfSuggestPersonParse)
	_ = suggestGraph.AddEdge(keyOfSuggestPersonParse, keyOfSuggestTemplate)
	_ = suggestGraph.AddEdge(keyOfSuggestPromptVariables, keyOfSuggestTemplate)
	_ = suggestGraph.AddEdge(keyOfSuggestTemplate, keyOfSuggestChatModel)
	_ = suggestGraph.AddEdge(keyOfSuggestChatModel, keyOfSuggestParser)
	_ = suggestGraph.AddEdge(keyOfSuggestParser, compose.END)

	return suggestGraph, isNeedGenerateSuggest
}
