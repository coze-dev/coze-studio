package agentflow

import (
	"context"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type retrieverConfig struct {
	knowledgeConfig *agent_common.Knowledge
	svr             crossdomain.Knowledge
}

func newKnowledgeRetriever(_ context.Context, conf *retrieverConfig) (*knowledgeRetriever, error) {
	return &knowledgeRetriever{
		knowledgeConfig: conf.knowledgeConfig,
		svr:             conf.svr,
	}, nil
}

type knowledgeRetriever struct {
	knowledgeConfig *agent_common.Knowledge
	svr             crossdomain.Knowledge
}

func (r *knowledgeRetriever) Retrieve(ctx context.Context, req *AgentRequest) ([]*schema.Document, error) {

	knowledgeIDs := slices.Transform(r.knowledgeConfig.KnowledgeInfo, func(a *agent_common.KnowledgeInfo) int64 {
		id, _ := strconv.ParseInt(a.GetId(), 10, 64)
		return id
	})

	kr, err := genKnowledgeRequest(ctx, knowledgeIDs, r.knowledgeConfig)
	if err != nil {
		return nil, err
	}

	kr.Input = req.Input
	kr.History = req.History

	resp, err := r.svr.Retrieve(ctx, kr)
	if err != nil {
		return nil, err
	}

	return resp.Data, nil
}
