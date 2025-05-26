package search

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	dbentity "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	dbservice "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
	desc    *string
}

func (b *resourceBasePacker) GetActions(ctx context.Context) []*common.ResourceAction {
	return defaultAction
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
	return &dataInfo{
		iconURI: ptr.Of(res.Plugin.GetIconURI()),
		desc:    ptr.Of(res.Plugin.GetDesc()),
	}, nil
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
		desc:    &info.Desc,
	}, nil
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
		desc:    ptr.Of(listResp.KnowledgeList[0].Description),
	}, nil
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
		iconURI: nil, // prompt don't have icon
		desc:    &pInfo.Description,
	}, nil
}

type databasePacker struct {
	resourceBasePacker
}

func (d *databasePacker) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	listResp, err := d.appContext.DatabaseDomainSVC.MGetDatabase(ctx, &dbservice.MGetDatabaseRequest{Basics: []*dbentity.DatabaseBasic{
		{
			ID:        d.resID,
			TableType: dbentity.TableType_OnlineTable,
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
