package clickhouse

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"

	"github.com/coze-dev/coze-studio/backend/infra/contract/telemetry"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestExporter(t *testing.T) {
	if os.Getenv("ENABLE_CK_TELEMETRY_TEST") != "true" {
		return
	}
	username, pwd := os.Getenv("CK_USERNAME"), os.Getenv("CK_PASSWORD")
	baseURL, apiKey := os.Getenv("OPENAI_BASE_URL"), os.Getenv("OPENAI_API_KEY")

	ctx := context.Background()

	tp, err := NewTracerProvider(&TracerConfig{
		ClickhouseOptions: &clickhouse.Options{
			Addr: []string{"localhost:8124"},
			Auth: clickhouse.Auth{
				Database: "default",
				Username: username,
				Password: pwd,
			},
			Debug: true,
			Debugf: func(format string, v ...any) {
				fmt.Printf(format+"\n", v...)
			},
			Settings: clickhouse.Settings{
				"max_execution_time": 60,
			},
			Compression: &clickhouse.Compression{
				Method: clickhouse.CompressionZSTD,
				Level:  1,
			},
			DialTimeout:          time.Second * 30,
			MaxOpenConns:         5,
			MaxIdleConns:         5,
			ConnMaxLifetime:      time.Duration(10) * time.Minute,
			ConnOpenStrategy:     clickhouse.ConnOpenInOrder,
			BlockBufferSize:      10,
			MaxCompressionBuffer: 10240,
		},
		TracerProviderOptions: nil,
		IndexRootOnly:         false,
	})
	assert.NoError(t, err)

	defer tp.Shutdown(ctx)

	ch := &callbackHandler{tp.Tracer("test_tracer")}

	cm, err := openai.NewChatModel(ctx, &openai.ChatModelConfig{
		APIKey:  apiKey,
		ByAzure: true,
		BaseURL: baseURL,
		Model:   "gpt-4o-2024-05-13",
	})
	assert.NoError(t, err)

	g := compose.NewChain[string, string]().
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input string) (output []*schema.Message, err error) {
			return []*schema.Message{
				schema.UserMessage(input),
			}, nil
		})).
		AppendChatModel(cm).
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input *schema.Message) (output string, err error) {
			return input.Content, nil
		}))
	r, err := g.Compile(ctx)
	assert.NoError(t, err)

	resp, err := r.Invoke(
		context.WithValue(ctx, "log-id", uuid.New().String()),
		"hello",
		compose.WithCallbacks(ch),
	)
	assert.NoError(t, err)
	fmt.Println(resp)
}

func TestNewQueryClient(t *testing.T) {
	if os.Getenv("ENABLE_CK_TELEMETRY_TEST") != "true" {
		return
	}
	username, pwd := os.Getenv("CK_USERNAME"), os.Getenv("CK_PASSWORD")

	ctx := context.Background()

	qc, err := NewQueryClient(&QueryClientConfig{
		ClickhouseOptions: &clickhouse.Options{
			Addr: []string{"localhost:8124"},
			Auth: clickhouse.Auth{
				Database: "default",
				Username: username,
				Password: pwd,
			},
			Debug: true,
			Debugf: func(format string, v ...any) {
				fmt.Printf(format+"\n", v...)
			},
			Settings: clickhouse.Settings{
				"max_execution_time": 60,
			},
			Compression: &clickhouse.Compression{
				Method: clickhouse.CompressionZSTD,
				Level:  1,
			},
			DialTimeout:          time.Second * 30,
			MaxOpenConns:         5,
			MaxIdleConns:         5,
			ConnMaxLifetime:      time.Duration(10) * time.Minute,
			ConnOpenStrategy:     clickhouse.ConnOpenInOrder,
			BlockBufferSize:      10,
			MaxCompressionBuffer: 10240,
		},
		EmptySpanID: nil,
	})
	assert.NoError(t, err)
	spans, nextCursor, hasMore, err := qc.ListSpan(ctx, &telemetry.ListTracesRequest{
		RootOnly: true,
		SpaceID:  7521695817242001408,
		EntityID: 5566,
		Status:   0,
		StartAt:  time.Unix(1751461407, 0),
		EndAt:    time.Unix(1753547807, 0),
		Limit:    10,
		Cursor:   nil,
	})
	assert.NoError(t, err)
	assert.False(t, hasMore)
	fmt.Println(nextCursor)
	assert.True(t, len(spans) > 0)

	first := spans[0]
	fullTrace, err := qc.GetTrace(ctx, &telemetry.GetTraceRequest{
		SpaceID:  0,
		EntityID: 0,
		TraceID:  ptr.Of(first.SpanContext().TraceID()),
	})
	assert.NoError(t, err)
	assert.True(t, len(fullTrace) == 4)
	for _, item := range fullTrace {
		if item.Name() == "Chain" {
			assert.False(t, item.Parent().IsValid())
		} else {
			assert.True(t, item.Parent().IsValid())
		}
	}

	var logID string
	for _, attr := range first.Attributes() {
		if attr.Key == telemetry.AttributeLogID {
			logID = attr.Value.AsString()
		}
	}
	assert.True(t, logID != "")
	fullTrace, err = qc.GetTrace(ctx, &telemetry.GetTraceRequest{
		SpaceID:  0,
		EntityID: 0,
		LogID:    ptr.Of(logID),
	})
	assert.NoError(t, err)
	assert.True(t, len(fullTrace) == 4)
	for _, item := range fullTrace {
		if item.Name() == "Chain" {
			assert.False(t, item.Parent().IsValid())
		} else {
			assert.True(t, item.Parent().IsValid())
		}
	}
}

