package knowledge

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
)

type DeleterConfig struct {
	KnowledgeID      int64
	KnowledgeDeleter knowledge.KnowledgeOperator
}

type KnowledgeDeleter struct {
	config *DeleterConfig
}

func NewKnowledgeDeleter(_ context.Context, cfg *DeleterConfig) (*KnowledgeDeleter, error) {
	if cfg.KnowledgeDeleter == nil {
		return nil, errors.New("knowledge deleter is required")
	}
	return &KnowledgeDeleter{
		config: cfg,
	}, nil
}

func (k *KnowledgeDeleter) Delete(ctx context.Context, input map[string]any) (map[string]any, error) {
	documentID, ok := input["documentID"].(string)
	if !ok {
		return nil, errors.New("documentID is required and must be a string")
	}

	req := &knowledge.DeleteDocumentRequest{
		DocumentID: documentID,
	}

	response, err := k.config.KnowledgeDeleter.Delete(ctx, req)
	if err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["isSuccess"] = response.IsSuccess

	return result, nil
}
