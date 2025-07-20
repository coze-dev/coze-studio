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

package variableassigner

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
)

type InLoop struct {
	config               *Config
	intermediateVarStore variable.Store
}

func NewVariableAssignerInLoop(_ context.Context, conf *Config) (*InLoop, error) {
	return &InLoop{
		config:               conf,
		intermediateVarStore: &nodes.ParentIntermediateStore{},
	}, nil
}

func (v *InLoop) Assign(ctx context.Context, in map[string]any) (out map[string]any, err error) {
	for _, pair := range v.config.Pairs {
		if pair.Left.VariableType == nil || *pair.Left.VariableType != vo.ParentIntermediate {
			panic(fmt.Errorf("dest is %+v in VariableAssignerInloop, invalid", pair.Left))
		}

		right, ok := nodes.TakeMapValue(in, pair.Right)
		if !ok {
			return nil, fmt.Errorf("failed to extract right value for path %s", pair.Right)
		}

		err := v.intermediateVarStore.Set(ctx, pair.Left.FromPath, right)
		if err != nil {
			return nil, err
		}
	}

	return map[string]any{}, nil
}
