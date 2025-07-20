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

package nodes

import (
	"context"
	"fmt"
	"sync"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type ParentIntermediateStore struct {
	mu sync.RWMutex
}

type IntermediateVarKey struct{}

func (p *ParentIntermediateStore) Init(_ context.Context) {
	return
}

func (p *ParentIntermediateStore) Get(ctx context.Context, path compose.FieldPath, opts ...variable.OptionFn) (any, error) {
	defer p.mu.RUnlock()
	p.mu.RLock()

	if len(path) != 1 {
		return nil, fmt.Errorf("invalid path: %v", path)
	}

	ivs := getIntermediateVars(ctx)
	v, ok := ivs.vars[path[0]]
	if !ok {
		return nil, fmt.Errorf("variable not found: %s", path[0])
	}

	if *v == nil {
		return ivs.types[path[0]].Zero(), nil
	}

	return *v, nil
}

func (p *ParentIntermediateStore) Set(ctx context.Context, path compose.FieldPath, value any, opts ...variable.OptionFn) error {
	defer p.mu.Unlock()
	p.mu.Lock()

	if len(path) != 1 {
		return fmt.Errorf("invalid path: %v", path)
	}

	ivs := getIntermediateVars(ctx)
	v, ok := ivs.vars[path[0]]
	if !ok {
		return fmt.Errorf("variable not found: %s", path[0])
	}

	if value == nil {
		*v = ivs.types[path[0]].Zero()
	} else {
		*v = value
	}

	return nil
}

type intermediateVar struct {
	vars  map[string]*any
	types map[string]*vo.TypeInfo
}

func InitIntermediateVars(ctx context.Context, vars map[string]*any, typeInfos map[string]*vo.TypeInfo) context.Context {
	return context.WithValue(ctx, IntermediateVarKey{}, &intermediateVar{
		vars:  vars,
		types: typeInfos,
	})
}

func getIntermediateVars(ctx context.Context) *intermediateVar {
	return ctx.Value(IntermediateVarKey{}).(*intermediateVar)
}
