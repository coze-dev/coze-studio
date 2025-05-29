package knowledge

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossknowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
)

var defaultSVC crossknowledge.Knowledge

type impl struct {
	DomainSVC knowledge.Knowledge
}

func InitDomainService(c knowledge.Knowledge) crossknowledge.Knowledge {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i *impl) ListKnowledge(ctx context.Context, request *model.ListKnowledgeRequest) (response *model.ListKnowledgeResponse, err error) {
	return i.DomainSVC.ListKnowledge(ctx, request)
}

func (i *impl) Retrieve(ctx context.Context, req *model.RetrieveRequest) (*model.RetrieveResponse, error) {
	return i.DomainSVC.Retrieve(ctx, req)
}
