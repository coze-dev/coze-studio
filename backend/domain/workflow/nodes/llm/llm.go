package llm

import (
	"context"
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

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
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

// type ModelConfig struct {
// 	Temperature      *float32
// 	TopP             *float32
// 	PresencePenalty  *float32
// 	MaxTokens        *int
// }

type Config struct {
	ChatModel       model.ChatModel
	Tools           []tool.BaseTool
	SystemPrompt    string
	UserPrompt      string
	OutputFormat    Format
	OutputFields    map[string]*nodes.TypeInfo
	IgnoreException bool
	DefaultOutput   map[string]any
}

type LLM struct {
	r             compose.Runnable[map[string]any, map[string]any]
	defaultOutput map[string]any
	outputFormat  Format
	outputFields  map[string]*nodes.TypeInfo
	canStream     bool
}

func jsonParse(data string, schema_ map[string]*nodes.TypeInfo) (map[string]any, error) {
	data = nodes.ExtraJSONString(data)

	var result map[string]any

	err := sonic.UnmarshalString(data, &result)
	if err != nil {
		return nil, err
	}

	for k, v := range result {
		if s, ok := schema_[k]; ok {
			if val, ok_ := nodes.TypeValidateAndConvert(s, v); ok_ {
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
		jsonSchema, err := nodes.TypeInfoToJSONSchema(cfg.OutputFields, nil)
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
		reactConfig := react.AgentConfig{
			Model:       cfg.ChatModel,
			ToolsConfig: compose.ToolsNodeConfig{Tools: cfg.Tools},
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

	if cfg.OutputFormat == FormatJSON {
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
			if v.Type != nodes.DataTypeString {
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

		cConvert := func(_ context.Context, s *schema.StreamReader[*schema.Message], _ ...struct{}) (map[string]any, error) {
			contentR, contentW := schema.Pipe[string](0)

			var (
				reasoningR *schema.StreamReader[string]
				reasoningW *schema.StreamWriter[string]
			)

			if hasReasoning {
				reasoningR, reasoningW = schema.Pipe[string](0)
			}

			go func() {
				var reasoningDone bool

				for {
					msg, err := s.Recv()
					if err != nil {
						if err == io.EOF {
							contentW.Close()
							return
						}

						contentW.Send("", err)
						contentW.Close()
						if hasReasoning {
							reasoningW.Send("", err)
							reasoningW.Close()
						}
						return
					}

					if hasReasoning {
						reasoning := getReasoningContent(msg)
						if len(reasoning) > 0 {
							reasoningW.Send(reasoning, nil)
						}
					}

					if len(msg.Content) > 0 {
						if !reasoningDone && hasReasoning {
							reasoningDone = true
							reasoningW.Close()
						}

						contentW.Send(msg.Content, nil)
					}
				}
			}()

			out := map[string]any{outputKey: contentR}
			if hasReasoning {
				out[reasoningOutputKey] = reasoningR
			}
			return out, nil
		}

		convertNode, err := compose.AnyLambda(iConvert, nil, cConvert, nil)
		if err != nil {
			return nil, err
		}

		_ = g.AddLambdaNode(outputConvertNodeKey, convertNode)
	}

	_ = g.AddEdge(llmNodeKey, outputConvertNodeKey)
	_ = g.AddEdge(outputConvertNodeKey, compose.END)

	r, err := g.Compile(ctx)
	if err != nil {
		return nil, err
	}

	llm := &LLM{
		r:            r,
		outputFormat: cfg.OutputFormat,
		canStream:    canStream,
	}

	if cfg.IgnoreException {
		llm.defaultOutput = cfg.DefaultOutput
	}

	return llm, nil
}

type options struct {
	emitStreamIfPossible bool
}

type Option func(*options)

// WithEmitStreamIfPossible will emit stream if possible.
// when to use this:
//  1. if workflow's END node use streaming output and refers to this Node's output field
//  2. if LLM Node's output is referred by OutputEmitter Node that uses streaming output.
//  3. if LLM Node's output is referred by VariableAggregator Node, then referred by END Node or OutputEmitter Node like in case 1 or 2.
func WithEmitStreamIfPossible() Option {
	return func(o *options) {
		o.emitStreamIfPossible = true
	}
}

func (l *LLM) Chat(ctx context.Context, in map[string]any, opts ...Option) (out map[string]any, err error) {
	opt := &options{}
	for _, o := range opts {
		o(opt)
	}

	if l.defaultOutput != nil {
		defer func() {
			if err != nil {
				out = l.defaultOutput
				err = nil
			}
		}()
	}

	if opt.emitStreamIfPossible && l.canStream {
		var plainOut *schema.StreamReader[map[string]any]
		plainOut, err = l.r.Stream(ctx, in)
		if err != nil {
			return nil, err
		}

		defer plainOut.Close()

		var (
			chunks []map[string]any
		)
		for {
			o, e := plainOut.Recv()
			if e != nil {
				if e == io.EOF {
					break
				}

				return nil, e
			}

			chunks = append(chunks, o)
		}

		if len(chunks) != 1 {
			return nil, fmt.Errorf("expected 1 chunk in llm streaming but got %d", len(chunks))
		}

		return chunks[0], nil
	}

	out, err = l.r.Invoke(ctx, in)
	if err != nil {
		if l.defaultOutput != nil {
			return l.defaultOutput, nil
		}
		return nil, err
	}

	return out, nil
}
