package execute

import (
	"context"
	"sync"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	callbacks2 "github.com/cloudwego/eino/utils/callbacks"
)

type TokenCollector struct {
	usage  *model.TokenUsage
	wg     sync.WaitGroup
	mu     sync.Mutex
	parent *TokenCollector
}

func newTokenCollector(parent *TokenCollector) *TokenCollector {
	return &TokenCollector{
		usage:  &model.TokenUsage{},
		parent: parent,
	}
}

func (t *TokenCollector) addTokenUsage(usage *model.TokenUsage) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.usage.PromptTokens += usage.PromptTokens
	t.usage.CompletionTokens += usage.CompletionTokens
	t.usage.TotalTokens += usage.TotalTokens
}

func (t *TokenCollector) wait() *model.TokenUsage {
	t.wg.Wait()
	if t.parent != nil {
		t.parent.addTokenUsage(t.usage)
	}
	return t.usage
}

func getTokenCollector(ctx context.Context) *TokenCollector {
	c := getExeCtx(ctx)
	if c == nil {
		return nil
	}
	return c.TokenCollector
}

func GetTokenCallbackHandler() callbacks.Handler {
	return callbacks2.NewHandlerHelper().ChatModel(&callbacks2.ModelCallbackHandler{
		OnStart: func(ctx context.Context, runInfo *callbacks.RunInfo, input *model.CallbackInput) context.Context {
			c := getTokenCollector(ctx)
			if c == nil {
				return ctx
			}
			c.wg.Add(1)
			return ctx
		},
		OnEnd: func(ctx context.Context, runInfo *callbacks.RunInfo, output *model.CallbackOutput) context.Context {
			if output.TokenUsage == nil {
				return ctx
			}
			c := getTokenCollector(ctx)
			if c == nil {
				return ctx
			}
			c.addTokenUsage(output.TokenUsage)
			c.wg.Done()
			return ctx
		},
		OnEndWithStreamOutput: func(ctx context.Context, runInfo *callbacks.RunInfo, output *schema.StreamReader[*model.CallbackOutput]) context.Context {
			c := getTokenCollector(ctx)
			if c == nil {
				output.Close()
				return ctx
			}
			go func() {
				defer func() {
					output.Close()
					c.wg.Done()
				}()

				newC := &model.TokenUsage{}

				for {
					chunk, err := output.Recv()
					if err != nil {
						break
					}

					if chunk.TokenUsage == nil {
						continue
					}
					newC.PromptTokens += chunk.TokenUsage.PromptTokens
					newC.CompletionTokens += chunk.TokenUsage.CompletionTokens
					newC.TotalTokens += chunk.TokenUsage.TotalTokens
				}

				c.addTokenUsage(newC)
			}()
			return ctx
		},
	}).Handler()
}