type callbackHandler struct {
	tracer trace.Tracer
}

func (c callbackHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	name := info.Name
	if name == "" {
		name = fmt.Sprintf("%s%s", info.Component, info.Type)
	}
	ctx, span := c.tracer.Start(ctx, info.Name)
	span.SetName(name)

	var (
		spanType telemetry.SpanType
		strInput string
	)

	switch info.Component {
	case components.ComponentOfChatModel:
		spanType = telemetry.LLMCall
		i := model.ConvCallbackInput(input)
		b, _ := json.Marshal(i.Messages)
		strInput = string(b)
	case compose.ComponentOfGraph, compose.ComponentOfChain:
		spanType = telemetry.UserInput
		if i, ok := input.(string); ok {
			strInput = i
		} else {
			b, _ := json.Marshal(input)
			strInput = string(b)
		}
	default:
		spanType = telemetry.Unknown
		if i, ok := input.(string); ok {
			strInput = i
		} else {
			b, _ := json.Marshal(input)
			strInput = string(b)
		}
	}

	attrs := []attribute.KeyValue{
		telemetry.NewSpanAttrLogID(ctx.Value("log-id").(string)),
		telemetry.NewSpanAttrSpaceID(int64(7521695817242001408)),
		telemetry.NewSpanAttrType(int64(spanType)),
		telemetry.NewSpanAttrUserID(int64(3344)),
		telemetry.NewSpanAttrEntityID(int64(5566)),
		telemetry.NewSpanAttrEnvironment("dev"),
		telemetry.NewSpanAttrVersion("1"),
		telemetry.NewSpanAttrInput(strInput),
	}
	span.SetAttributes(attrs...)

	return ctx
}

func (c callbackHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	span := trace.SpanFromContext(ctx)

	var (
		strOutput string
		attrs     []attribute.KeyValue
	)

	switch info.Component {
	case components.ComponentOfChatModel:
		o := model.ConvCallbackOutput(output)
		attrs = append(attrs)
		b, _ := json.Marshal(o.Message)
		strOutput = string(b)

		if o.TokenUsage != nil {
			attrs = append(attrs,
				telemetry.NewSpanAttrInputTokens(int64(o.TokenUsage.PromptTokens)),
				telemetry.NewSpanAttrOutputTokens(int64(o.TokenUsage.CompletionTokens)),
			)
		}

		if o.Config != nil {
			attrs = append(attrs, telemetry.NewSpanAttrModel(o.Config.Model))
		}

	default:
		if i, ok := output.(string); ok {
			strOutput = i
		} else {
			b, _ := json.Marshal(output)
			strOutput = string(b)
		}
	}

	attrs = append(attrs, telemetry.NewSpanAttrOutput(strOutput))

	span.SetAttributes(attrs...)
	span.SetStatus(codes.Ok, "")
	span.End()

	return ctx
}

func (c callbackHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	span := trace.SpanFromContext(ctx)
	span.SetStatus(codes.Error, err.Error())
	span.End()
	return ctx
}

func (c callbackHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo, input *schema.StreamReader[callbacks.CallbackInput]) context.Context {
	input.Close()
	return ctx
}

func (c callbackHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	output.Close()
	return ctx
}
