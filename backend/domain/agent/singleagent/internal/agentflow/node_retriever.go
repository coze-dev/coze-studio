package agentflow

import (
	"context"
	"strconv"

	"github.com/cloudwego/eino/schema"

	knowledgeModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossknowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	knowledgeEntity "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type retrieverConfig struct {
	knowledgeConfig *bot_common.Knowledge
}

func newKnowledgeRetriever(_ context.Context, conf *retrieverConfig) (*knowledgeRetriever, error) {
	return &knowledgeRetriever{
		knowledgeConfig: conf.knowledgeConfig,
	}, nil
}

type knowledgeRetriever struct {
	knowledgeConfig *bot_common.Knowledge
}

func (r *knowledgeRetriever) Retrieve(ctx context.Context, req *AgentRequest) ([]*schema.Document, error) {
	if r.knowledgeConfig == nil || len(r.knowledgeConfig.KnowledgeInfo) == 0 {
		return nil, nil
	}

	knowledgeIDs := make([]int64, 0, len(r.knowledgeConfig.KnowledgeInfo))
	for _, v := range r.knowledgeConfig.KnowledgeInfo {
		id, err := strconv.ParseInt(v.GetId(), 10, 64)
		if err != nil {
			return nil, err
		}
		knowledgeIDs = append(knowledgeIDs, id)
	}

	kr, err := genKnowledgeRequest(ctx, knowledgeIDs, r.knowledgeConfig,
		req.Input.Content, req.History)
	if err != nil {
		return nil, err
	}

	resp, err := crossknowledge.DefaultSVC().Retrieve(ctx, kr)
	if err != nil {
		return nil, err
	}

	docs, err := convertDocument(ctx, resp.RetrieveSlices)
	if err != nil {
		return nil, err
	}

	return docs, nil
}

func genKnowledgeRequest(_ context.Context, ids []int64, conf *bot_common.Knowledge,
	query string, history []*schema.Message,
) (*knowledge.RetrieveRequest, error) {
	rr := &knowledge.RetrieveRequest{
		Query:        query,
		ChatHistory:  history,
		KnowledgeIDs: ids,
		Strategy: &knowledgeEntity.RetrievalStrategy{
			TopK:     conf.TopK,
			MinScore: conf.MinScore,

			SelectType: func() knowledgeModel.SelectType {
				if conf.Auto != nil && *conf.Auto {
					return knowledgeModel.SelectTypeAuto
				}
				return knowledgeModel.SelectTypeOnDemand
			}(),

			SearchType: func() knowledgeModel.SearchType {
				if conf.SearchStrategy == nil {
					return knowledgeModel.SearchTypeSemantic
				}
				switch *conf.SearchStrategy {
				case bot_common.SearchStrategy_SemanticSearch:
					return knowledgeModel.SearchTypeSemantic
				case bot_common.SearchStrategy_FullTextSearch:
					return knowledgeModel.SearchTypeFullText
				case bot_common.SearchStrategy_HybirdSearch:
					return knowledgeModel.SearchTypeHybrid
				default:
					return knowledgeModel.SearchTypeSemantic
				}
			}(),

			EnableQueryRewrite: conf.RecallStrategy != nil && conf.RecallStrategy.UseRewrite != nil && *conf.RecallStrategy.UseRewrite,
			EnableRerank:       conf.RecallStrategy != nil && conf.RecallStrategy.UseRerank != nil && *conf.RecallStrategy.UseRerank,
			EnableNL2SQL:       conf.RecallStrategy != nil && conf.RecallStrategy.UseNl2sql != nil && *conf.RecallStrategy.UseNl2sql,
		},
	}

	return rr, nil
}

func convertDocument(_ context.Context, docSlice []*knowledgeModel.RetrieveSlice) ([]*schema.Document, error) {
	return slices.Transform(docSlice, func(a *knowledgeModel.RetrieveSlice) *schema.Document {
		doc := &schema.Document{
			ID:       strconv.FormatInt(a.Slice.ID, 10),
			Content:  a.Slice.GetSliceContent(),
			MetaData: make(map[string]any),
		}
		doc.WithScore(a.Score)
		return doc
	}), nil
}
