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

package textprocessor

import (
	"context"
	"fmt"
	"reflect"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type Type string

const (
	ConcatText Type = "concat"
	SplitText  Type = "split"
)

type Config struct {
	Type       Type     `json:"type"`
	Tpl        string   `json:"tpl"`
	ConcatChar string   `json:"concatChar"`
	Separators []string `json:"separator"`
}

func (c *Config) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeTextProcessor,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	if n.Data.Inputs.Method == vo.Concat {
		c.Type = ConcatText
		params := n.Data.Inputs.ConcatParams
		for _, param := range params {
			if param.Name == "concatResult" {
				c.Tpl = param.Input.Value.Content.(string)
			} else if param.Name == "arrayItemConcatChar" {
				c.ConcatChar = param.Input.Value.Content.(string)
			}
		}
	} else if n.Data.Inputs.Method == vo.Split {
		c.Type = SplitText
		params := n.Data.Inputs.SplitParams
		separators := make([]string, 0, len(params))
		for _, param := range params {
			if param.Name == "delimiters" {
				delimiters := param.Input.Value.Content.([]any)
				for _, d := range delimiters {
					separators = append(separators, d.(string))
				}
			}
		}
		c.Separators = separators

	} else {
		return nil, fmt.Errorf("not supported method: %s", n.Data.Inputs.Method)
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (c *Config) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if c.Type == ConcatText && len(c.Tpl) == 0 {
		return nil, fmt.Errorf("config tpl requried")
	}

	return &TextProcessor{
		typ:         c.Type,
		tpl:         c.Tpl,
		concatChar:  c.ConcatChar,
		separators:  c.Separators,
		fullSources: ns.FullSources,
	}, nil
}

type TextProcessor struct {
	typ         Type
	tpl         string
	concatChar  string
	separators  []string
	fullSources map[string]*schema.SourceInfo
}

const OutputKey = "output"

func (t *TextProcessor) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	switch t.typ {
	case ConcatText:
		arrayRenderer := func(i any) (string, error) {
			vs := i.([]any)
			return join(vs, t.concatChar)
		}

		result, err := nodes.Render(ctx, t.tpl, input, t.fullSources,
			nodes.WithCustomRender(reflect.TypeOf([]any{}), arrayRenderer))
		if err != nil {
			return nil, err
		}

		return map[string]any{OutputKey: result}, nil
	case SplitText:
		value, ok := input["String"]
		if !ok {
			return nil, fmt.Errorf("input string requried")
		}

		valueString, ok := value.(string)
		if !ok {
			return nil, fmt.Errorf("input string field must string type but got %T", valueString)
		}
		values := strings.Split(valueString, t.separators[0])
		// Iterate over each delimiter
		for _, sep := range t.separators[1:] {
			var tempParts []string
			for _, part := range values {
				tempParts = append(tempParts, strings.Split(part, sep)...)
			}
			values = tempParts
		}
		anyValues := make([]any, 0, len(values))
		for _, v := range values {
			anyValues = append(anyValues, v)
		}

		return map[string]any{OutputKey: anyValues}, nil
	default:
		return nil, fmt.Errorf("not support type %s", t.typ)
	}
}

func join(vs []any, concatChar string) (string, error) {
	as := make([]string, 0, len(vs))
	for _, v := range vs {
		if v == nil {
			as = append(as, "")
			continue
		}
		if _, ok := v.(map[string]any); ok {
			bs, err := sonic.Marshal(v)
			if err != nil {
				return "", err
			}
			as = append(as, string(bs))
			continue
		}

		as = append(as, fmt.Sprintf("%v", v))
	}
	return strings.Join(as, concatChar), nil
}
