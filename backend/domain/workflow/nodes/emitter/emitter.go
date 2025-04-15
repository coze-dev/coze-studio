package emitter

import (
	"context"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type OutputEmitter struct {
	cfg *Config
}

type Config struct {
	Template      string
	StreamSources []*nodes.FieldInfo
}

func New(_ context.Context, cfg *Config) (*OutputEmitter, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}

	return &OutputEmitter{
		cfg: cfg,
	}, nil
}

func (e *OutputEmitter) EmitStream(ctx context.Context, in *schema.StreamReader[map[string]any]) (out *schema.StreamReader[string], err error) {
	defer func() {
		if err != nil {
			_ = callbacks.OnError(ctx, err)
		}
	}()

	ctx, in = callbacks.OnStartWithStreamInput(ctx, in)

	sr, sw := schema.Pipe[string](0)
	parts := parseJinja2Template(e.cfg.Template)
	go func() {
		defer func() {
			sw.Close()
			in.Close()
		}()

		type cachedKeyValue struct {
			val      any
			finished bool
		}

		caches := make(map[string]*cachedKeyValue)

	partsLoop:
		for _, part := range parts {
			if !part.IsVariable { // literal string within template, just emit it
				sw.Send(part.Value, nil)
				continue
			}

			cached, ok := caches[part.Value]
			if ok {
				sw.Send(fmt.Sprintf("%v", cached.val), nil)
				if cached.finished { // move on to next part in template
					continue
				}
			}

			if strings.Contains(part.Value, ".") {
				rootPath := strings.Split(part.Value, ".")[0]
				cached, ok = caches[rootPath]
				if ok {
					tpl := fmt.Sprintf("{{%s}}", part.Value)
					formatted, err := nodes.Jinja2TemplateRender(tpl, map[string]any{rootPath: cached.val})
					if err != nil {
						sw.Send("", err)
					} else {
						sw.Send(formatted, nil)
					}
					continue
				}
			}

			for {
				chunk, err := in.Recv()
				if err != nil {
					if err == io.EOF {
						return
					}

					sw.Send("", err) // real error
					return
				}

				shouldChangePart := false
				for k, v := range chunk {
					var isFinishSignal bool
					s, ok := v.(string)
					if ok && s == nodes.KeyIsFinished {
						isFinishSignal = true
					}

					isStream := false
					for _, fInfo := range e.cfg.StreamSources {
						if len(fInfo.Path) == 1 && fInfo.Path[0] == k {
							isStream = true
							break
						}
					}

					if k == part.Value {
						if isFinishSignal || !isStream {
							shouldChangePart = true
						}

						if !isFinishSignal {
							sw.Send(fmt.Sprintf("%v", v), nil)
						}
						continue
					}

					if !isStream && strings.Contains(part.Value, ".") {
						rootPath := strings.Split(part.Value, ".")[0]
						if rootPath == k {
							shouldChangePart = true
							tpl := fmt.Sprintf("{{%s}}", part.Value)
							formatted, err := nodes.Jinja2TemplateRender(tpl, map[string]any{k: v})
							if err != nil {
								sw.Send("", err)
							} else {
								sw.Send(formatted, nil)
							}
							continue
						}
					}

					if isStream {
						cached, ok := caches[k]
						if !ok {
							if isFinishSignal {
								caches[k] = &cachedKeyValue{
									val:      "",
									finished: true,
								}
							} else {
								caches[k] = &cachedKeyValue{
									val: v.(string),
								}
							}
						} else {
							if isFinishSignal {
								cached.finished = true
							} else {
								cached.val = cached.val.(string) + v.(string)
							}
						}
					} else {
						_, ok := caches[k]
						if ok {
							sw.Send("", fmt.Errorf("key %s is not a stream key, but appreas multiple times in stream", k))
						}

						caches[k] = &cachedKeyValue{
							val:      v,
							finished: true,
						}
					}
				}

				if shouldChangePart {
					continue partsLoop
				}
			}
		}
	}()

	_, sr = callbacks.OnEndWithStreamOutput(ctx, sr)
	return sr, nil
}

func (e *OutputEmitter) Emit(ctx context.Context, in map[string]any) (output string, err error) {
	defer func() {
		if err != nil {
			_ = callbacks.OnError(ctx, err)
		}
	}()

	var out string
	out, err = nodes.Jinja2TemplateRender(e.cfg.Template, in)
	if err != nil {
		return "", err
	}

	_ = callbacks.OnEnd(ctx, out)
	return out, nil
}

type templatePart struct {
	IsVariable bool
	Value      string
}

func parseJinja2Template(template string) []templatePart {
	re := regexp.MustCompile(`{{\s*([^}]+)\s*}}`)
	matches := re.FindAllStringSubmatchIndex(template, -1)
	parts := make([]templatePart, 0)
	lastEnd := 0

	for _, match := range matches {
		start, end := match[0], match[1]
		placeholderStart, placeholderEnd := match[2], match[3]

		// Add the literal part before the current variable placeholder
		if start > lastEnd {
			parts = append(parts, templatePart{
				IsVariable: false,
				Value:      template[lastEnd:start],
			})
		}

		// Add the variable placeholder
		parts = append(parts, templatePart{
			IsVariable: true,
			Value:      template[placeholderStart:placeholderEnd],
		})

		lastEnd = end
	}

	// Add the remaining literal part if there is any
	if lastEnd < len(template) {
		parts = append(parts, templatePart{
			IsVariable: false,
			Value:      template[lastEnd:],
		})
	}

	return parts
}

func (e *OutputEmitter) IsCallbacksEnabled() bool {
	return true
}
