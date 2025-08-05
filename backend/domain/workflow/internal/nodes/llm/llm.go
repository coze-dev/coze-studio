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

	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	crossknowledge "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

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
	outputConvertNodeKey           = "output_convert"
)

type NoReCallReplyMode int64

const (
	NoReCallReplyModeOfDefault   NoReCallReplyMode = 0
	NoReCallReplyModeOfCustomize NoReCallReplyMode = 1
)

type RetrievalStrategy struct {
	RetrievalStrategy            *crossknowledge.RetrievalStrategy
	NoReCallReplyMode            NoReCallReplyMode
	NoReCallReplyCustomizePrompt string
}

type KnowledgeRecallConfig struct {
	ChatModel                model.BaseChatModel
	Retriever                crossknowledge.KnowledgeOperator
	RetrievalStrategy        *RetrievalStrategy
	SelectedKnowledgeDetails []*crossknowledge.KnowledgeDetail
}

type Config struct {
	ChatModel             ModelWithInfo
	Tools                 []tool.BaseTool
	SystemPrompt          string
	UserPrompt            string
	OutputFormat          Format
	InputFields           map[string]*vo.TypeInfo
	OutputFields          map[string]*vo.TypeInfo
	ToolsReturnDirectly   map[string]bool
	KnowledgeRecallConfig *KnowledgeRecallConfig
	FullSources           map[string]*nodes.SourceInfo
}

