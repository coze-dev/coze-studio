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

package entry

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
)

type Config struct {
	DefaultValues map[string]any
	OutputTypes   map[string]*vo.TypeInfo
}

type Entry struct {
	cfg           *Config
	defaultValues map[string]any
}

func NewEntry(ctx context.Context, cfg *Config) (*Entry, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config is requried")
	}
	defaultValues, _, err := nodes.ConvertInputs(ctx, cfg.DefaultValues, cfg.OutputTypes, nodes.FailFast(), nodes.SkipRequireCheck())
	if err != nil {
		return nil, err
	}

	return &Entry{
		cfg:           cfg,
		defaultValues: defaultValues,
	}, nil

}

func (e *Entry) Invoke(_ context.Context, in map[string]any) (out map[string]any, err error) {

	for k, v := range e.defaultValues {
		if val, ok := in[k]; ok {
			tInfo := e.cfg.OutputTypes[k]
			switch tInfo.Type {
			case vo.DataTypeString:
				if len(val.(string)) == 0 {
					in[k] = v
				}
			case vo.DataTypeArray:
				if len(val.([]any)) == 0 {
					in[k] = v
				}
			case vo.DataTypeObject:
				if len(val.(map[string]any)) == 0 {
					in[k] = v
				}
			}
		} else {
			in[k] = v
		}
	}

	return in, err
}
