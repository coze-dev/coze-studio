package search

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	dbservice "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

var defaultAction = []*common.ResourceAction{
	{
		Key:    common.ActionKey_Edit,
		Enable: true,
	},
	{
		Key:    common.ActionKey_Delete,
		Enable: true,
	},
}

type ResourcePacker interface {
	GetDataInfo(ctx context.Context) (*dataInfo, error)
	GetActions(ctx context.Context) []*common.ResourceAction
	GetProjectActions(ctx context.Context) []*common.ProjectResourceAction
}

func NewResourcePacker(resID int64, t common.ResType, appContext *ServiceComponents) (ResourcePacker, error) {
	base := resourceBasePacker{appContext: appContext, resID: resID}

	switch t {
	case common.ResType_Plugin:
		return &pluginPacker{resourceBasePacker: base}, nil
	case common.ResType_Workflow:
		return &workflowPacker{resourceBasePacker: base}, nil
	case common.ResType_Knowledge:
		return &knowledgePacker{resourceBasePacker: base}, nil
	case common.ResType_Prompt:
		return &promptPacker{resourceBasePacker: base}, nil
	case common.ResType_Database:
		return &databasePacker{resourceBasePacker: base}, nil
	}

	return nil, fmt.Errorf("unsupported resource type: %s , resID: %d", t, resID)
}

type resourceBasePacker struct {
	resID      int64
	appContext *ServiceComponents
}

type dataInfo struct {
	iconURI *string
	iconURL string
	desc    *string
}

func (b *resourceBasePacker) GetActions(ctx context.Context) []*common.ResourceAction {
	return defaultAction
}

func (b *resourceBasePacker) GetProjectActions(ctx context.Context) []*common.ProjectResourceAction {
	return []*common.ProjectResourceAction{}
}

type pluginPacker struct {
	resourceBasePacker
}

func (p *pluginPacker) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	res, err := p.appContext.PluginDomainSVC.GetDraftPlugin(ctx, &service.GetDraftPluginRequest{
		PluginID: p.resID,
	})
	if err != nil {
		return nil, err
	}

	iconURL, err := p.appContext.TOS.GetObjectUrl(ctx, res.Plugin.GetIconURI())
	if err != nil {
		logs.CtxWarnf(ctx, "get icon url failed with '%s', err=%v", res.Plugin.GetIconURI(), err)
	}

	return &dataInfo{
		iconURI: ptr.Of(res.Plugin.GetIconURI()),
		iconURL: iconURL,
		desc:    ptr.Of(res.Plugin.GetDesc()),
	}, nil
}

func (p *pluginPacker) GetProjectActions(ctx context.Context) []*common.ProjectResourceAction {
	return []*common.ProjectResourceAction{
		{
			Key:    common.ProjectResourceActionKey_Rename,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Copy,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Delete,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_CopyToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_MoveToLibrary,
			Enable: true,
		},
	}
}

type workflowPacker struct {
	resourceBasePacker
}

func (w *workflowPacker) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	info, err := w.appContext.WorkflowDomainSVC.GetWorkflowDraft(ctx, w.resID)
	if err != nil {
		return nil, err
	}

	return &dataInfo{
		iconURI: &info.IconURI,
		iconURL: info.IconURL,
		desc:    &info.Desc,
	}, nil
}

func (w *workflowPacker) GetProjectActions(ctx context.Context) []*common.ProjectResourceAction {
	return []*common.ProjectResourceAction{
		{
			Key:    common.ProjectResourceActionKey_Rename,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Copy,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_CopyToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_MoveToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Delete,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_UpdateDesc,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_SwitchToChatflow,
			Enable: true,
		},
	}
}

type knowledgePacker struct {
	resourceBasePacker
}

func (k *knowledgePacker) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	listResp, err := k.appContext.KnowledgeDomainSVC.ListKnowledge(ctx, &knowledge.ListKnowledgeRequest{IDs: []int64{k.resID}})
	if err != nil {
		return nil, err
	}
	if len(listResp.KnowledgeList) == 0 {
		return nil, fmt.Errorf("knowledge not found by id: %d", k.resID)
	}

	return &dataInfo{
		iconURI: ptr.Of(listResp.KnowledgeList[0].IconURI),
		iconURL: listResp.KnowledgeList[0].IconURL,
		desc:    ptr.Of(listResp.KnowledgeList[0].Description),
	}, nil
}

func (k *knowledgePacker) GetProjectActions(ctx context.Context) []*common.ProjectResourceAction {
	return []*common.ProjectResourceAction{
		{
			Key:    common.ProjectResourceActionKey_Rename,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Copy,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_CopyToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_MoveToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Delete,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Disable,
			Enable: true,
		},
	}
}

type promptPacker struct {
	resourceBasePacker
}

func (p *promptPacker) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	pInfo, err := p.appContext.PromptDomainSVC.GetPromptResource(ctx, p.resID)
	if err != nil {
		return nil, err
	}
	return &dataInfo{
		iconURI: nil, // prompt don't have custom icon
		iconURL: "",
		desc:    &pInfo.Description,
	}, nil
}

type databasePacker struct {
	resourceBasePacker
}

func (d *databasePacker) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	listResp, err := d.appContext.DatabaseDomainSVC.MGetDatabase(ctx, &dbservice.MGetDatabaseRequest{Basics: []*database.DatabaseBasic{
		{
			ID:        d.resID,
			TableType: database.TableType_OnlineTable,
		},
	}})
	if err != nil {
		return nil, err
	}
	if len(listResp.Databases) == 0 {
		return nil, fmt.Errorf("online database not found, id: %d", d.resID)
	}

	return &dataInfo{
		iconURI: ptr.Of(listResp.Databases[0].IconURI),
		iconURL: listResp.Databases[0].IconURL,
		desc:    ptr.Of(listResp.Databases[0].Description),
	}, nil
}

func (d *databasePacker) GetActions(ctx context.Context) []*common.ResourceAction {
	return []*common.ResourceAction{
		{
			Key:    common.ActionKey_Delete,
			Enable: true,
		},
	}
}

func (d *databasePacker) GetProjectActions(ctx context.Context) []*common.ProjectResourceAction {
	return []*common.ProjectResourceAction{
		{
			Key:    common.ProjectResourceActionKey_Copy,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_CopyToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_MoveToLibrary,
			Enable: true,
		},
		{
			Key:    common.ProjectResourceActionKey_Delete,
			Enable: true,
		},
	}
}
