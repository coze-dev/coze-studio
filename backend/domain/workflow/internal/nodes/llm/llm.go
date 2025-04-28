package llm

import (
	"context"
	"fmt"
	"io"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
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

func (l *LLM) Chat(ctx context.Context, in map[string]any) (out map[string]any, err error) {
	tokenHandler := execute.GetTokenCallbackHandler()

	ctx = callbacks.InitCallbacks(ctx, &callbacks.RunInfo{
		Component: compose.ComponentOfGraph,
		Name:      "chat",
	}, tokenHandler)
	out, err = l.r.Invoke(ctx, in)
	if err != nil {
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

func (l *LLM) ChatStream(ctx context.Context, in map[string]any) (out *schema.StreamReader[map[string]any], err error) {
	tokenHandler := execute.GetTokenCallbackHandler()

	ctx = callbacks.InitCallbacks(ctx, &callbacks.RunInfo{
		Component: compose.ComponentOfGraph,
		Name:      "chat",
	}, tokenHandler)
	out, err = l.r.Stream(ctx, in)
	if err != nil {
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
