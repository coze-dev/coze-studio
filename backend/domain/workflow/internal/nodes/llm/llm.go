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

package llm

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"
	callbacks2 "github.com/cloudwego/eino/utils/callbacks"
	"golang.org/x/exp/maps"

	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge"
	knowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	wrapPlugin "github.com/coze-dev/coze-studio/backend/domain/workflow/plugin"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type contextKey string

const chatHistoryKey contextKey = "chatHistory"

type Format int

const (
	FormatText Format = iota
	FormatMarkdown
	FormatJSON
)

const (
	jsonPromptFormat = `
Strictly reply in valid JSON format.
- Ensure the output strictly conforms to the JSON schema below
- Do not include explanations, comments, or any text outside the JSON.

Here is the output JSON schema:
'''
%s
'''
`
	markdownPrompt = `
Strictly reply in valid Markdown format.
- For headings, use number signs (#).
- For list items, start with dashes (-).
- To emphasize text, wrap it with asterisks (*).
- For code or commands, surround them with backticks (` + "`" + `).
- For quoted text, use greater than signs (>).
- For links, wrap the text in square brackets [], followed by the URL in parentheses ().
- For images, use square brackets [] for the alt text, followed by the image URL in parentheses ().

`
)

const (
	ReasoningOutputKey = "reasoning_content"
)

const knowledgeUserPromptTemplate = `根据引用的内容回答问题:
 1.如果引用的内容里面包含 <img src=""> 的标签, 标签里的 src 字段表示图片地址, 需要在回答问题的时候展示出去, 输出格式为"![图片名称](图片地址)" 。
 2.如果引用的内容不包含 <img src=""> 的标签, 你回答问题时不需要展示图片 。
例如：
  如果内容为<img src="https://example.com/image.jpg">一只小猫，你的输出应为：![一只小猫](https://example.com/image.jpg)。
  如果内容为<img src="https://example.com/image1.jpg">一只小猫 和 <img src="https://example.com/image2.jpg">一只小狗 和 <img src="https://example.com/image3.jpg">一只小牛，你的输出应为：![一只小猫](https://example.com/image1.jpg) 和 ![一只小狗](https://example.com/image2.jpg) 和 ![一只小牛](https://example.com/image3.jpg)
you can refer to the following content and do relevant searches to improve:
---
%s

question is:

`

const knowledgeIntentPrompt = `
# 角色:
你是一个知识库意图识别AI Agent。
## 目标:
- 按照「系统提示词」、用户需求、最新的聊天记录选择应该使用的知识库。
## 工作流程:
1. 分析「系统提示词」以确定用户的具体需求。
2. 如果「系统提示词」明确指明了要使用的知识库，则直接返回这些知识库，只输出它们的knowledge_id，不需要再判断用户的输入
3. 检查每个知识库的knowledge_name和knowledge_description，以了解它们各自的功能。
4. 根据用户需求，选择最符合的知识库。
5. 如果找到一个或多个合适的知识库，输出它们的knowledge_id。如果没有合适的知识库，输出0。
## 约束:
- 严格按照「系统提示词」和用户的需求选择知识库。「系统提示词」的优先级大于用户的需求
- 如果有多个合适的知识库，将它们的knowledge_id用英文逗号连接后输出。
- 输出必须仅为knowledge_id或0，不得包括任何其他内容或解释，不要在id后面输出知识库名称。

## 输出示例
123,456

## 输出格式:
输出应该是一个纯数字或者由英文逗号连接的数字序列，具体取决于选择的知识库数量。不应包含任何其他文本或格式。
## 知识库列表如下
%s
## 「系统提示词」如下
%s
`

const (
	knowledgeTemplateKey           = "knowledge_template"
	knowledgeChatModelKey          = "knowledge_chat_model"
	knowledgeLambdaKey             = "knowledge_lambda"
	knowledgeUserPromptTemplateKey = "knowledge_user_prompt_prefix"
	templateNodeKey                = "template"
	llmNodeKey                     = "llm"
	reactGraphName                 = "workflow_llm_react_agent"
	outputConvertNodeKey           = "output_convert"
)

type NoReCallReplyMode int64

const (
	NoReCallReplyModeOfDefault   NoReCallReplyMode = 0
	NoReCallReplyModeOfCustomize NoReCallReplyMode = 1
)

type RetrievalStrategy struct {
	RetrievalStrategy            *knowledge.RetrievalStrategy
	NoReCallReplyMode            NoReCallReplyMode
	NoReCallReplyCustomizePrompt string
}

type KnowledgeRecallConfig struct {
	ChatModel                modelbuilder.BaseChatModel
	RetrievalStrategy        *RetrievalStrategy
	SelectedKnowledgeDetails []*knowledge.KnowledgeDetail
}

