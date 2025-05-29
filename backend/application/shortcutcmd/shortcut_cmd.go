package shortcutcmd

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/service"
)

type ShortcutCmdApplicationService struct {
	ShortCutDomainSVC service.ShortcutCmd
}

func (s *ShortcutCmdApplicationService) Handler(ctx context.Context, req *playground.CreateUpdateShortcutCommandRequest) (*playground.ShortcutCommand, error) {

	cr := s.buildReq(ctx, req)
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
func (s *ShortcutCmdApplicationService) buildReq(ctx context.Context, req *playground.CreateUpdateShortcutCommandRequest) *entity.ShortcutCmd {

	uid := ctxutil.MustGetUIDFromCtx(ctx)
	return &entity.ShortcutCmd{
		ObjectID:        req.GetObjectID(),
		CommandID:       req.GetShortcuts().CommandID,
		CommandName:     req.GetShortcuts().CommandName,
		ShortcutCommand: req.GetShortcuts().ShortcutCommand,
		Description:     req.GetShortcuts().Description,
		SendType:        int32(req.GetShortcuts().SendType),
		ToolType:        int32(req.GetShortcuts().ToolType),
		WorkFlowID:      req.GetShortcuts().WorkFlowID,
		PluginID:        req.GetShortcuts().PluginID,
		Components:      req.GetShortcuts().ComponentsList,
		CardSchema:      req.GetShortcuts().CardSchema,
		ToolInfo:        req.GetShortcuts().ToolInfo,
		CreatorID:       uid,
		PluginToolID:    req.GetShortcuts().PluginAPIID,
		PluginToolName:  req.GetShortcuts().PluginAPIName,
		TemplateQuery:   req.GetShortcuts().TemplateQuery,
		ShortcutIcon:    req.GetShortcuts().ShortcutIcon,
	}
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
		WorkFlowID:      do.WorkFlowID,
		PluginID:        do.PluginID,
		ComponentsList:  do.Components,
		CardSchema:      do.CardSchema,
		ToolInfo:        do.ToolInfo,
		PluginAPIID:     do.PluginToolID,
		PluginAPIName:   do.PluginToolName,
		TemplateQuery:   do.TemplateQuery,
		ShortcutIcon:    do.ShortcutIcon,
	}
}
