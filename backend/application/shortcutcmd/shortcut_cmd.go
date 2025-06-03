package shortcutcmd

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
)

type ShortcutCmdApplicationService struct {
	ShortCutDomainSVC service.ShortcutCmd
}

func (s *ShortcutCmdApplicationService) Handler(ctx context.Context, req *playground.CreateUpdateShortcutCommandRequest) (*playground.ShortcutCommand, error) {

	cr, buildErr := s.buildReq(ctx, req)
	if buildErr != nil {
		return nil, buildErr
	}
	var err error
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