type Config struct {
	SystemPrompt                      string
	UserPrompt                        string
	OutputFormat                      Format
	LLMParams                         *vo.LLMParams
	FCParam                           *vo.FCParam
	BackupLLMParams                   *vo.LLMParams
	ChatHistorySetting                *vo.ChatHistorySetting
	AssociateStartNodeUserInputFields map[string]struct{}
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema2.NodeSchema, error) {
	ns := &schema2.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeLLM,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	param := n.Data.Inputs.LLMParam
	if param == nil {
		return nil, fmt.Errorf("llm node's llmParam is nil")
	}

	bs, _ := sonic.Marshal(param)
	llmParam := make(vo.LLMParam, 0)
	if err := sonic.Unmarshal(bs, &llmParam); err != nil {
		return nil, err
	}
	convertedLLMParam, err := llmParamsToLLMParam(llmParam)
	if err != nil {
		return nil, err
	}

	c.LLMParams = convertedLLMParam
	c.SystemPrompt = convertedLLMParam.SystemPrompt
	c.UserPrompt = convertedLLMParam.Prompt

	if convertedLLMParam.EnableChatHistory {
		c.ChatHistorySetting = &vo.ChatHistorySetting{
			EnableChatHistory: true,
			ChatHistoryRound:  convertedLLMParam.ChatHistoryRound,
		}
	}

	var resFormat Format
	switch convertedLLMParam.ResponseFormat {
	case vo.ResponseFormatText:
		resFormat = FormatText
	case vo.ResponseFormatMarkdown:
		resFormat = FormatMarkdown
	case vo.ResponseFormatJSON:
		resFormat = FormatJSON
	default:
		return nil, fmt.Errorf("unsupported response format: %d", convertedLLMParam.ResponseFormat)
	}

	c.OutputFormat = resFormat

	if err = convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if resFormat == FormatJSON {
		if len(ns.OutputTypes) == 1 {
			for _, v := range ns.OutputTypes {
				if v.Type == vo.DataTypeString {
					resFormat = FormatText
					break
				}
			}
		} else if len(ns.OutputTypes) == 2 {
			if _, ok := ns.OutputTypes[ReasoningOutputKey]; ok {
				for k, v := range ns.OutputTypes {
					if k != ReasoningOutputKey && v.Type == vo.DataTypeString {
						resFormat = FormatText
						break
					}
				}
			}
		}
	}

	if resFormat == FormatJSON {
		ns.StreamConfigs = &schema2.StreamConfig{
			CanGeneratesStream: false,
		}
	} else {
		ns.StreamConfigs = &schema2.StreamConfig{
			CanGeneratesStream: true,
		}
	}

	if n.Data.Inputs.LLM != nil && n.Data.Inputs.FCParam != nil {
		c.FCParam = n.Data.Inputs.FCParam
	}

	if se := n.Data.Inputs.SettingOnError; se != nil {
		if se.Ext != nil && len(se.Ext.BackupLLMParam) > 0 {
			var backupLLMParam vo.SimpleLLMParam
			if err = sonic.UnmarshalString(se.Ext.BackupLLMParam, &backupLLMParam); err != nil {
				return nil, err
			}

			backupModel, err := simpleLLMParamsToLLMParams(backupLLMParam)
			if err != nil {
				return nil, err
			}
			c.BackupLLMParams = backupModel
		}
	}

	c.AssociateStartNodeUserInputFields = make(map[string]struct{})
	for _, info := range ns.InputSources {
		if len(info.Path) == 1 && info.Source.Ref != nil && info.Source.Ref.FromNodeKey == entity.EntryNodeKey {
			if compose.FromFieldPath(info.Source.Ref.FromPath).Equals(compose.FromField(vo.UserInputKey)) {
				c.AssociateStartNodeUserInputFields[info.Path[0]] = struct{}{}
			}
		}
	}

	return ns, nil
}

func llmParamsToLLMParam(params vo.LLMParam) (*vo.LLMParams, error) {
	p := &vo.LLMParams{}
	for _, param := range params {
		switch param.Name {
		case "temperature":
			strVal := param.Input.Value.Content.(string)
			floatVal, err := strconv.ParseFloat(strVal, 64)
			if err != nil {
				return nil, err
			}
			p.Temperature = &floatVal
		case "maxTokens":
			strVal := param.Input.Value.Content.(string)
			intVal, err := strconv.Atoi(strVal)
			if err != nil {
				return nil, err
			}
			p.MaxTokens = intVal
		case "responseFormat":
			strVal := param.Input.Value.Content.(string)
			int64Val, err := strconv.ParseInt(strVal, 10, 64)
			if err != nil {
				return nil, err
			}
			p.ResponseFormat = vo.ResponseFormat(int64Val)
		case "modleName":
			strVal := param.Input.Value.Content.(string)
			p.ModelName = strVal
		case "modelType":
			strVal := param.Input.Value.Content.(string)
			int64Val, err := strconv.ParseInt(strVal, 10, 64)
			if err != nil {
				return nil, err
			}
			p.ModelType = int64Val
		case "prompt":
			strVal := param.Input.Value.Content.(string)
			p.Prompt = strVal
		case "enableChatHistory":
			boolVar := param.Input.Value.Content.(bool)
			p.EnableChatHistory = boolVar
		case "systemPrompt":
			strVal := param.Input.Value.Content.(string)
			p.SystemPrompt = strVal
		case "chatHistoryRound":
			strVal := param.Input.Value.Content.(string)
			int64Val, err := strconv.ParseInt(strVal, 10, 64)
			if err != nil {
				return nil, err
			}
			p.ChatHistoryRound = int64Val
		case "generationDiversity", "frequencyPenalty", "presencePenalty":
		// do nothing
		case "topP":
			strVal := param.Input.Value.Content.(string)
			floatVar, err := strconv.ParseFloat(strVal, 64)
			if err != nil {
				return nil, err
			}
			p.TopP = &floatVar
		default:
			logs.Warnf("encountered unknown param when converting LLM Params, name= %s, "+
				"value= %v", param.Name, param.Input.Value.Content)
		}
	}

	return p, nil
}

func simpleLLMParamsToLLMParams(params vo.SimpleLLMParam) (*vo.LLMParams, error) {
	p := &vo.LLMParams{}
	p.ModelName = params.ModelName
	p.ModelType = params.ModelType
	p.Temperature = &params.Temperature
	p.MaxTokens = params.MaxTokens
	p.TopP = &params.TopP
	p.ResponseFormat = params.ResponseFormat
	p.SystemPrompt = params.SystemPrompt
	return p, nil
}

