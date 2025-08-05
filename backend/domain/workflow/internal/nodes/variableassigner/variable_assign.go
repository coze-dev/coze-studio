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
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type VariableAssigner struct {
	pairs   []*Pair
	handler *variable.Handler
}

type Config struct {
	Pairs []*Pair
}

func (c *Config) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeVariableAssigner,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	var pairs = make([]*Pair, 0, len(n.Data.Inputs.InputParameters))
	for i, param := range n.Data.Inputs.InputParameters {
		if param.Left == nil || param.Input == nil {
			return nil, fmt.Errorf("variable assigner node's param left or input is nil")
		}

		leftSources, err := convert.CanvasBlockInputToFieldInfo(param.Left, compose.FieldPath{fmt.Sprintf("left_%d", i)}, n.Parent())
		if err != nil {
			return nil, err
		}

		if leftSources[0].Source.Ref == nil {
			return nil, fmt.Errorf("variable assigner node's param left source ref is nil")
		}

		if leftSources[0].Source.Ref.VariableType == nil {
			return nil, fmt.Errorf("variable assigner node's param left source ref's variable type is nil")
		}

		if *leftSources[0].Source.Ref.VariableType == vo.GlobalSystem {
			return nil, fmt.Errorf("variable assigner node's param left's ref's variable type cannot be variable.GlobalSystem")
		}

		inputSource, err := convert.CanvasBlockInputToFieldInfo(param.Input, leftSources[0].Source.Ref.FromPath, n.Parent())
		if err != nil {
			return nil, err
		}
		ns.AddInputSource(inputSource...)
		pair := &Pair{
			Left:  *leftSources[0].Source.Ref,
			Right: inputSource[0].Path,
		}
		pairs = append(pairs, pair)
	}

	c.Pairs = pairs

	return ns, nil
}

func (c *Config) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	for _, pair := range c.Pairs {
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
		pairs:   c.Pairs,
		handler: variable.GetVariableHandler(),
	}, nil
}

type Pair struct {
	Left  vo.Reference
	Right compose.FieldPath
}

func (v *VariableAssigner) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {
	for _, pair := range v.pairs {
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
			err := v.handler.Set(ctx, *pair.Left.VariableType, pair.Left.FromPath, right, opts...)
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