type LLM struct {
	r                 compose.Runnable[map[string]any, map[string]any]
	outputFormat      Format
	outputFields      map[string]*vo.TypeInfo
	canStream         bool
	requireCheckpoint bool
	fullSources       map[string]*nodes.SourceInfo
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

func getReasoningContent(message *schema.Message) string {
	return message.ReasoningContent
}

type Options struct {
	nested         []nodes.NestedWorkflowOption
	toolWorkflowSW *schema.StreamWriter[*entity.Message]
}

type Option func(o *Options)

func WithNestedWorkflowOptions(nested ...nodes.NestedWorkflowOption) Option {
	return func(o *Options) {
		o.nested = append(o.nested, nested...)
	}
}

func WithToolWorkflowMessageWriter(sw *schema.StreamWriter[*entity.Message]) Option {
	return func(o *Options) {
		o.toolWorkflowSW = sw
	}
}

type llmState = map[string]any

const agentModelName = "agent_model"

func New(ctx context.Context, cfg *Config) (*LLM, error) {
	g := compose.NewGraph[map[string]any, map[string]any](compose.WithGenLocalState(func(ctx context.Context) (state llmState) {
		return llmState{}
	}))

	var (
		hasReasoning bool
		canStream    = true
	)

	format := cfg.OutputFormat
	if format == FormatJSON {
		if len(cfg.OutputFields) == 1 {
			for _, v := range cfg.OutputFields {
				if v.Type == vo.DataTypeString {
					format = FormatText
					break
				}
			}
		} else if len(cfg.OutputFields) == 2 {
			if _, ok := cfg.OutputFields[ReasoningOutputKey]; ok {
				for k, v := range cfg.OutputFields {
					if k != ReasoningOutputKey && v.Type == vo.DataTypeString {
						format = FormatText
						break
					}
				}
			}
		}
	}

	userPrompt := cfg.UserPrompt
	switch format {
	case FormatJSON:
		jsonSchema, err := vo.TypeInfoToJSONSchema(cfg.OutputFields, nil)
		if err != nil {
			return nil, err
		}

		jsonPrompt := fmt.Sprintf(jsonPromptFormat, jsonSchema)
		userPrompt = userPrompt + jsonPrompt
	case FormatMarkdown:
		userPrompt = userPrompt + markdownPrompt
	case FormatText:
	}

	if cfg.KnowledgeRecallConfig != nil {
		err := injectKnowledgeTool(ctx, g, cfg.UserPrompt, cfg.KnowledgeRecallConfig)
		if err != nil {
			return nil, err
		}
		userPrompt = fmt.Sprintf("{{%s}}%s", knowledgeUserPromptTemplateKey, userPrompt)

		inputs := maps.Clone(cfg.InputFields)
		inputs[knowledgeUserPromptTemplateKey] = &vo.TypeInfo{
			Type: vo.DataTypeString,
		}
		sp := newPromptTpl(schema.System, cfg.SystemPrompt, inputs, nil)
		up := newPromptTpl(schema.User, userPrompt, inputs, []string{knowledgeUserPromptTemplateKey})
		template := newPrompts(sp, up, cfg.ChatModel)

		_ = g.AddChatTemplateNode(templateNodeKey, template,
			compose.WithStatePreHandler(func(ctx context.Context, in map[string]any, state llmState) (map[string]any, error) {
				for k, v := range state {
					in[k] = v
				}
				return in, nil
			}))
		_ = g.AddEdge(knowledgeLambdaKey, templateNodeKey)

	} else {
		sp := newPromptTpl(schema.System, cfg.SystemPrompt, cfg.InputFields, nil)
		up := newPromptTpl(schema.User, userPrompt, cfg.InputFields, nil)
		template := newPrompts(sp, up, cfg.ChatModel)
		_ = g.AddChatTemplateNode(templateNodeKey, template)

		_ = g.AddEdge(compose.START, templateNodeKey)
	}

	if len(cfg.Tools) > 0 {
		m, ok := cfg.ChatModel.(model.ToolCallingChatModel)
		if !ok {
			return nil, errors.New("requires a ToolCallingChatModel to use with tools")
		}
		reactConfig := react.AgentConfig{
			ToolCallingModel: m,
			ToolsConfig:      compose.ToolsNodeConfig{Tools: cfg.Tools},
			ModelNodeName:    agentModelName,
		}

		if len(cfg.ToolsReturnDirectly) > 0 {
			reactConfig.ToolReturnDirectly = make(map[string]struct{}, len(cfg.ToolsReturnDirectly))
			for k := range cfg.ToolsReturnDirectly {
				reactConfig.ToolReturnDirectly[k] = struct{}{}
			}
		}

		reactAgent, err := react.NewAgent(ctx, &reactConfig)
		if err != nil {
			return nil, err
		}

		agentNode, opts := reactAgent.ExportGraph()
		opts = append(opts, compose.WithNodeName("workflow_llm_react_agent"))
		_ = g.AddGraphNode(llmNodeKey, agentNode, opts...)
	} else {
		_ = g.AddChatModelNode(llmNodeKey, cfg.ChatModel)
	}

	_ = g.AddEdge(templateNodeKey, llmNodeKey)

	if format == FormatJSON {
		iConvert := func(ctx context.Context, msg *schema.Message) (map[string]any, error) {
			return jsonParse(ctx, msg.Content, cfg.OutputFields)
		}

		convertNode := compose.InvokableLambda(iConvert)

		_ = g.AddLambdaNode(outputConvertNodeKey, convertNode)

		canStream = false
	} else {
		var outputKey string
		if len(cfg.OutputFields) != 1 && len(cfg.OutputFields) != 2 {
			panic("impossible")
		}

		for k, v := range cfg.OutputFields {
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

	requireCheckpoint := false
	if len(cfg.Tools) > 0 {
		requireCheckpoint = true
	}

	var opts []compose.GraphCompileOption
	if requireCheckpoint {
		opts = append(opts, compose.WithCheckPointStore(workflow.GetRepository()))
	}
	opts = append(opts, compose.WithGraphName("workflow_llm_node_graph"))

	r, err := g.Compile(ctx, opts...)
	if err != nil {
		return nil, err
	}

	llm := &LLM{
		r:                 r,
		outputFormat:      format,
		canStream:         canStream,
		requireCheckpoint: requireCheckpoint,
		fullSources:       cfg.FullSources,
	}

	return llm, nil
}

func (l *LLM) prepare(ctx context.Context, _ map[string]any, opts ...Option) (composeOpts []compose.Option, resumingEvent *entity.InterruptEvent, err error) {
	c := execute.GetExeCtx(ctx)
	if c != nil {
		resumingEvent = c.NodeCtx.ResumingEvent
	}
	var previousToolES map[string]*entity.ToolInterruptEvent

	if c != nil && c.RootCtx.ResumeEvent != nil {
		// check if we are not resuming, but previously interrupted. Interrupt immediately.
		if resumingEvent == nil {
			err := compose.ProcessState(ctx, func(ctx context.Context, state ToolInterruptEventStore) error {
				var e error
				previousToolES, e = state.GetToolInterruptEvents(c.NodeKey)
				if e != nil {
					return e
				}
				return nil
			})
			if err != nil {
				return nil, nil, err
			}

			if len(previousToolES) > 0 {
				return nil, nil, compose.InterruptAndRerun
			}
		}
	}

	if l.requireCheckpoint && c != nil {
		checkpointID := fmt.Sprintf("%d_%s", c.RootCtx.RootExecuteID, c.NodeCtx.NodeKey)
		composeOpts = append(composeOpts, compose.WithCheckPointID(checkpointID))
	}

	llmOpts := &Options{}
	for _, opt := range opts {
		opt(llmOpts)
	}

	nestedOpts := &nodes.NestedWorkflowOptions{}
	for _, opt := range llmOpts.nested {
		opt(nestedOpts)
	}

	composeOpts = append(composeOpts, nestedOpts.GetOptsForNested()...)

	if resumingEvent != nil {
		var (
			resumeData string
			e          error
			allIEs     = make(map[string]*entity.ToolInterruptEvent)
		)
		err = compose.ProcessState(ctx, func(ctx context.Context, state ToolInterruptEventStore) error {
			allIEs, e = state.GetToolInterruptEvents(c.NodeKey)
			if e != nil {
				return e
			}

			allIEs = maps.Clone(allIEs)

			resumeData, e = state.ResumeToolInterruptEvent(c.NodeKey, resumingEvent.ToolInterruptEvent.ToolCallID)

			return e
		})
		if err != nil {
			return nil, nil, err
		}
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

				return ctx
			},
		}).Handler()

		composeOpts = append(composeOpts, compose.WithCallbacks(chatModelHandler))
	}

	if c != nil {
		exeCfg := c.ExeCfg
		composeOpts = append(composeOpts, compose.WithToolsNodeOption(compose.WithToolOption(execute.WithExecuteConfig(exeCfg))))
	}

	if llmOpts.toolWorkflowSW != nil {
		toolMsgOpt, toolMsgSR := execute.WithMessagePipe()
		composeOpts = append(composeOpts, toolMsgOpt)

		safego.Go(ctx, func() {
			defer toolMsgSR.Close()
			for {
				msg, err := toolMsgSR.Recv()
				if err != nil {
					if err == io.EOF {
						return
					}
					logs.CtxErrorf(ctx, "failed to receive message from tool workflow: %v", err)
					return
				}

				logs.Infof("received message from tool workflow: %+v", msg)

				llmOpts.toolWorkflowSW.Send(msg, nil)
			}
		})
	}

	resolvedSources, err := nodes.ResolveStreamSources(ctx, l.fullSources)
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

func handleInterrupt(ctx context.Context, err error, resumingEvent *entity.InterruptEvent) error {
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
		NodeIcon:  entity.NodeMetaByNodeType(entity.NodeTypeLLM).IconURL,
		EventType: entity.InterruptEventLLM,
	}

	if highPriorityEvent != nil {
		ie.ToolInterruptEvent = highPriorityEvent
	} else {
		ie.ToolInterruptEvent = toolIEs[0]
	}

	err = compose.ProcessState(ctx, func(ctx context.Context, ieStore ToolInterruptEventStore) error {
		for i := range toolIEs {
			e := ieStore.SetToolInterruptEvent(c.NodeKey, toolIEs[i].ToolCallID, toolIEs[i])
			if e != nil {
				return e
			}
		}
		return nil
	})
	if err != nil {
		return err
	}

	return compose.NewInterruptAndRerunErr(ie)
}

