package application

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type KnowledgeApplicationService struct{}

var KnowledgeSVC = KnowledgeApplicationService{}

func convertDocumentType(formatType dataset.FormatType) entity.DocumentType {
	switch formatType {
	case dataset.FormatType_Text:
		return entity.DocumentTypeText
	case dataset.FormatType_Table:
		return entity.DocumentTypeTable
	case dataset.FormatType_Image:
		return entity.DocumentTypeImage
	default:
		return entity.DocumentTypeUnknown
	}
}

func (k *KnowledgeApplicationService) CreateKnowledge(ctx context.Context, req *dataset.CreateDatasetRequest) (*dataset.CreateDatasetResponse, error) {
	documentType := convertDocumentType(req.FormatType)
	if documentType == entity.DocumentTypeUnknown {
		return dataset.NewCreateDatasetResponse(), errors.New("unknown document type")
	}
	// todo：从ctx解析userID
	userID := 0
	knowledgeEntity := entity.Knowledge{
		Info: common.Info{
			Name:        req.Name,
			Description: req.Description,
			IconURI:     req.IconURI,
			CreatorID:   int64(userID),
			SpaceID:     req.SpaceID,
		},
		Type:   documentType,
		Status: entity.KnowledgeStatusEnable,
	}
	createdEntity, err := knowledgeDomainSVC.CreateKnowledge(ctx, &knowledgeEntity)
	if err != nil {
		logs.CtxErrorf(ctx, "create knowledge failed, err: %v", err)
		return dataset.NewCreateDatasetResponse(), err
	}
	return &dataset.CreateDatasetResponse{
		DatasetID: createdEntity.ID,
	}, nil
}
