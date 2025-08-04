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
	"errors"
	"fmt"
	"strings"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type VariableAssigner struct {
	config *Config
}

type Config struct {
	Pairs   []*Pair
	Handler *variable.Handler
}

type Pair struct {
	Left  vo.Reference
	Right compose.FieldPath
}

func NewVariableAssigner(_ context.Context, conf *Config) (*VariableAssigner, error) {
	for _, pair := range conf.Pairs {
		if pair.Left.VariableType == nil {
			return nil, fmt.Errorf("cannot assign to output of nodes in VariableAssigner, ref: %v", pair.Left)
		}

		if *pair.Left.VariableType == vo.GlobalSystem {
			return nil, fmt.Errorf("cannot assign to global system variables in VariableAssigner because they are read-only, ref: %v", pair.Left)
		}

		vType := *pair.Left.VariableType
		if vType != vo.GlobalAPP && vType != vo.GlobalUser {
			return nil, fmt.Errorf("cannot assign to variable type %s in VariableAssigner", vType)
		}
	}

	return &VariableAssigner{
		config: conf,
	}, nil
}

func (v *VariableAssigner) Assign(ctx context.Context, in map[string]any) (map[string]any, error) {
	for _, pair := range v.config.Pairs {
		right, ok := nodes.TakeMapValue(in, pair.Right)
		if !ok {
			return nil, vo.NewError(errno.ErrInputFieldMissing, errorx.KV("name", strings.Join(pair.Right, ".")))
		}

		vType := *pair.Left.VariableType
		switch vType {
		case vo.GlobalAPP:
			appVS := execute.GetAppVarStore(ctx)
			if appVS == nil {
				return nil, errors.New("exeCtx or AppVarStore not found for variable assigner")
			}

			if len(pair.Left.FromPath) != 1 {
				return nil, fmt.Errorf("can only assign to top level variable: %v", pair.Left.FromPath)
			}

			appVS.Set(pair.Left.FromPath[0], right)
		case vo.GlobalUser:
			opts := make([]variable.OptionFn, 0, 1)
			if exeCtx := execute.GetExeCtx(ctx); exeCtx != nil {
				exeCfg := exeCtx.RootCtx.ExeCfg
				opts = append(opts, variable.WithStoreInfo(variable.StoreInfo{
					AgentID:      exeCfg.AgentID,
					AppID:        exeCfg.AppID,
					ConnectorID:  exeCfg.ConnectorID,
					ConnectorUID: exeCfg.ConnectorUID,
				}))
			}
			err := v.config.Handler.Set(ctx, *pair.Left.VariableType, pair.Left.FromPath, right, opts...)
			if err != nil {
				return nil, vo.WrapIfNeeded(errno.ErrVariablesAPIFail, err)
			}
		default:
			panic("impossible")
		}
	}

	// TODO if not error considered successful
	return map[string]any{
		"isSuccess": true,
	}, nil
}