func getReasoningContent(message *schema.Message) string {
	return message.ReasoningContent
}

func (c *Config) Build(ctx context.Context, ns *schema2.NodeSchema, _ ...schema2.BuildOption) (any, error) {
	var (
		err                   error
		chatModel, fallbackM  modelbuilder.BaseChatModel
		info, fallbackI       *modelmgr.Model
		modelWithInfo         ModelWithInfo
		tools                 []tool.BaseTool
		toolsReturnDirectly   map[string]bool
		knowledgeRecallConfig *KnowledgeRecallConfig
	)

	chatModel, info, err = modelbuilder.BuildModelByID(ctx, c.LLMParams.ModelType, c.LLMParams.ToModelBuilderLLMParams())
	if err != nil {
		return nil, err
	}

	exceptionConf := ns.ExceptionConfigs
	if exceptionConf != nil && exceptionConf.MaxRetry > 0 {
		backupModelParams := c.BackupLLMParams
		if backupModelParams != nil {
			fallbackM, fallbackI, err = modelbuilder.BuildModelByID(ctx, backupModelParams.ModelType, backupModelParams.ToModelBuilderLLMParams())
			if err != nil {
				return nil, err
			}
		}
	}

	if fallbackM == nil {
		modelWithInfo = NewModel(chatModel, info)
	} else {
		modelWithInfo = NewModelWithFallback(chatModel, fallbackM, info, fallbackI)
	}

	fcParams := c.FCParam
	if fcParams != nil {
		if fcParams.WorkflowFCParam != nil {
			for _, wf := range fcParams.WorkflowFCParam.WorkflowList {
				wfIDStr := wf.WorkflowID
				wfID, err := strconv.ParseInt(wfIDStr, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid workflow id: %s", wfIDStr)
				}

				workflowToolConfig := vo.WorkflowToolConfig{}
				if wf.FCSetting != nil {
					workflowToolConfig.InputParametersConfig = wf.FCSetting.RequestParameters
					workflowToolConfig.OutputParametersConfig = wf.FCSetting.ResponseParameters
				}

				locator := workflowModel.FromDraft
				if wf.WorkflowVersion != "" {
					locator = workflowModel.FromSpecificVersion
				}

				wfTool, err := workflow.GetRepository().WorkflowAsTool(ctx, vo.GetPolicy{
					ID:      wfID,
					QType:   locator,
					Version: wf.WorkflowVersion,
				}, workflowToolConfig)
				if err != nil {
					return nil, err
				}
				tools = append(tools, wfTool)
				if wfTool.TerminatePlan() == vo.UseAnswerContent {
					if toolsReturnDirectly == nil {
						toolsReturnDirectly = make(map[string]bool)
					}
					toolInfo, err := wfTool.Info(ctx)
					if err != nil {
						return nil, err
					}
					toolsReturnDirectly[toolInfo.Name] = true
				}
			}
		}

		if fcParams.PluginFCParam != nil {
			pluginToolsInvokableReq := make(map[int64]*wrapPlugin.ToolsInvokableRequest)
			for _, p := range fcParams.PluginFCParam.PluginList {
				pid, err := strconv.ParseInt(p.PluginID, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid plugin id: %s", p.PluginID)
				}
				toolID, err := strconv.ParseInt(p.ApiId, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid plugin id: %s", p.PluginID)
				}

				var (
					requestParameters  []*workflow3.APIParameter
					responseParameters []*workflow3.APIParameter
				)
				if p.FCSetting != nil {
					requestParameters = p.FCSetting.RequestParameters
					responseParameters = p.FCSetting.ResponseParameters
				}

				if req, ok := pluginToolsInvokableReq[pid]; ok {
					req.ToolsInvokableInfo[toolID] = &wrapPlugin.ToolsInvokableInfo{
						ToolID:                      toolID,
						RequestAPIParametersConfig:  requestParameters,
						ResponseAPIParametersConfig: responseParameters,
					}
				} else {
					pluginToolsInfoRequest := &wrapPlugin.ToolsInvokableRequest{
						PluginEntity: vo.PluginEntity{
							PluginID:      pid,
							PluginVersion: ptr.Of(p.PluginVersion),
							PluginFrom:    p.PluginFrom,
						},
						ToolsInvokableInfo: map[int64]*wrapPlugin.ToolsInvokableInfo{
							toolID: {
								ToolID:                      toolID,
								RequestAPIParametersConfig:  requestParameters,
								ResponseAPIParametersConfig: responseParameters,
							},
						},
						IsDraft: p.IsDraft,
					}
					pluginToolsInvokableReq[pid] = pluginToolsInfoRequest
				}
			}
			inInvokableTools := make([]tool.BaseTool, 0, len(fcParams.PluginFCParam.PluginList))
			for _, req := range pluginToolsInvokableReq {
				toolMap, err := wrapPlugin.GetPluginInvokableTools(ctx, req)
				if err != nil {
					return nil, err
				}
				for _, t := range toolMap {
					inInvokableTools = append(inInvokableTools, newInvokableTool(t))
				}
			}
			if len(inInvokableTools) > 0 {
				tools = append(tools, inInvokableTools...)
			}
		}

		if fcParams.KnowledgeFCParam != nil && len(fcParams.KnowledgeFCParam.KnowledgeList) > 0 {
			kwChatModel := workflow.GetRepository().GetKnowledgeRecallChatModel()
			if kwChatModel == nil {
				return nil, fmt.Errorf("workflow builtin chat model for knowledge recall not configured")
			}

			setting := fcParams.KnowledgeFCParam.GlobalSetting
			knowledgeRecallConfig = &KnowledgeRecallConfig{
				ChatModel: kwChatModel,
			}
			searchType, err := toRetrievalSearchType(setting.SearchMode)
			if err != nil {
				return nil, err
			}
			knowledgeRecallConfig.RetrievalStrategy = &RetrievalStrategy{
				RetrievalStrategy: &knowledge.RetrievalStrategy{
					TopK:               ptr.Of(setting.TopK),
					MinScore:           ptr.Of(setting.MinScore),
					SearchType:         searchType,
					EnableNL2SQL:       setting.UseNL2SQL,
					EnableQueryRewrite: setting.UseRewrite,
					EnableRerank:       setting.UseRerank,
				},
				NoReCallReplyMode:            NoReCallReplyMode(setting.NoRecallReplyMode),
				NoReCallReplyCustomizePrompt: setting.NoRecallReplyCustomizePrompt,
			}

			knowledgeIDs := make([]int64, 0, len(fcParams.KnowledgeFCParam.KnowledgeList))
			for _, kw := range fcParams.KnowledgeFCParam.KnowledgeList {
				kid, err := strconv.ParseInt(kw.ID, 10, 64)
				if err != nil {
					return nil, err
				}
				knowledgeIDs = append(knowledgeIDs, kid)
			}

			detailResp, err := crossknowledge.DefaultSVC().ListKnowledgeDetail(ctx,
				&knowledge.ListKnowledgeDetailRequest{
					KnowledgeIDs: knowledgeIDs,
				})
			if err != nil {
				return nil, err
			}
			knowledgeRecallConfig.SelectedKnowledgeDetails = detailResp.KnowledgeDetails
		}
	}

	g := compose.NewGraph[map[string]any, map[string]any](
		compose.WithGenLocalState(func(ctx context.Context) (state llmState) {
			return llmState{}
		}))

	var hasReasoning bool

	format := c.OutputFormat
	if format == FormatJSON {
		if len(ns.OutputTypes) == 1 {
			for _, v := range ns.OutputTypes {
				if v.Type == vo.DataTypeString {
					format = FormatText
					break
				}
			}
		} else if len(ns.OutputTypes) == 2 {
			if _, ok := ns.OutputTypes[ReasoningOutputKey]; ok {
				for k, v := range ns.OutputTypes {
					if k != ReasoningOutputKey && v.Type == vo.DataTypeString {
						format = FormatText
						break
					}
				}
			}
		}
	}

	userPrompt := c.UserPrompt
	switch format {
	case FormatJSON:
		jsonSchema, err := vo.TypeInfoToJSONSchema(ns.OutputTypes, nil)
		if err != nil {
			return nil, err
		}

		jsonPrompt := fmt.Sprintf(jsonPromptFormat, jsonSchema)
		userPrompt = userPrompt + jsonPrompt
	case FormatMarkdown:
		userPrompt = userPrompt + markdownPrompt
	case FormatText:
	}

	if knowledgeRecallConfig != nil {
		err := injectKnowledgeTool(ctx, g, c.UserPrompt, knowledgeRecallConfig)
		if err != nil {
			return nil, err
		}
		userPrompt = fmt.Sprintf("{{%s}}%s", knowledgeUserPromptTemplateKey, userPrompt)

		inputs := maps.Clone(ns.InputTypes)
		inputs[knowledgeUserPromptTemplateKey] = &vo.TypeInfo{
			Type: vo.DataTypeString,
		}
		sp := newPromptTpl(schema.System, c.SystemPrompt, inputs)
		up := newPromptTpl(schema.User, userPrompt, inputs, withReservedKeys([]string{knowledgeUserPromptTemplateKey}), withAssociateUserInputFields(c.AssociateStartNodeUserInputFields))
		template := newPrompts(sp, up, modelWithInfo)
		templateWithChatHistory := newPromptsWithChatHistory(template, c.ChatHistorySetting, modelWithInfo)

		_ = g.AddChatTemplateNode(templateNodeKey, templateWithChatHistory,
			compose.WithStatePreHandler(func(ctx context.Context, in map[string]any, state llmState) (map[string]any, error) {
				for k, v := range state {
					in[k] = v
				}
				return in, nil
			}))
		_ = g.AddEdge(knowledgeLambdaKey, templateNodeKey)

	} else {
		sp := newPromptTpl(schema.System, c.SystemPrompt, ns.InputTypes)
		up := newPromptTpl(schema.User, userPrompt, ns.InputTypes, withAssociateUserInputFields(c.AssociateStartNodeUserInputFields))
		template := newPrompts(sp, up, modelWithInfo)
		templateWithChatHistory := newPromptsWithChatHistory(template, c.ChatHistorySetting, modelWithInfo)

		_ = g.AddChatTemplateNode(templateNodeKey, templateWithChatHistory)

		_ = g.AddEdge(compose.START, templateNodeKey)
	}

	if len(tools) > 0 {
		m, ok := modelWithInfo.(model.ToolCallingChatModel)
		if !ok {
			return nil, errors.New("requires a ToolCallingChatModel to use with tools")
		}
		reactConfig := react.AgentConfig{
			ToolCallingModel: m,
			ToolsConfig:      compose.ToolsNodeConfig{Tools: tools},
			ModelNodeName:    agentModelName,
			GraphName:        reactGraphName,
		}

		if len(toolsReturnDirectly) > 0 {
			reactConfig.ToolReturnDirectly = make(map[string]struct{}, len(toolsReturnDirectly))
			for k := range toolsReturnDirectly {
				reactConfig.ToolReturnDirectly[k] = struct{}{}
			}
		}

		reactAgent, err := react.NewAgent(ctx, &reactConfig)
		if err != nil {
			return nil, err
		}

		agentNode, opts := reactAgent.ExportGraph()
		opts = append(opts, compose.WithNodeName(reactGraphName))
		_ = g.AddGraphNode(llmNodeKey, agentNode, opts...)
	} else {
		_ = g.AddChatModelNode(llmNodeKey, modelWithInfo)
	}

	_ = g.AddEdge(templateNodeKey, llmNodeKey)

	var outputKey string
	if format == FormatJSON {
		iConvert := func(ctx context.Context, msg *schema.Message) (map[string]any, error) {
			return jsonParse(ctx, msg.Content, ns.OutputTypes)
		}

		convertNode := compose.InvokableLambda(iConvert)

		_ = g.AddLambdaNode(outputConvertNodeKey, convertNode)
	} else {
		if len(ns.OutputTypes) != 1 && len(ns.OutputTypes) != 2 {
			panic("impossible")
		}

		for k, v := range ns.OutputTypes {
			if v.Type != vo.DataTypeString {
				panic("impossible")
			}

			if k == ReasoningOutputKey {
				hasReasoning = true
			} else {
				outputKey = k
			}
		}

		iConvert := func(_ context.Context, msg *schema.Message, _ ...struct{}) (map[string]any, error) {
			out := map[string]any{outputKey: msg.Content}
			if hasReasoning {
				out[ReasoningOutputKey] = getReasoningContent(msg)
			}
			return out, nil
		}

		tConvert := func(_ context.Context, s *schema.StreamReader[*schema.Message], _ ...struct{}) (*schema.StreamReader[map[string]any], error) {
			sr, sw := schema.Pipe[map[string]any](0)

			safego.Go(ctx, func() {
				reasoningDone := false
				for {
					msg, err := s.Recv()
					if err != nil {
						if err == io.EOF {
							sw.Send(map[string]any{
								outputKey: nodes.KeyIsFinished,
							}, nil)
							sw.Close()
							return
						}

						sw.Send(nil, err)
						sw.Close()
						return
					}

					if hasReasoning {
						reasoning := getReasoningContent(msg)
						if len(reasoning) > 0 {
							sw.Send(map[string]any{ReasoningOutputKey: reasoning}, nil)
						}
					}

					if len(msg.Content) > 0 {
						if !reasoningDone && hasReasoning {
							reasoningDone = true
							sw.Send(map[string]any{
								ReasoningOutputKey: nodes.KeyIsFinished,
							}, nil)
						}
						sw.Send(map[string]any{outputKey: msg.Content}, nil)
					}
				}
			})

			return sr, nil
		}

		convertNode, err := compose.AnyLambda(iConvert, nil, nil, tConvert)
		if err != nil {
			return nil, err
		}

		_ = g.AddLambdaNode(outputConvertNodeKey, convertNode)
	}

	_ = g.AddEdge(llmNodeKey, outputConvertNodeKey)
	_ = g.AddEdge(outputConvertNodeKey, compose.END)

	requireCheckpoint := c.RequireCheckpoint()

	var compileOpts []compose.GraphCompileOption
	if requireCheckpoint {
		compileOpts = append(compileOpts, compose.WithCheckPointStore(workflow.GetRepository()))
	}
	compileOpts = append(compileOpts, compose.WithGraphName("workflow_llm_node_graph"))

	r, err := g.Compile(ctx, compileOpts...)
	if err != nil {
		return nil, err
	}

	llm := &LLM{
		r:                  r,
		outputFormat:       format,
		requireCheckpoint:  requireCheckpoint,
		fullSources:        ns.FullSources,
		chatHistorySetting: c.ChatHistorySetting,
		nodeKey:            ns.Key,
		outputKey:          outputKey,
	}

	return llm, nil
}

