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

	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type Type string

const (
	ConcatText Type = "concat"
	SplitText  Type = "split"
)

type Config struct {
	Type        Type                         `json:"type"`
	Tpl         string                       `json:"tpl"`
	ConcatChar  string                       `json:"concatChar"`
	Separators  []string                     `json:"separator"`
	FullSources map[string]*nodes.SourceInfo `json:"fullSources"`
}

type TextProcessor struct {
	config *Config
}

func NewTextProcessor(_ context.Context, cfg *Config) (*TextProcessor, error) {
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

const OutputKey = "output"

func (t *TextProcessor) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	switch t.config.Type {
	case ConcatText:
		arrayRenderer := func(i any) (string, error) {
			vs := i.([]any)
			return join(vs, t.config.ConcatChar)
		}

		result, err := nodes.Render(ctx, t.config.Tpl, input, t.config.FullSources,
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
		values := strings.Split(valueString, t.config.Separators[0])
		// Iterate over each delimiter
		for _, sep := range t.config.Separators[1:] {
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
		return nil, fmt.Errorf("not support type %s", t.config.Type)
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
