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

package intentdetector

import (
	"context"
	"errors"
	"fmt"
	"maps"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/spf13/cast"

	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type Config struct {
	Intents            []string
	SystemPrompt       string
	IsFastMode         bool
	LLMParams          *vo.LLMParams
	ChatHistorySetting *vo.ChatHistorySetting
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema2.NodeSchema, error) {
	ns := &schema2.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeIntentDetector,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	param := n.Data.Inputs.LLMParam
	if param == nil {
		return nil, fmt.Errorf("intent detector node's llmParam is nil")
	}

	if n.Data.Inputs.ChatHistorySetting != nil {
		c.ChatHistorySetting = n.Data.Inputs.ChatHistorySetting
	}

	llmParam, ok := param.(vo.IntentDetectorLLMParam)
	if !ok {
		return nil, fmt.Errorf("llm node's llmParam must be LLMParam, got %v", llmParam)
	}

	paramBytes, err := sonic.Marshal(param)
	if err != nil {
		return nil, err
	}
	var intentDetectorConfig = &vo.IntentDetectorLLMConfig{}

	err = sonic.Unmarshal(paramBytes, &intentDetectorConfig)
	if err != nil {
		return nil, err
	}

	modelLLMParams := &vo.LLMParams{}
	modelLLMParams.ModelType = int64(intentDetectorConfig.ModelType)
	modelLLMParams.ModelName = intentDetectorConfig.ModelName
	modelLLMParams.TopP = intentDetectorConfig.TopP
	modelLLMParams.Temperature = intentDetectorConfig.Temperature
	modelLLMParams.MaxTokens = intentDetectorConfig.MaxTokens
	modelLLMParams.ResponseFormat = vo.ResponseFormat(intentDetectorConfig.ResponseFormat)
	modelLLMParams.SystemPrompt = intentDetectorConfig.SystemPrompt.Value.Content.(string)

	c.LLMParams = modelLLMParams
	c.SystemPrompt = modelLLMParams.SystemPrompt

	var intents = make([]string, 0, len(n.Data.Inputs.Intents))
	for _, it := range n.Data.Inputs.Intents {
		intents = append(intents, it.Name)
	}
	c.Intents = intents

	if n.Data.Inputs.Mode == "top_speed" {
		c.IsFastMode = true
	}

	if err = convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (c *Config) Build(ctx context.Context, _ *schema2.NodeSchema, _ ...schema2.BuildOption) (any, error) {
	if !c.IsFastMode && c.LLMParams == nil {
		return nil, errors.New("config chat model is required")
	}

	if len(c.Intents) == 0 {
		return nil, errors.New("config intents is required")
	}

	m, _, err := modelbuilder.BuildModelByID(ctx, c.LLMParams.ModelType, c.LLMParams.ToModelBuilderLLMParams())
	if err != nil {
		return nil, err
	}

	chain := compose.NewChain[map[string]any, *schema.Message]()

	spt := ternary.IFElse[string](c.IsFastMode, FastModeSystemIntentPrompt, SystemIntentPrompt)

	intents, err := toIntentString(c.Intents)
	if err != nil {
		return nil, err
	}

	sptTemplate, err := nodes.TemplateRender(spt, map[string]interface{}{
		"intents": intents,
	})
	if err != nil {
		return nil, err
	}
	prompts := prompt.FromMessages(schema.Jinja2,
		&schema.Message{Content: sptTemplate, Role: schema.System},
		&schema.Message{Content: "{{query}}", Role: schema.User})

	r, err := chain.AppendChatTemplate(newHistoryChatTemplate(prompts, c.ChatHistorySetting)).AppendChatModel(m).Compile(ctx)
	if err != nil {
		return nil, err
	}

	return &IntentDetector{
		isFastMode:         c.IsFastMode,
		systemPrompt:       c.SystemPrompt,
		runner:             r,
		ChatHistorySetting: c.ChatHistorySetting,
	}, nil
}

func (c *Config) BuildBranch(_ context.Context) (
	func(ctx context.Context, nodeOutput map[string]any) (int64, bool, error), bool) {
	return func(ctx context.Context, nodeOutput map[string]any) (int64, bool, error) {
		classificationId, ok := nodeOutput[classificationID]
		if !ok {
			return -1, false, fmt.Errorf("failed to take classification id from input map: %v", nodeOutput)
		}

		cID64, ok := classificationId.(int64)
		if !ok {
			return -1, false, fmt.Errorf("classificationID not of type int64, actual type: %T", classificationId)
		}

		if cID64 == 0 {
			return -1, true, nil
		}

		return cID64 - 1, false, nil
	}, true
}

func (c *Config) ExpectPorts(ctx context.Context, n *vo.Node) []string {
	expects := make([]string, len(n.Data.Inputs.Intents)+1)
	expects[0] = schema2.PortDefault
	for i := 0; i < len(n.Data.Inputs.Intents); i++ {
		expects[i+1] = fmt.Sprintf(schema2.PortBranchFormat, i)
	}
	return expects
}

func (c *Config) ChatHistoryEnabled() bool {
	return c.ChatHistorySetting != nil && c.ChatHistorySetting.EnableChatHistory
}

func (c *Config) ChatHistoryRounds() int64 {
	if c.ChatHistorySetting == nil {
		return 0
	}
	return c.ChatHistorySetting.ChatHistoryRound
}

type contextKey string

const chatHistoryKey contextKey = "chatHistory"

const SystemIntentPrompt = `
# Role
You are an intention classification expert, good at being able to judge which classification the user's input belongs to.

## Skills
Skill 1: Clearly determine which of the following intention classifications the user's input belongs to.
Intention classification list:
[
{"classificationId": 0, "content": "Other intentions"},
{{intents}}
]

Note:
- Please determine the match only between the user's input content and the Intention classification list content, without judging or categorizing the match with the classification ID.

{{advance}}

## Reply requirements
- The answer must be returned in JSON format.
- Strictly ensure that the output is in a valid JSON format.
- Do not add prefix "json or suffix""
- The answer needs to include the following fields such as:
{
"classificationId": 0,
"reason": "Unclear intentions"
}

##Limit
- Please do not reply in text.
`

const FastModeSystemIntentPrompt = `
# Role
You are an intention classification expert, good at  being able to judge which classification the user's input belongs to.

## Skills
Skill 1: Clearly determine which of the following intention classifications the user's input belongs to.
Intention classification list:
[
{"classificationId": 0, "content": "Other intentions"},
{{intents}}
]

Note:
- Please determine the match only between the user's input content and the Intention classification list content, without judging or categorizing the match with the classification ID.


## Reply requirements
- The answer must be a number indicated classificationId.
- if not match, please just output an number 0.
- do not output json format data, just output an number.

##Limit
- Please do not reply in text.`

const classificationID = "classificationId"

type IntentDetector struct {
	isFastMode         bool
	systemPrompt       string
	runner             compose.Runnable[map[string]any, *schema.Message]
	ChatHistorySetting *vo.ChatHistorySetting
}

func (id *IntentDetector) parseToNodeOut(content string) (map[string]any, error) {
	if content == "" {
		return nil, errors.New("intent detector's LLM output content is empty")
	}

	if id.isFastMode {
		cid, err := strconv.ParseInt(content, 10, 64)
		if err != nil {
			return nil, err
		}
		return map[string]any{
			classificationID: cid,
		}, nil
	}

	leftIndex := strings.Index(content, "{")
	rightIndex := strings.Index(content, "}")
	if leftIndex == -1 || rightIndex == -1 {
		return nil, fmt.Errorf("intent detector's LLM output content is invalid: %s", content)
	}

	var nodeOutput map[string]any
	err := sonic.UnmarshalString(content[leftIndex:rightIndex+1], &nodeOutput)
	if err != nil {
		return nil, err
	}

	return nodeOutput, nil
}

func (id *IntentDetector) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	query, ok := input["query"]
	if !ok {
		return nil, errors.New("input query field required")
	}

	queryStr, ok := query.(string)
	if !ok {
		queryStr = cast.ToString(query)
	}

	vars := make(map[string]any)
	vars["query"] = queryStr
	if !id.isFastMode {
		ad, err := nodes.TemplateRender(id.systemPrompt, map[string]any{"query": query})
		if err != nil {
			return nil, err
		}
		vars["advance"] = ad
	}
	o, err := id.runner.Invoke(ctx, vars)
	if err != nil {
		return nil, err
	}

	return id.parseToNodeOut(o.Content)
}

func toIntentString(its []string) (string, error) {
	type IntentVariableItem struct {
		ClassificationID int64  `json:"classificationId"`
		Content          string `json:"content"`
	}

	vs := make([]*IntentVariableItem, 0, len(its))

	for idx, it := range its {
		vs = append(vs, &IntentVariableItem{
			ClassificationID: int64(idx + 1),
			Content:          it,
		})
	}

	return sonic.MarshalString(vs)
}

func (id *IntentDetector) ToCallbackInput(ctx context.Context, in map[string]any) (
	*nodes.StructuredCallbackInput, error) {
	if id.ChatHistorySetting == nil || !id.ChatHistorySetting.EnableChatHistory {
		return &nodes.StructuredCallbackInput{Input: in}, nil
	}

	var messages []*crossmessage.WfMessage
	var scMessages []*schema.Message
	var sectionID *int64
	execCtx := execute.GetExeCtx(ctx)
	if execCtx != nil {
		messages = execCtx.ExeCfg.ConversationHistory
		scMessages = execCtx.ExeCfg.ConversationHistorySchemaMessages
		sectionID = execCtx.ExeCfg.SectionID
	}

	ret := map[string]any{
		"chatHistory": []any{},
	}
	maps.Copy(ret, in)

	if len(messages) == 0 {
		return &nodes.StructuredCallbackInput{Input: ret}, nil
	}
	if sectionID != nil && messages[0].SectionID != *sectionID {
		return &nodes.StructuredCallbackInput{Input: ret}, nil
	}

	maxRounds := int(id.ChatHistorySetting.ChatHistoryRound)
	if execCtx != nil && execCtx.ExeCfg.MaxHistoryRounds != nil {
		maxRounds = min(int(*execCtx.ExeCfg.MaxHistoryRounds), maxRounds)
	}

	count := 0
	startIdx := 0
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == schema.User {
			count++
		}
		if count >= maxRounds {
			startIdx = i
			break
		}
	}

	var historyMessages []any
	for _, msg := range messages[startIdx:] {
		content, err := nodes.ConvertMessageToString(ctx, msg)
		if err != nil {
			logs.CtxWarnf(ctx, "failed to convert message to string: %v", err)
			continue
		}
		historyMessages = append(historyMessages, map[string]any{
			"role":    string(msg.Role),
			"content": content,
		})
	}

	ctxcache.Store(ctx, chatHistoryKey, scMessages[startIdx:])

	ret["chatHistory"] = historyMessages
	return &nodes.StructuredCallbackInput{Input: ret}, nil
}