func (c *Config) RequireCheckpoint() bool {
	if c.FCParam != nil {
		if c.FCParam.WorkflowFCParam != nil {
			if len(c.FCParam.WorkflowFCParam.WorkflowList) > 0 {
				return true
			}
		}

		if c.FCParam.PluginFCParam != nil {
			if len(c.FCParam.PluginFCParam.PluginList) > 0 {
				return true
			}
		}
	}

	return false
}

func (c *Config) FieldStreamType(path compose.FieldPath, ns *schema2.NodeSchema,
	sc *schema2.WorkflowSchema) (schema2.FieldStreamType, error) {
	if !sc.RequireStreaming() {
		return schema2.FieldNotStream, nil
	}

	if len(path) != 1 {
		return schema2.FieldNotStream, nil
	}

	outputs := ns.OutputTypes
	if len(outputs) != 1 && len(outputs) != 2 {
		return schema2.FieldNotStream, nil
	}

	var outputKey string
	for key, output := range outputs {
		if output.Type != vo.DataTypeString {
			return schema2.FieldNotStream, nil
		}

		if key != ReasoningOutputKey {
			if len(outputKey) > 0 {
				return schema2.FieldNotStream, nil
			}
			outputKey = key
		}
	}

	field := path[0]
	if field == ReasoningOutputKey || field == outputKey {
		return schema2.FieldIsStream, nil
	}

	return schema2.FieldNotStream, nil
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

func toRetrievalSearchType(s int64) (knowledge.SearchType, error) {
	switch s {
	case 0:
		return knowledge.SearchTypeSemantic, nil
	case 1:
		return knowledge.SearchTypeHybrid, nil
	case 20:
		return knowledge.SearchTypeFullText, nil
	default:
		return 0, fmt.Errorf("invalid retrieval search type %v", s)
	}
}

type LLM struct {
	r                  compose.Runnable[map[string]any, map[string]any]
	outputFormat       Format
	requireCheckpoint  bool
	fullSources        map[string]*schema2.SourceInfo
	chatHistorySetting *vo.ChatHistorySetting
	nodeKey            vo.NodeKey
	outputKey          string
}

const (
	rawOutputKey = "llm_raw_output_%s"
	warningKey   = "llm_warning_%s"
)

func jsonParse(ctx context.Context, data string, schema_ map[string]*vo.TypeInfo) (map[string]any, error) {
	data = nodes.ExtractJSONString(data)

	var result map[string]any

	err := sonic.UnmarshalString(data, &result)
	if err != nil {
		c := execute.GetExeCtx(ctx)
		if c != nil {
			logs.CtxErrorf(ctx, "failed to parse json: %v, data: %s", err, data)
			rawOutputK := fmt.Sprintf(rawOutputKey, c.NodeCtx.NodeKey)
			warningK := fmt.Sprintf(warningKey, c.NodeCtx.NodeKey)
			ctxcache.Store(ctx, rawOutputK, data)
			ctxcache.Store(ctx, warningK, vo.WrapWarn(errno.ErrLLMStructuredOutputParseFail, err))
			return map[string]any{}, nil
		}

		return nil, err
	}

	r, ws, err := nodes.ConvertInputs(ctx, result, schema_)
	if err != nil {
		return nil, vo.WrapError(errno.ErrLLMStructuredOutputParseFail, err)
	}

	if ws != nil {
		logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
	}

	return r, nil
}

type llmOptions struct {
	toolWorkflowContainer *execute.StreamContainer
}

func WithToolWorkflowStreamContainer(container *execute.StreamContainer) nodes.NodeOption {
	return nodes.WrapImplSpecificOptFn(func(o *llmOptions) {
		o.toolWorkflowContainer = container
	})
}

type llmState = map[string]any

const agentModelName = "agent_model"

func (l *LLM) prepare(ctx context.Context, _ map[string]any, opts ...nodes.NodeOption) (
	composeOpts []compose.Option, resumingEvent *entity.InterruptEvent, err error) {
	c := execute.GetExeCtx(ctx)
	if c != nil {
		resumingEvent = c.NodeCtx.ResumingEvent
	}

	if c != nil && c.RootCtx.ResumeEvent != nil {
		// check if we are not resuming, but previously interrupted. Interrupt immediately.
		if resumingEvent == nil {
			var previouslyInterrupted bool
			err = compose.ProcessState(ctx, func(ctx context.Context, state nodes.IntermediateResultStore) error {
				previousToolES := state.GetIntermediateResult(c.NodeKey)
				previouslyInterrupted = len(previousToolES) > 0
				return nil
			})
			if err != nil {
				return
			}

			if previouslyInterrupted {
				err = compose.InterruptAndRerun
				return
			}
		}
	}

	if l.requireCheckpoint && c != nil {
		checkpointID := fmt.Sprintf("%d_%s", c.RootCtx.RootExecuteID, c.NodeCtx.NodeKey)
		composeOpts = append(composeOpts, compose.WithCheckPointID(checkpointID))
	}

	options := nodes.GetCommonOptions(&nodes.NodeOptions{}, opts...)

	composeOpts = append(composeOpts, options.GetOptsForNested()...)

	if resumingEvent != nil {
		var (
			resumeData string
			allIEs     map[string]int64
		)

		_ = compose.ProcessState(ctx, func(_ context.Context, state nodes.IntermediateResultStore) error {
			existingIEs := state.GetIntermediateResult(l.nodeKey)
			allIEs = make(map[string]int64, len(existingIEs))
			for toolCallID, exeID := range existingIEs {
				allIEs[toolCallID] = exeID.(int64)
			}
			delete(existingIEs, resumingEvent.ToolInterruptEvent.ToolCallID)
			state.SetIntermediateResult(l.nodeKey, existingIEs)
			return nil
		})
		_ = compose.ProcessState(ctx, func(ctx context.Context, state nodes.InterruptEventStore) error {
			resumeData, _ = state.GetAndClearResumeData(c.NodeKey)
			return nil
		})

		composeOpts = append(composeOpts, compose.WithToolsNodeOption(
			compose.WithToolOption(
				execute.WithResume(&entity.ResumeRequest{
					ExecuteID:  resumingEvent.ToolInterruptEvent.ExecuteID,
					EventID:    resumingEvent.ToolInterruptEvent.ID,
					ResumeData: resumeData,
				}, allIEs))))

		chatModelHandler := callbacks2.NewHandlerHelper().ChatModel(&callbacks2.ModelCallbackHandler{
			OnStart: func(ctx context.Context, runInfo *callbacks.RunInfo, input *model.CallbackInput) context.Context {
				if runInfo.Name != agentModelName {
					return ctx
				}

				// react agent loops back to chat model after resuming,
				// pop the previous interrupt event immediately
				ie, deleted, e := workflow.GetRepository().PopFirstInterruptEvent(ctx, c.RootExecuteID)
				if e != nil {
					logs.CtxErrorf(ctx, "failed to pop first interrupt event on react agent chatmodel start: %v", err)
					return ctx
				}

				if !deleted {
					logs.CtxErrorf(ctx, "failed to pop first interrupt event on react agent chatmodel start: not deleted")
					return ctx
				}

				if ie.ID != resumingEvent.ID {
					logs.CtxErrorf(ctx, "failed to pop first interrupt event on react agent chatmodel start, "+
						"deleted ID: %d, resumingEvent ID: %d", ie.ID, resumingEvent.ID)
					return ctx
				}

				c.RootCtx.ResumeEvent.Popped = true

				return ctx
			},
		}).Handler()

		composeOpts = append(composeOpts, compose.WithCallbacks(chatModelHandler))
	}

	if c != nil {
		exeCfg := c.ExeCfg
		composeOpts = append(composeOpts, compose.WithToolsNodeOption(compose.WithToolOption(execute.WithExecuteConfig(exeCfg))))
	}

	llmOpts := nodes.GetImplSpecificOptions(&llmOptions{}, opts...)
	if container := llmOpts.toolWorkflowContainer; container != nil {
		composeOpts = append(composeOpts, compose.WithToolsNodeOption(compose.WithToolOption(
			execute.WithParentStreamContainer(container))))
	}

	var resolvedSources map[string]*schema2.SourceInfo
	err = compose.ProcessState(ctx, func(_ context.Context, state nodes.DynamicStreamContainer) error {
		resolvedSources = state.GetFullSources(l.nodeKey)
		return nil
	})
	if err != nil {
		return nil, nil, err
	}

	var nodeKey vo.NodeKey
	if c != nil && c.NodeCtx != nil {
		nodeKey = c.NodeCtx.NodeKey
	}
	ctxcache.Store(ctx, fmt.Sprintf(sourceKey, nodeKey), resolvedSources)

	return composeOpts, resumingEvent, nil
}

func (l *LLM) handleInterrupt(ctx context.Context, err error, resumingEvent *entity.InterruptEvent) error {
	info, ok := compose.ExtractInterruptInfo(err)
	if !ok {
		return err
	}

	info = info.SubGraphs["llm"] // 'llm' is the node key of the react agent
	var extra any
	for i := range info.RerunNodesExtra {
		extra = info.RerunNodesExtra[i]
		break
	}

	toolsNodeExtra, ok := extra.(*compose.ToolsInterruptAndRerunExtra)
	if !ok {
		return fmt.Errorf("llm rerun node extra type expected to be ToolsInterruptAndRerunExtra, actual: %T", extra)
	}
	id, err := workflow.GetRepository().GenID(ctx)
	if err != nil {
		return err
	}

	var (
		previousInterruptedCallID string
		highPriorityEvent         *entity.ToolInterruptEvent
	)
	if resumingEvent != nil {
		previousInterruptedCallID = resumingEvent.ToolInterruptEvent.ToolCallID
	}

	c := execute.GetExeCtx(ctx)

	toolIEs := make([]*entity.ToolInterruptEvent, 0, len(toolsNodeExtra.RerunExtraMap))
	for callID := range toolsNodeExtra.RerunExtraMap {
		subIE, ok := toolsNodeExtra.RerunExtraMap[callID].(*entity.ToolInterruptEvent)
		if !ok {
			return fmt.Errorf("llm rerun node extra type expected to be ToolInterruptEvent, actual: %T", extra)
		}

		if subIE.ExecuteID == 0 {
			subIE.ExecuteID = c.RootExecuteID
		}

		toolIEs = append(toolIEs, subIE)
		if subIE.ToolCallID == previousInterruptedCallID {
			highPriorityEvent = subIE
		}
	}

	ie := &entity.InterruptEvent{
		ID:        id,
		NodeKey:   c.NodeKey,
		NodeType:  entity.NodeTypeLLM,
		NodeTitle: c.NodeName,
		NodeIcon:  entity.NodeMetaByNodeType(entity.NodeTypeLLM).IconURI,
		EventType: entity.InterruptEventLLM,
	}

	if highPriorityEvent != nil {
		ie.ToolInterruptEvent = highPriorityEvent
	} else {
		ie.ToolInterruptEvent = toolIEs[0]
	}

	callID2ExeID := make(map[string]any, len(toolIEs))
	for i := range toolIEs {
		callID2ExeID[toolIEs[i].ToolCallID] = toolIEs[i].ExecuteID
	}
	_ = compose.ProcessState(ctx, func(ctx context.Context, state nodes.IntermediateResultStore) error {
		previous := state.GetIntermediateResult(l.nodeKey)
		for k, v := range previous {
			if _, ok := callID2ExeID[k]; !ok {
				callID2ExeID[k] = v
			}
		}
		state.SetIntermediateResult(l.nodeKey, callID2ExeID)
		return nil
	})

	return compose.NewInterruptAndRerunErr(ie)
}

func (l *LLM) Invoke(ctx context.Context, in map[string]any, opts ...nodes.NodeOption) (out map[string]any, err error) {
	composeOpts, resumingEvent, err := l.prepare(ctx, in, opts...)
	if err != nil {
		return nil, err
	}

	out, err = l.r.Invoke(ctx, in, composeOpts...)
	if err != nil {
		err = l.handleInterrupt(ctx, err, resumingEvent)
		return nil, err
	}

	return out, nil
}

func (l *LLM) Stream(ctx context.Context, in map[string]any, opts ...nodes.NodeOption) (out *schema.StreamReader[map[string]any], err error) {
	composeOpts, resumingEvent, err := l.prepare(ctx, in, opts...)
	if err != nil {
		return nil, err
	}

	out, err = l.r.Stream(ctx, in, composeOpts...)
	if err != nil {
		err = l.handleInterrupt(ctx, err, resumingEvent)
		return nil, err
	}

	return out, nil
}

func injectKnowledgeTool(_ context.Context, g *compose.Graph[map[string]any, map[string]any], userPrompt string, cfg *KnowledgeRecallConfig) error {
	selectedKwDetails, err := sonic.MarshalString(cfg.SelectedKnowledgeDetails)
	if err != nil {
		return err
	}
	_ = g.AddChatTemplateNode(knowledgeTemplateKey,
		prompt.FromMessages(schema.Jinja2,
			schema.SystemMessage(fmt.Sprintf(knowledgeIntentPrompt, selectedKwDetails, userPrompt)),
		), compose.WithStatePreHandler(func(ctx context.Context, in map[string]any, state llmState) (map[string]any, error) {
			for k, v := range in {
				state[k] = v
			}
			return in, nil
		}))
	_ = g.AddChatModelNode(knowledgeChatModelKey, cfg.ChatModel)

	_ = g.AddLambdaNode(knowledgeLambdaKey, compose.InvokableLambda(func(ctx context.Context, input *schema.Message) (output map[string]any, err error) {
		modelPredictionIDs := strings.Split(input.Content, ",")
		selectKwIDs := slices.ToMap(cfg.SelectedKnowledgeDetails, func(e *knowledge.KnowledgeDetail) (string, int64) {
			return strconv.Itoa(int(e.ID)), e.ID
		})
		recallKnowledgeIDs := make([]int64, 0)
		for _, id := range modelPredictionIDs {
			if kid, ok := selectKwIDs[id]; ok {
				recallKnowledgeIDs = append(recallKnowledgeIDs, kid)
			}
		}

		if len(recallKnowledgeIDs) == 0 {
			return make(map[string]any), nil
		}

		docs, err := crossknowledge.DefaultSVC().Retrieve(ctx, &knowledge.RetrieveRequest{
			Query:        userPrompt,
			KnowledgeIDs: recallKnowledgeIDs,
			Strategy:     cfg.RetrievalStrategy.RetrievalStrategy,
		})
		if err != nil {
			return nil, err
		}

		if len(docs.RetrieveSlices) == 0 && cfg.RetrievalStrategy.NoReCallReplyMode == NoReCallReplyModeOfDefault {
			return make(map[string]any), nil
		}

		sb := strings.Builder{}
		if len(docs.RetrieveSlices) == 0 && cfg.RetrievalStrategy.NoReCallReplyMode == NoReCallReplyModeOfCustomize {
			sb.WriteString("recall slice 1: \n")
			sb.WriteString(cfg.RetrievalStrategy.NoReCallReplyCustomizePrompt + "\n")
		}

		for idx, msg := range docs.RetrieveSlices {
			sb.WriteString(fmt.Sprintf("recall slice %d:\n", idx+1))
			sb.WriteString(fmt.Sprintf("%s\n", msg.Slice.GetSliceContent()))
		}

		output = map[string]any{
			knowledgeUserPromptTemplateKey: fmt.Sprintf(knowledgeUserPromptTemplate, sb.String()),
		}

		return output, nil
	}))
	_ = g.AddEdge(compose.START, knowledgeTemplateKey)
	_ = g.AddEdge(knowledgeTemplateKey, knowledgeChatModelKey)
	_ = g.AddEdge(knowledgeChatModelKey, knowledgeLambdaKey)
	return nil
}

func (l *LLM) ToCallbackInput(ctx context.Context, input map[string]any) (
	*nodes.StructuredCallbackInput, error) {
	if l.chatHistorySetting == nil || !l.chatHistorySetting.EnableChatHistory {
		return &nodes.StructuredCallbackInput{Input: input}, nil
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
	maps.Copy(ret, input)

	if len(messages) == 0 {
		return &nodes.StructuredCallbackInput{Input: ret}, nil
	}

	if sectionID != nil && messages[0].SectionID != *sectionID {
		return &nodes.StructuredCallbackInput{Input: ret}, nil
	}

	maxRounds := int(l.chatHistorySetting.ChatHistoryRound)
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

func (l *LLM) ToCallbackOutput(ctx context.Context, output map[string]any) (*nodes.StructuredCallbackOutput, error) {
	c := execute.GetExeCtx(ctx)
	if c == nil {
		return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: ptr.Of(output[l.outputKey].(string)),
		}, nil
	}
	rawOutputK := fmt.Sprintf(rawOutputKey, c.NodeKey)
	warningK := fmt.Sprintf(warningKey, c.NodeKey)
	rawOutput, found := ctxcache.Get[string](ctx, rawOutputK)
	if !found {
		structuredOut := &nodes.StructuredCallbackOutput{
			Output: output,
		}

		if _, ok := output[l.outputKey]; ok {
			structuredOut.RawOutput = ptr.Of(output[l.outputKey].(string))
		}

		return structuredOut, nil
	}

	warning, found := ctxcache.Get[vo.WorkflowError](ctx, warningK)
	if !found {
		return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: ptr.Of(rawOutput),
		}, nil
	}

	structuredOut := &nodes.StructuredCallbackOutput{
		Output:    output,
		RawOutput: ptr.Of(rawOutput),
		Error:     warning,
	}

	reasoning, ok := output[ReasoningOutputKey]
	if ok {
		structuredOut.Extra = map[string]any{
			ReasoningOutputKey: reasoning,
		}
	}

	return structuredOut, nil
}
