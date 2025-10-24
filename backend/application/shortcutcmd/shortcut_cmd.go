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

package shortcutcmd

import (
	"context"
	"fmt"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"

	"github.com/coze-dev/coze-studio/backend/domain/permission"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
)

type ShortcutCmdApplicationService struct {
	ShortCutDomainSVC service.ShortcutCmd
}

func checkPermission(ctx context.Context, uid int64, spaceID int64, workflowID int64) error {
	// Use permission service to check workspace access

	rd := []*permission.ResourceIdentifier{
		{
			Type:   permission.ResourceTypeWorkspace,
			ID:     []int64{spaceID},
			Action: permission.ActionRead,
		},
	}
	if workflowID > 0 {
		rd = append(rd, &permission.ResourceIdentifier{
			Type:   permission.ResourceTypeWorkflow,
			ID:     []int64{workflowID},
			Action: permission.ActionRead,
		})
	}

	result, err := permission.DefaultSVC().CheckAuthz(ctx, &permission.CheckAuthzData{
		ResourceIdentifier: rd,
		OperatorID:         uid,
	})
	if err != nil {
		return fmt.Errorf("failed to check workspace permission: %w", err)
	}

	if result.Decision != permission.Allow {
		return fmt.Errorf("user %d does not have access to space %d", uid, spaceID)
	}

	return nil
}

func (s *ShortcutCmdApplicationService) Handler(ctx context.Context, req *playground.CreateUpdateShortcutCommandRequest) (*playground.ShortcutCommand, error) {

	var err error
	uid := ctxutil.MustGetUIDFromCtx(ctx)

	cr, buildErr := s.buildReq(ctx, req)
	if buildErr != nil {
		return nil, buildErr
	}

	err = checkPermission(ctx, uid, req.GetSpaceID(), cr.WorkFlowID)
	if err != nil {
		return nil, err
	}

	var cmdDO *entity.ShortcutCmd
	if cr.CommandID > 0 {
		cmdDO, err = s.ShortCutDomainSVC.UpdateCMD(ctx, cr)
	} else {
		cmdDO, err = s.ShortCutDomainSVC.CreateCMD(ctx, cr)
	}

	if err != nil {
		return nil, err
	}

	if cmdDO == nil {
		return nil, nil
	}
	return s.buildDo2Vo(ctx, cmdDO), nil
}
func (s *ShortcutCmdApplicationService) buildReq(ctx context.Context, req *playground.CreateUpdateShortcutCommandRequest) (*entity.ShortcutCmd, error) {

	uid := ctxutil.MustGetUIDFromCtx(ctx)

	var workflowID int64
	var pluginID int64
	var err error
	if req.GetShortcuts().GetWorkFlowID() != "" {
		workflowID, err = strconv.ParseInt(req.GetShortcuts().GetWorkFlowID(), 10, 64)
		if err != nil {
			return nil, err
		}
	}

	if req.GetShortcuts().GetPluginID() != "" {
		pluginID, err = strconv.ParseInt(req.GetShortcuts().GetPluginID(), 10, 64)
		if err != nil {
			return nil, err
		}
	}

	return &entity.ShortcutCmd{
		ObjectID:        req.GetObjectID(),
		CommandID:       req.GetShortcuts().CommandID,
		CommandName:     req.GetShortcuts().CommandName,
		ShortcutCommand: req.GetShortcuts().ShortcutCommand,
		Description:     req.GetShortcuts().Description,
		SendType:        int32(req.GetShortcuts().SendType),
		ToolType:        int32(req.GetShortcuts().ToolType),
		WorkFlowID:      workflowID,
		PluginID:        pluginID,
		Components:      req.GetShortcuts().ComponentsList,
		CardSchema:      req.GetShortcuts().CardSchema,
		ToolInfo:        req.GetShortcuts().ToolInfo,
		CreatorID:       uid,
		PluginToolID:    req.GetShortcuts().PluginAPIID,
		PluginToolName:  req.GetShortcuts().PluginAPIName,
		TemplateQuery:   req.GetShortcuts().TemplateQuery,
		ShortcutIcon:    req.GetShortcuts().ShortcutIcon,
		Source:          int32(req.GetShortcuts().GetPluginFrom()),
	}, nil
}

func (s *ShortcutCmdApplicationService) buildDo2Vo(ctx context.Context, do *entity.ShortcutCmd) *playground.ShortcutCommand {

	return &playground.ShortcutCommand{
		ObjectID:        do.ObjectID,
		CommandID:       do.CommandID,
		CommandName:     do.CommandName,
		ShortcutCommand: do.ShortcutCommand,
		Description:     do.Description,
		SendType:        playground.SendType(do.SendType),
		ToolType:        playground.ToolType(do.ToolType),
		WorkFlowID:      conv.Int64ToStr(do.WorkFlowID),
		PluginID:        conv.Int64ToStr(do.PluginID),
		ComponentsList:  do.Components,
		CardSchema:      do.CardSchema,
		ToolInfo:        do.ToolInfo,
		PluginAPIID:     do.PluginToolID,
		PluginAPIName:   do.PluginToolName,
		TemplateQuery:   do.TemplateQuery,
		ShortcutIcon:    do.ShortcutIcon,
	}
}
