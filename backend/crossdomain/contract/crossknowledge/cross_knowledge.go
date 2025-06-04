package crossknowledge

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
)

type Knowledge interface {
	ListKnowledge(ctx context.Context, request *knowledge.ListKnowledgeRequest) (response *knowledge.ListKnowledgeResponse, err error)
	GetKnowledgeByID(ctx context.Context, request *knowledge.GetKnowledgeByIDRequest) (response *knowledge.GetKnowledgeByIDResponse, err error)
	Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) (*knowledge.RetrieveResponse, error)
	DeleteKnowledge(ctx context.Context, request *knowledge.DeleteKnowledgeRequest) error
}

var defaultSVC Knowledge

func DefaultSVC() Knowledge {
	return defaultSVC
}

func SetDefaultSVC(c Knowledge) {
	defaultSVC = c
}
