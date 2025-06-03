package llm

import (
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose/checkpoint"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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
	reasoningOutputKey = "reasoning_content"
)

type Config struct {
	ChatModel           model.BaseChatModel
	Tools               []tool.BaseTool
	SystemPrompt        string
	UserPrompt          string
	OutputFormat        Format
	OutputFields        map[string]*vo.TypeInfo
	IgnoreException     bool
	DefaultOutput       map[string]any
	ToolsReturnDirectly map[string]bool
	// TODO: needs to support descriptions for output fields
}

type LLM struct {
	r                 compose.Runnable[map[string]any, map[string]any]
	defaultOutput     map[string]any
	outputFormat      Format
	outputFields      map[string]*vo.TypeInfo
	canStream         bool
	requireCheckpoint bool
}

func jsonParse(data string, schema_ map[string]*vo.TypeInfo) (map[string]any, error) {
	data = nodes.ExtractJSONString(data)

	var result map[string]any

	err := sonic.UnmarshalString(data, &result)
	if err != nil {
		return nil, err
	}

	for k, v := range result {
		if s, ok := schema_[k]; ok {
			if val, ok_ := vo.TypeValidateAndConvert(s, v); ok_ {
				result[k] = val
			} else {
				return nil, fmt.Errorf("invalid type: %v", k)
			}
		}
	}

	return result, nil
}

func getReasoningContent(message *schema.Message) string {
	c, ok := deepseek.GetReasoningContent(message)
	if ok {
		return c
	}

	c, ok = ark.GetReasoningContent(message)
	if ok {
		return c
	}

	return ""
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

func New(ctx context.Context, cfg *Config) (*LLM, error) {
	g := compose.NewGraph[map[string]any, map[string]any]()

	const (
		templateNodeKey      = "template"
		llmNodeKey           = "llm"
		outputConvertNodeKey = "output_convert"
	)

	var (
		hasReasoning bool
		canStream    = true
	)

	userPrompt := cfg.UserPrompt
	switch cfg.OutputFormat {
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

	template := prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage(cfg.SystemPrompt),
		schema.UserMessage(userPrompt),
	)

	_ = g.AddChatTemplateNode(templateNodeKey, template)
	_ = g.AddEdge(compose.START, templateNodeKey)

	if len(cfg.Tools) > 0 {
		m, ok := cfg.ChatModel.(model.ToolCallingChatModel)
		if !ok {
			return nil, errors.New("requires a ToolCallingChatModel to use with tools")
		}
		reactConfig := react.AgentConfig{
			ToolCallingModel: m,
			ToolsConfig:      compose.ToolsNodeConfig{Tools: cfg.Tools},
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
		_ = g.AddGraphNode(llmNodeKey, agentNode, opts...)
	} else {
		_ = g.AddChatModelNode(llmNodeKey, cfg.ChatModel)
	}

	_ = g.AddEdge(templateNodeKey, llmNodeKey)

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
			if _, ok := cfg.OutputFields[reasoningOutputKey]; ok {
				for k, v := range cfg.OutputFields {
					if k != reasoningOutputKey && v.Type == vo.DataTypeString {
						format = FormatText
						break
					}
				}
			}
		}
	}

	if format == FormatJSON {
		iConvert := func(_ context.Context, msg *schema.Message) (map[string]any, error) {
			return jsonParse(msg.Content, cfg.OutputFields)
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

			if k == reasoningOutputKey {
				hasReasoning = true
			} else {
				outputKey = k
			}
		}

		iConvert := func(_ context.Context, msg *schema.Message, _ ...struct{}) (map[string]any, error) {
			out := map[string]any{outputKey: msg.Content}
			if hasReasoning {
				out[reasoningOutputKey] = getReasoningContent(msg)
			}
			return out, nil
		}

		tConvert := func(_ context.Context, s *schema.StreamReader[*schema.Message], _ ...struct{}) (*schema.StreamReader[map[string]any], error) {
			sr, sw := schema.Pipe[map[string]any](0)

			go func() {
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
							sw.Send(map[string]any{reasoningOutputKey: reasoning}, nil)
						}
					}

					if len(msg.Content) > 0 {
						if !reasoningDone && hasReasoning {
							reasoningDone = true
							sw.Send(map[string]any{
								reasoningOutputKey: nodes.KeyIsFinished,
							}, nil)
						}
						sw.Send(map[string]any{outputKey: msg.Content}, nil)
					}
				}
			}()

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
		opts = append(opts, compose.WithCheckPointStore(checkpoint.GetStore()))
	}

	r, err := g.Compile(ctx, opts...)
	if err != nil {
		return nil, err
	}

	llm := &LLM{
		r:                 r,
		outputFormat:      format,
		canStream:         canStream,
		requireCheckpoint: requireCheckpoint,
	}

	if cfg.IgnoreException {
		llm.defaultOutput = cfg.DefaultOutput
	}

	return llm, nil
}

func (l *LLM) prepare(ctx context.Context, in map[string]any, opts ...Option) (composeOpts []compose.Option, resumingEvent *entity.InterruptEvent, err error) {
	c := execute.GetExeCtx(ctx)
	if c != nil {
		resumingEvent = c.NodeCtx.ResumingEvent
	}
	var previousToolES map[string]*entity.ToolInterruptEvent

	if len(in) == 0 && c != nil {
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

	if l.requireCheckpoint {
		c := execute.GetExeCtx(ctx)
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
	}

	if c != nil {
		exeCfg := c.ExeCfg
		composeOpts = append(composeOpts, compose.WithToolsNodeOption(compose.WithToolOption(execute.WithExecuteConfig(exeCfg))))
	}

	if llmOpts.toolWorkflowSW != nil {
		toolMsgOpt, toolMsgSR := execute.WithMessagePipe()
		composeOpts = append(composeOpts, toolMsgOpt)

		go func() {
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
		}()
	}

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

	toolIEs := make([]*entity.ToolInterruptEvent, 0, len(toolsNodeExtra.RerunExtraMap))
	for callID := range toolsNodeExtra.RerunExtraMap {
		subIE, ok := toolsNodeExtra.RerunExtraMap[callID].(*entity.ToolInterruptEvent)
		if !ok {
			return fmt.Errorf("llm rerun node extra type expected to be ToolInterruptEvent, actual: %T", extra)
		}

		toolIEs = append(toolIEs, subIE)
		if subIE.ToolCallID == previousInterruptedCallID {
			highPriorityEvent = subIE
		}
	}

	c := execute.GetExeCtx(ctx)
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
		if _, ok := compose.IsInterruptRerunError(err); ok {
			return nil, err
		}

		if l.defaultOutput != nil {
			l.defaultOutput["errorBody"] = map[string]any{
				"errorMessage": err.Error(),
				"errorCode":    -1,
			}
			return l.defaultOutput, nil
		}
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
		if _, ok := compose.IsInterruptRerunError(err); ok {
			return nil, err
		}

		if l.defaultOutput != nil {
			l.defaultOutput["errorBody"] = map[string]any{
				"errorMessage": err.Error(),
				"errorCode":    -1,
			}
			return schema.StreamReaderFromArray([]map[string]any{l.defaultOutput}), nil
		}
		return nil, err
	}

	return out, nil
}

type ToolInterruptEventStore interface {
	SetToolInterruptEvent(llmNodeKey vo.NodeKey, toolCallID string, ie *entity.ToolInterruptEvent) error
	GetToolInterruptEvents(llmNodeKey vo.NodeKey) (map[string]*entity.ToolInterruptEvent, error)
	ResumeToolInterruptEvent(llmNodeKey vo.NodeKey, toolCallID string) (string, error)
}