func (l *LLM) Chat(ctx context.Context, in map[string]any, opts ...Option) (out map[string]any, err error) {
	composeOpts, resumingEvent, err := l.prepare(ctx, in, opts...)
	if err != nil {
		return nil, err
	}

	out, err = l.r.Invoke(ctx, in, composeOpts...)
	if err != nil {
		err = handleInterrupt(ctx, err, resumingEvent)
		return nil, err
	}

	return out, nil
}

func (l *LLM) ChatStream(ctx context.Context, in map[string]any, opts ...Option) (out *schema.StreamReader[map[string]any], err error) {
	composeOpts, resumingEvent, err := l.prepare(ctx, in, opts...)
	if err != nil {
		return nil, err
	}

	out, err = l.r.Stream(ctx, in, composeOpts...)
	if err != nil {
		err = handleInterrupt(ctx, err, resumingEvent)
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
		selectKwIDs := slices.ToMap(cfg.SelectedKnowledgeDetails, func(e *crossknowledge.KnowledgeDetail) (string, int64) {
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

		docs, err := cfg.Retriever.Retrieve(ctx, &crossknowledge.RetrieveRequest{
			Query:             userPrompt,
			KnowledgeIDs:      recallKnowledgeIDs,
			RetrievalStrategy: cfg.RetrievalStrategy.RetrievalStrategy,
		})
		if err != nil {
			return nil, err
		}

		if len(docs.Slices) == 0 && cfg.RetrievalStrategy.NoReCallReplyMode == NoReCallReplyModeOfDefault {
			return make(map[string]any), nil
		}

		sb := strings.Builder{}
		if len(docs.Slices) == 0 && cfg.RetrievalStrategy.NoReCallReplyMode == NoReCallReplyModeOfCustomize {
			sb.WriteString("recall slice 1: \n")
			sb.WriteString(cfg.RetrievalStrategy.NoReCallReplyCustomizePrompt + "\n")
		}

		for idx, msg := range docs.Slices {
			sb.WriteString(fmt.Sprintf("recall slice %d:\n", idx+1))
			sb.WriteString(fmt.Sprintf("%s\n", msg.Output))
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

type ToolInterruptEventStore interface {
	SetToolInterruptEvent(llmNodeKey vo.NodeKey, toolCallID string, ie *entity.ToolInterruptEvent) error
	GetToolInterruptEvents(llmNodeKey vo.NodeKey) (map[string]*entity.ToolInterruptEvent, error)
	ResumeToolInterruptEvent(llmNodeKey vo.NodeKey, toolCallID string) (string, error)
}

func (l *LLM) ToCallbackOutput(ctx context.Context, output map[string]any) (*nodes.StructuredCallbackOutput, error) {
	c := execute.GetExeCtx(ctx)
	if c == nil {
		return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: output,
		}, nil
	}
	rawOutputK := fmt.Sprintf(rawOutputKey, c.NodeKey)
	warningK := fmt.Sprintf(warningKey, c.NodeKey)
	rawOutput, found := ctxcache.Get[string](ctx, rawOutputK)
	if !found {
		return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: output,
		}, nil
	}

	warning, found := ctxcache.Get[vo.WorkflowError](ctx, warningK)
	if !found {
		return &nodes.StructuredCallbackOutput{
			Output:    output,
			RawOutput: map[string]any{"output": rawOutput},
		}, nil
	}

	return &nodes.StructuredCallbackOutput{
		Output:    output,
		RawOutput: map[string]any{"output": rawOutput},
		Error:     warning,
	}, nil
}
