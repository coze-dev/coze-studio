package search

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
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
	{
		Key:    common.ActionKey_CrossSpaceCopy,
		Enable: true,
	},
}

type PackResource interface {
	GetDataInfo(ctx context.Context) (*dataInfo, error)
	GetActions(ctx context.Context) []*common.ResourceAction
}

func NewPackResource(resID int64, t common.ResType, appContext *ResourceApplicationService) PackResource {
	base := base{appContext: appContext, resID: resID}

	switch t {
	case common.ResType_Plugin:
		return &pluginPack{base: base}
	case common.ResType_Workflow:
		return &workflowPack{base: base}
	case common.ResType_Knowledge:
		return &knowledgePack{base: base}
	case common.ResType_Prompt:
		return &promptPack{base: base}
	case common.ResType_Database:
		return &databasePack{base: base}
	}

	return nil
}

type base struct {
	resID      int64
	appContext *ResourceApplicationService
}

type dataInfo struct {
	iconURI *string
	desc    *string
}

func (b *base) GetActions(ctx context.Context) []*common.ResourceAction {
	return defaultAction
}

type pluginPack struct {
	base
}

func (p *pluginPack) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	// p.base.resID 查询 plugin 信息
	return &dataInfo{
		iconURI: ptr.Of(""), // TODO(@mrh): fix me
		desc:    ptr.Of(""), // TODO(@mrh): fix me
	}, nil
}

type workflowPack struct {
	base
}

func (w *workflowPack) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	info, err := w.appContext.WorkflowDomainSVC.GetWorkflowDraft(ctx, w.resID)
	if err != nil {
		return nil, err
	}

	return &dataInfo{
		iconURI: &info.IconURI,
		desc:    &info.Desc,
	}, nil
}

type knowledgePack struct {
	base
}

func (k *knowledgePack) GetDataInfo(ctx context.Context) (*dataInfo, error) {
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

type promptPack struct {
	base
}

func (p *promptPack) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	pInfo, err := p.appContext.PromptDomainSVC.GetPromptResource(ctx, p.resID)
	if err != nil {
		return nil, err
	}
	return &dataInfo{
		iconURI: nil, // prompt don't have icon
		desc:    &pInfo.Description,
	}, nil
}

type databasePack struct {
	base
}

func (d *databasePack) GetDataInfo(ctx context.Context) (*dataInfo, error) {
	// TODO(@liujian)
	return &dataInfo{}, nil
}
