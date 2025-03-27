package textprocessor

import (
	"context"
	"encoding/json"

	"fmt"
	"reflect"
	"regexp"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Type string

const (
	ConcatText Type = "concat"
	SplitText  Type = "split"
)

type Config struct {
	Type       Type   `json:"type"`
	Tpl        string `json:"tpl"`
	ConcatChar string `json:"concatChar"`
	Separator  string `json:"separator"`
}

var parserRegexp = regexp.MustCompile(`\{\{([^}]+)\}\}`)

type TextProcessor struct {
	config *Config
}

func NewTextProcessor(ctx context.Context, cfg *Config) (*TextProcessor, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config requried")
	}
	if cfg.Type == ConcatText && len(cfg.Tpl) == 0 {
		return nil, fmt.Errorf("config tpl requried")
	}

	return &TextProcessor{
		config: cfg,
	}, nil

}

func (t *TextProcessor) Info() (*nodes.NodeInfo, error) {

	return &nodes.NodeInfo{
		Lambda: &nodes.Lambda{
			Invoke: t.Invoke,
		},
	}, nil
}

func (t *TextProcessor) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	switch t.config.Type {
	case ConcatText:
		var (
			formatedInputs = make(map[string]any, len(input))
			isArrayMapping = make(map[string]bool, len(input))
		)

		for k, v := range input {
			//  coze workflow format string. If the first level is a list, then list join through concatChar
			if vsArray, ok := v.([]any); ok {
				isArrayMapping[k] = true
				formatedInputs[k+"_join"] = join(vsArray, t.config.ConcatChar)
				formatedInputs[k] = v
			}

			switch reflect.TypeOf(v).Kind() {
			case reflect.Slice, reflect.Array:

			default:
				formatedInputs[k] = v
			}
		}
		formatedTpl, err := formatTpl(ctx, t.config.Tpl, isArrayMapping)
		if err != nil {
			return nil, err
		}

		result, err := nodes.Jinja2TemplateRender(formatedTpl, formatedInputs)
		if err != nil {
			return nil, err
		}

		return map[string]any{"output": result}, nil

	case SplitText:
		value, ok := input["String"]
		if !ok {
			return nil, fmt.Errorf("input string requried")
		}
		valueString, ok := value.(string)
		if !ok {
			return nil, fmt.Errorf("input string field must string type but got %T", valueString)
		}
		values := strings.Split(valueString, t.config.Separator)

		return map[string]any{"output": values}, nil
	default:
		return nil, fmt.Errorf("not support type %s", t.config.Type)
	}
}

func formatTpl(_ context.Context, tpl string, arrayVs map[string]bool) (formatedTpl string, err error) {
	matches := parserRegexp.FindAllStringSubmatch(tpl, -1)
	formattedTpl := tpl
	for _, match := range matches {
		if len(match) > 1 {
			tplVariable := match[1]
			if arrayVs[tplVariable] {
				tplVariable = tplVariable + "_join"
			}
			formattedTpl = strings.ReplaceAll(formattedTpl, match[0], fmt.Sprintf("{{%s}}", tplVariable))
		}
	}
	return formattedTpl, nil
}

func join(vs []any, concatChar string) string {
	as := make([]string, 0, len(vs))
	for _, v := range vs {
		if v == nil {
			as = append(as, "")
			continue
		}
		if _, ok := v.(map[string]any); ok {
			bs, _ := json.Marshal(v)
			as = append(as, string(bs))
			continue
		}

		as = append(as, fmt.Sprintf("%v", v))
	}
	return strings.Join(as, concatChar)
}
