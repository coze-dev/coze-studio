package crossknowledge

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
)

// TODO(@fanlv): 参数引用需要修改。
type Knowledge interface {
	ListKnowledge(ctx context.Context, request *knowledge.ListKnowledgeRequest) (response *knowledge.ListKnowledgeResponse, err error)
	Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) (*knowledge.RetrieveResponse, error)
}

var defaultSVC *impl

type impl struct {
	DomainSVC knowledge.Knowledge
}

func InitDomainService(c knowledge.Knowledge) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() Knowledge {
	return defaultSVC
}

func (i *impl) ListKnowledge(ctx context.Context, request *knowledge.ListKnowledgeRequest) (response *knowledge.ListKnowledgeResponse, err error) {
	return i.DomainSVC.ListKnowledge(ctx, request)
}

func (i *impl) Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) (*knowledge.RetrieveResponse, error) {
	return i.DomainSVC.Retrieve(ctx, req)
}
