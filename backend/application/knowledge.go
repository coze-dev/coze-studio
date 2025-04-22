package application

import (
	"context"
	"errors"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type KnowledgeApplicationService struct{}

var KnowledgeSVC = KnowledgeApplicationService{}

func convertProjectID(projectID string) int64 {
	if projectID == "" {
		return 0
	}
	id, err := strconv.ParseInt(projectID, 10, 64)
	if err != nil {
		return 0
	}
	return id
}
func convertDocumentTypeEntity2Dataset(formatType entity.DocumentType) dataset.FormatType {
	switch formatType {
	case entity.DocumentTypeText:
		return dataset.FormatType_Text
	case entity.DocumentTypeTable:
		return dataset.FormatType_Table
	case entity.DocumentTypeImage:
		return dataset.FormatType_Image
	default:
		return dataset.FormatType_Text
	}
}
func convertDocumentTypeDataset2Entity(formatType dataset.FormatType) entity.DocumentType {
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
	documentType := convertDocumentTypeDataset2Entity(req.FormatType)
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
			ProjectID:   convertProjectID(req.ProjectID),
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

func convertChunkType(chunkType entity.ChunkType) dataset.ChunkType {
	switch chunkType {
	case entity.ChunkTypeCustom:
		return dataset.ChunkType_CustomChunk
	case entity.ChunkTypeDefault:
		return dataset.ChunkType_DefaultChunk
	case entity.ChunkTypeLeveled:
		return dataset.ChunkType_LevelChunk
	default:
		return dataset.ChunkType_CustomChunk
	}
}

func convertChunkingStrategy(chunkingStrategy *entity.ChunkingStrategy) *dataset.ChunkStrategy {
	if chunkingStrategy == nil {
		return nil
	}
	return &dataset.ChunkStrategy{
		Separator:         chunkingStrategy.Separator,
		MaxTokens:         chunkingStrategy.ChunkSize,
		RemoveExtraSpaces: chunkingStrategy.TrimSpace,
		RemoveUrlsEmails:  chunkingStrategy.TrimURLAndEmail,
		ChunkType:         convertChunkType(chunkingStrategy.ChunkType),
		CaptionType:       nil, // todo，表格型知识
		Overlap:           &chunkingStrategy.Overlap,
		MaxLevel:          &chunkingStrategy.MaxDepth,
		SaveTitle:         &chunkingStrategy.SaveTitle,
	}
}

func (k *KnowledgeApplicationService) DatasetDetail(ctx context.Context, req *dataset.DatasetDetailRequest) (*dataset.DatasetDetailResponse, error) {
	knowledgeEntity, err := knowledgeDomainSVC.MGetKnowledge(ctx, req.GetDatasetIds(), req.GetSpaceID(), &req.ProjectID)
	if err != nil {
		logs.CtxErrorf(ctx, "get knowledge failed, err: %v", err)
		return dataset.NewDatasetDetailResponse(), err
	}
	knowledgeMap := map[int64]*dataset.Dataset{}
	for _, k := range knowledgeEntity {
		documentEntity, err := knowledgeDomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
			KnowledgeID: k.ID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "list document failed, err: %v", err)
			return dataset.NewDatasetDetailResponse(), err
		}
		datasetStatus := dataset.DatasetStatus_DatasetReady
		if k.Status == entity.KnowledgeStatusDisable {
			datasetStatus = dataset.DatasetStatus_DatasetForbid
		}

		var (
			rule                 *entity.ChunkingStrategy
			totalSize            int64
			sliceCount           int32
			processingFileList   []string
			processingFileIDList []int64
		)
		for i := range documentEntity.Documents {
			doc := documentEntity.Documents[i]
			totalSize += doc.Size
			sliceCount += int32(doc.SliceCount)
			if doc.Status == entity.DocumentStatusChunking || doc.Status == entity.DocumentStatusUploading {
				processingFileList = append(processingFileList, doc.Name)
				processingFileIDList = append(processingFileIDList, doc.ID)
			}
			if i == 0 {
				rule = doc.ChunkingStrategy
			}
		}
		knowledgeMap[k.ID] = &dataset.Dataset{
			DatasetID:            k.ID,
			Name:                 k.Name,
			FileList:             nil, // 现在和前端服务端的交互也是空
			AllFileSize:          totalSize,
			BotUsedCount:         0, // todo，这个看看咋获取
			Status:               datasetStatus,
			ProcessingFileList:   processingFileList,
			UpdateTime:           int32(k.UpdatedAtMs),
			IconURL:              k.IconURL,
			Description:          k.Description,
			CanEdit:              true, // todo，判断user id是否等于creator id
			CreateTime:           int32(k.CreatedAtMs),
			CreatorID:            k.CreatorID,
			SpaceID:              k.SpaceID,
			CreatorName:          "",  // 原本的dataset服务里也没有
			AvatarURL:            "",  // 原本的dataset服务里也没有
			FailedFileList:       nil, // 原本的dataset服务里也没有
			FormatType:           convertDocumentTypeEntity2Dataset(k.Type),
			SliceCount:           sliceCount,
			HitCount:             0, // todo记录每个slice的hit次数，这个还没搞
			ChunkStrategy:        convertChunkingStrategy(rule),
			ProcessingFileIDList: processingFileIDList,
			ProjectID:            strconv.FormatInt(k.ProjectID, 10),
			StorageLocation:      dataset.StorageLocation_Default,
		}
	}
	response := dataset.NewDatasetDetailResponse()
	response.DatasetDetails = knowledgeMap
	return response, nil
}

func (k *KnowledgeApplicationService) ListKnowledge(ctx context.Context, req *dataset.ListDatasetRequest) (*dataset.ListDatasetResponse, error) {
	return &dataset.ListDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) DeleteKnowledge(ctx context.Context, req *dataset.DeleteDatasetRequest) (*dataset.DeleteDatasetResponse, error) {
	_, err := knowledgeDomainSVC.DeleteKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{ID: req.GetDatasetID()},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "delete knowledge failed, err: %v", err)
		return dataset.NewDeleteDatasetResponse(), err
	}
	return &dataset.DeleteDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateKnowledge(ctx context.Context, req *dataset.UpdateDatasetRequest) (*dataset.UpdateDatasetResponse, error) {
	_, err := knowledgeDomainSVC.UpdateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			ID:          req.GetDatasetID(),
			Name:        req.GetName(),
			IconURI:     req.GetIconURI(),
			Description: req.GetDescription(),
		},
		Status: convertStatus(req.GetStatus()),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return dataset.NewUpdateDatasetResponse(), err
	}
	return &dataset.UpdateDatasetResponse{}, nil
}

func convertStatus(status dataset.DatasetStatus) entity.KnowledgeStatus {
	switch status {
	case dataset.DatasetStatus_DatasetReady:
		return entity.KnowledgeStatusEnable
	case dataset.DatasetStatus_DatasetForbid, dataset.DatasetStatus_DatasetDeleted:
		return entity.KnowledgeStatusDisable
	default:
		return entity.KnowledgeStatusEnable
	}

}
