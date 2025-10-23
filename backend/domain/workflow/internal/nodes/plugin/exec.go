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
package plugin

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	workflow3 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	crossplugin "github.com/coze-dev/coze-studio/backend/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	entity2 "github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func ExecutePlugin(ctx context.Context, input map[string]any, pe *vo.PluginEntity,
	toolID int64, cfg workflowModel.ExecuteConfig) (map[string]any, error) {
	args, err := sonic.MarshalString(input)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	var uID string
	if cfg.AgentID != nil {
		uID = cfg.ConnectorUID
	} else {
		uID = conv.Int64ToStr(cfg.Operator)
	}

	req := &model.ExecuteToolRequest{
		UserID:          uID,
		PluginID:        pe.PluginID,
		ToolID:          toolID,
		ExecScene:       consts.ExecSceneOfWorkflow,
		ArgumentsInJson: args,
		ExecDraftTool:   pe.PluginVersion == nil || *pe.PluginVersion == "0",
		PluginFrom:      pe.PluginFrom,
	}
	execOpts := []model.ExecuteToolOpt{
		model.WithInvalidRespProcessStrategy(consts.InvalidResponseProcessStrategyOfReturnDefault),
	}

	if pe.PluginVersion != nil {
		execOpts = append(execOpts, model.WithToolVersion(*pe.PluginVersion))
	}

	r, err := crossplugin.DefaultSVC().ExecuteTool(ctx, req, execOpts...)
	if err != nil {
		if extra, ok := compose.IsInterruptRerunError(err); ok {
			pluginTIE, ok := extra.(*model.ToolInterruptEvent)
			if !ok {
				return nil, vo.WrapError(errno.ErrPluginAPIErr, fmt.Errorf("expects ToolInterruptEvent, got %T", extra))
			}

			var eventType workflow3.EventType
			switch pluginTIE.Event {
			case consts.InterruptEventTypeOfToolNeedOAuth:
				eventType = workflow3.EventType_WorkflowOauthPlugin
			default:
				return nil, vo.WrapError(errno.ErrPluginAPIErr,
					fmt.Errorf("unsupported interrupt event type: %s", pluginTIE.Event))
			}

			id, err := workflow.GetRepository().GenID(ctx)
			if err != nil {
				return nil, vo.WrapError(errno.ErrIDGenError, err)
			}

			ie := &entity2.InterruptEvent{
				ID:            id,
				InterruptData: pluginTIE.ToolNeedOAuth.Message,
				EventType:     eventType,
			}

			// temporarily replace interrupt with real error, until frontend can handle plugin oauth interrupt
			interruptData := ie.InterruptData
			return nil, vo.NewError(errno.ErrAuthorizationRequired, errorx.KV("extra", interruptData))
		}
		return nil, err
	}

	var output map[string]any
	err = sonic.UnmarshalString(r.TrimmedResp, &output)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	return output, nil
}
