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
	Template string
	M        Mode
}

type Mode string

const (
	Streaming    Mode = "streaming"
	NonStreaming Mode = "non_streaming"
)

func New(_ context.Context, cfg *Config) (*OutputEmitter, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}

	return &OutputEmitter{
		cfg: cfg,
	}, nil
}

func (e *OutputEmitter) Emit(ctx context.Context, in map[string]any) (err error) {
	defer func() {
		if err != nil {
			_ = callbacks.OnError(ctx, err)
		}
	}()

	switch e.cfg.M {
	case NonStreaming:
		var out string
		out, err = nodes.Jinja2TemplateRender(e.cfg.Template, in)
		if err != nil {
			return err
		}

		_ = callbacks.OnEnd(ctx, out)
		return nil
	case Streaming:
		templateParts := parseJinja2Template(e.cfg.Template)

		sr, sw := schema.Pipe[string](0)
		go func() {
			defer sw.Close()
			for _, part := range templateParts {
				if !part.IsVariable {
					sw.Send(part.Value, nil)
					continue
				}

				path := part.Value
				pathSegments := strings.Split(path, ".")
				if len(pathSegments) == 1 {
					inputV, ok := in[pathSegments[0]]
					if !ok {
						sw.Send("", fmt.Errorf("path not found in inpug: %s", path))
						return
					}

					inputStream, ok := inputV.(*schema.StreamReader[string])
					if ok {
						for {
							chunk, err := inputStream.Recv()
							if err != nil {
								if err == io.EOF {
									break
								}
								sw.Send("", err)
								return
							}

							sw.Send(chunk, nil)
						}
						continue
					}
				}

				chunk, err := nodes.Jinja2TemplateRender(path, in)
				if err != nil {
					sw.Send("", err)
					return
				}
				sw.Send(chunk, nil)
			}
		}()

		_, sr = callbacks.OnEndWithStreamOutput(ctx, sr)
		sr.Close()
		return nil
	default:
		return fmt.Errorf("unsupported mode %s", e.cfg.M)
	}
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
