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

package receiver

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	workflow0 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	sonic2 "github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Config struct {
	OutputSchema string
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	c.OutputSchema = n.Data.Inputs.OutputSchema

	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeInputReceiver,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (c *Config) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	nodeMeta := entity.NodeMetaByNodeType(entity.NodeTypeInputReceiver)
	if nodeMeta == nil {
		return nil, errors.New("node meta not found for input receiver")
	}

	interruptData := map[string]string{
		"content_type": "form_schema",
		"content":      c.OutputSchema,
	}

	interruptDataStr, err := sonic.ConfigStd.MarshalToString(interruptData) // keep the order of the keys
	if err != nil {
		return nil, err
	}

	return &InputReceiver{
		outputTypes:   ns.OutputTypes, // so the node can refer to its output types during execution
		nodeMeta:      *nodeMeta,
		nodeKey:       ns.Key,
		interruptData: interruptDataStr,
	}, nil
}

func (c *Config) RequireCheckpoint() bool {
	return true
}

type InputReceiver struct {
	outputTypes   map[string]*vo.TypeInfo
	interruptData string
	nodeKey       vo.NodeKey
	nodeMeta      entity.NodeTypeMeta
}

const (
	interruptedKey     = "&interrupted"
	receiverWarningKey = "receiver_warning_%d_%s"
)

func (i *InputReceiver) Invoke(ctx context.Context, _ map[string]any) (map[string]any, error) {
	var (
		resumeData string
		resumed    bool
		err        error
	)

	_ = compose.ProcessState(ctx, func(_ context.Context, s nodes.InterruptEventStore) error {
		resumeData, resumed = s.GetAndClearResumeData(i.nodeKey)
		return nil
	})

	if !resumed {
		var previouslyInterrupted bool
		_ = compose.ProcessState(ctx, func(_ context.Context, state nodes.IntermediateResultStore) error {
			irs := state.GetIntermediateResult(i.nodeKey)
			if len(irs) > 0 {
				_, previouslyInterrupted = irs[interruptedKey]
				if !previouslyInterrupted {
					state.SetIntermediateResult(i.nodeKey, map[string]any{interruptedKey: true})
				}
			}
			return nil
		})

		if previouslyInterrupted {
			return nil, compose.InterruptAndRerun
		}

		eventID, err := workflow.GetRepository().GenID(ctx)
		if err != nil {
			return nil, vo.WrapError(errno.ErrIDGenError, err)
		}
		return nil, compose.NewInterruptAndRerunErr(&entity.InterruptEvent{
			ID:            eventID,
			NodeKey:       i.nodeKey,
			NodeType:      entity.NodeTypeInputReceiver,
			NodeTitle:     i.nodeMeta.Name,
			NodeIcon:      i.nodeMeta.IconURI,
			InterruptData: i.interruptData,
			EventType:     entity.InterruptEventInput,
		})
	}

	exeCfg := execute.GetExeCtx(ctx).ExeCfg
	if exeCfg.BizType == workflowModel.BizTypeAgent || exeCfg.WorkflowMode == workflow0.WorkflowMode_ChatFlow {
		m := make(map[string]any)
		sList := strings.Split(resumeData, "\n")
		for _, s := range sList {
			firstColon := strings.Index(s, ":")
			k := s[:firstColon]
			v := s[firstColon+1:]
			m[k] = v
		}
		resumeData, err = sonic.MarshalString(m)
		if err != nil {
			return nil, err
		}
	}

	out, err := jsonParseRelaxed(ctx, resumeData, i.outputTypes)
	if err != nil {
		return nil, err
	}

	return out, nil
}

func jsonParseRelaxed(ctx context.Context, data string, schema_ map[string]*vo.TypeInfo) (map[string]any, error) {
	var result map[string]any

	err := sonic2.UnmarshalString(data, &result)
	if err != nil {
		return nil, err
	}

	r, ws, err := nodes.ConvertInputs(ctx, result, schema_, nodes.SkipUnknownFields())
	if err != nil {
		return nil, err
	}
	if ws != nil && len(*ws) > 0 {
		logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
		var (
			executeID int64
			nodeKey   vo.NodeKey
		)
		if c := execute.GetExeCtx(ctx); c != nil {
			executeID = c.RootExecuteID
			nodeKey = c.NodeKey
		}

		warningKey := fmt.Sprintf(receiverWarningKey, executeID, nodeKey)
		ctxcache.Store(ctx, warningKey, *ws)
	}

	return r, nil
}

func (i *InputReceiver) ToCallbackOutput(ctx context.Context, output map[string]any) (
	*nodes.StructuredCallbackOutput, error) {
	var (
		executeID int64
		nodeKey   vo.NodeKey
	)
	if c := execute.GetExeCtx(ctx); c != nil {
		executeID = c.RootExecuteID
		nodeKey = c.NodeKey
	}

	warningKey := fmt.Sprintf(receiverWarningKey, executeID, nodeKey)

	var wfe vo.WorkflowError
	if warnings, ok := ctxcache.Get[nodes.ConversionWarnings](ctx, warningKey); ok {
		wfe = vo.WrapWarn(errno.ErrNodeOutputParseFail, warnings, errorx.KV("warnings", warnings.Error()))
	}
	return &nodes.StructuredCallbackOutput{
		Output: output,
		Error:  wfe,
		Input:  output, // set input to be the same as output
	}, nil
}
