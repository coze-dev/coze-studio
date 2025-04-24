package application

import (
	"context"
	"errors"
	"path"
	"strconv"

	common2 "code.byted.org/flow/opencoze/backend/api/model/common"
	"code.byted.org/flow/opencoze/backend/api/model/document2"
	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type KnowledgeApplicationService struct{}

var KnowledgeSVC = KnowledgeApplicationService{}

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
			ProjectID:   req.GetProjectID(),
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

func (k *KnowledgeApplicationService) DatasetDetail(ctx context.Context, req *dataset.DatasetDetailRequest) (*dataset.DatasetDetailResponse, error) {
	projectID := strconv.FormatInt(req.GetProjectID(), 10)
	knowledgeEntity, _, err := knowledgeDomainSVC.MGetKnowledge(ctx, &knowledge.MGetKnowledgeRequest{
		IDs:       req.DatasetIds,
		SpaceID:   &req.SpaceID,
		ProjectID: &projectID,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "get knowledge failed, err: %v", err)
		return dataset.NewDatasetDetailResponse(), err
	}
	knowledgeMap, err := batchConvertKnowledgeEntity2Model(ctx, knowledgeEntity)
	if err != nil {
		logs.CtxErrorf(ctx, "batch convert knowledge entity failed, err: %v", err)
		return dataset.NewDatasetDetailResponse(), err
	}
	response := dataset.NewDatasetDetailResponse()
	response.DatasetDetails = knowledgeMap
	return response, nil
}

func (k *KnowledgeApplicationService) ListKnowledge(ctx context.Context, req *dataset.ListDatasetRequest) (*dataset.ListDatasetResponse, error) {
	request := knowledge.MGetKnowledgeRequest{}
	page := 1
	pageSize := 10
	if req.Page != nil && *req.Page > 0 {
		page = int(*req.Page)
	}
	if req.Size != nil && *req.Size > 0 {
		pageSize = int(*req.Size)
	}
	request.Page = &page
	request.PageSize = &pageSize
	if req.GetProjectID() != "" && req.GetProjectID() != "0" {
		request.ProjectID = req.ProjectID
	}
	orderBy := knowledge.OrderUpdatedAt
	if req.GetOrderField() == dataset.OrderField_CreateTime {
		orderBy = knowledge.OrderCreatedAt
	}
	request.Order = &orderBy
	orderType := knowledge.OrderTypeDesc
	if req.GetOrderType() == dataset.OrderType_Asc {
		orderType = knowledge.OrderTypeAsc
	}
	if req.GetSpaceID() != 0 {
		request.SpaceID = &req.SpaceID
	}

	request.OrderType = &orderType
	if req.Filter != nil {
		if req.GetFilter().GetName() != "" {
			request.Name = req.GetFilter().Name
		}
		if len(req.GetFilter().DatasetIds) > 0 {
			request.IDs = req.GetFilter().DatasetIds
		}
		if req.GetFilter().FormatType != nil {
			var format int64 = int64(req.GetFilter().GetFormatType())
			request.FormatType = &format
		}
	}
	knowledgeEntity, total, err := knowledgeDomainSVC.MGetKnowledge(ctx, &request)
	if err != nil {
		logs.CtxErrorf(ctx, "mget knowledge failed, err: %v", err)
		return dataset.NewListDatasetResponse(), err
	}
	resp := dataset.ListDatasetResponse{}
	resp.Total = int32(total)
	knowledgeMap, err := batchConvertKnowledgeEntity2Model(ctx, knowledgeEntity)
	if err != nil {
		logs.CtxErrorf(ctx, "batch convert knowledge entity failed, err: %v", err)
		return dataset.NewListDatasetResponse(), err
	}
	resp.DatasetList = make([]*dataset.Dataset, 0)
	for i := range knowledgeEntity {
		resp.DatasetList = append(resp.DatasetList, knowledgeMap[knowledgeEntity[i].ID])
	}
	return &resp, nil
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
		Status: convertDatasetStatus2Entity(req.GetStatus()),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return dataset.NewUpdateDatasetResponse(), err
	}
	return &dataset.UpdateDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) CreateDocument(ctx context.Context, req *dataset.CreateDocumentRequest) (*dataset.CreateDocumentResponse, error) {
	knowledgeEntity, _, err := knowledgeDomainSVC.MGetKnowledge(ctx, &knowledge.MGetKnowledgeRequest{IDs: []int64{req.GetDatasetID()}})
	if err != nil {
		logs.CtxErrorf(ctx, "mget knowledge failed, err: %v", err)
		return dataset.NewCreateDocumentResponse(), err
	}
	if len(knowledgeEntity) == 0 {
		return dataset.NewCreateDocumentResponse(), errors.New("knowledge not found")
	}
	knowledgeInfo := knowledgeEntity[0]
	documents := []*entity.Document{}
	if len(req.GetDocumentBases()) == 0 {
		return dataset.NewCreateDocumentResponse(), errors.New("document base is empty")
	}
	if req.FormatType == dataset.FormatType_Table && req.DocumentBases[0].GetName() == "" {
		req.DocumentBases[0].Name = knowledgeInfo.Name
	}
	for i := range req.GetDocumentBases() {
		if req.GetDocumentBases()[i] == nil {
			continue
		}
		docSource := entity.DocumentSourceCustom
		if req.GetDocumentBases()[i].GetSourceInfo().GetTosURI() == "" {
			docSource = entity.DocumentSourceLocal
		}
		document := entity.Document{
			Info: common.Info{
				Name:        req.GetDocumentBases()[i].GetName(),
				Description: "", // todo:coze上没有文档的描述
				IconURI:     "", // todo:coze上文档没有头像
				CreatorID:   0,  // todo:从ctx解析user id,
				SpaceID:     knowledgeInfo.SpaceID,
				ProjectID:   knowledgeInfo.ProjectID,
			},
			KnowledgeID:       req.GetDatasetID(),
			Type:              convertDocumentTypeDataset2Entity(req.GetFormatType()),
			RawContent:        req.GetDocumentBases()[i].GetSourceInfo().GetCustomContent(),
			URI:               req.GetDocumentBases()[i].GetSourceInfo().GetTosURI(),
			FilenameExtension: GetExtension(req.GetDocumentBases()[i].GetSourceInfo().GetTosURI()),
			Source:            docSource,
			IsAppend:          req.GetIsAppend(),
			ParsingStrategy:   convertParsingStrategy2Entity(req.GetParsingStrategy(), req.GetDocumentBases()[i].TableSheet),
			ChunkingStrategy:  convertChunkingStrategy2Entity(req.GetChunkStrategy()),
			TableInfo: entity.TableInfo{
				Columns: convertTableColumns2Entity(req.GetDocumentBases()[i].GetTableMeta()),
			},
		}
		documents = append(documents, &document)
	}
	documents, err = knowledgeDomainSVC.CreateDocument(ctx, documents)
	if err != nil {
		logs.CtxErrorf(ctx, "create document failed, err: %v", err)
		return dataset.NewCreateDocumentResponse(), err
	}
	resp := dataset.NewCreateDocumentResponse()
	resp.DocumentInfos = make([]*dataset.DocumentInfo, 0)
	for i := range documents {
		resp.DocumentInfos = append(resp.DocumentInfos, convertDocument2Model(documents[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) ListDocument(ctx context.Context, req *dataset.ListDocumentRequest) (*dataset.ListDocumentResponse, error) {
	// req.keywords在coze的代码里没有用到
	listResp, err := knowledgeDomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
		KnowledgeID: req.GetDatasetID(),
		DocumentIDs: req.GetDocumentIds(),
		Page:        req.Page,
		PageSize:    req.Size,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return dataset.NewListDocumentResponse(), err
	}
	documents := listResp.Documents
	resp := dataset.NewListDocumentResponse()
	resp.Total = int32(listResp.Total)
	resp.DocumentInfos = make([]*dataset.DocumentInfo, 0)
	for i := range documents {
		resp.DocumentInfos = append(resp.DocumentInfos, convertDocument2Model(documents[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) DeleteDocument(ctx context.Context, req *dataset.DeleteDocumentRequest) (*dataset.DeleteDocumentResponse, error) {
	for i := range req.GetDocumentIds() {
		_, err := knowledgeDomainSVC.DeleteDocument(ctx, &entity.Document{
			Info: common.Info{ID: req.GetDocumentIds()[i]},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete document failed, err: %v", err)
			return dataset.NewDeleteDocumentResponse(), err
		}
	}
	return &dataset.DeleteDocumentResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateDocument(ctx context.Context, req *dataset.UpdateDocumentRequest) (*dataset.UpdateDocumentResponse, error) {
	_, err := knowledgeDomainSVC.UpdateDocument(ctx, &entity.Document{
		Info: common.Info{
			ID:   req.GetDocumentID(),
			Name: req.GetDocumentName(),
		},
		TableInfo: entity.TableInfo{
			Columns: convertTableColumns2Entity(req.GetTableMeta()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update document failed, err: %v", err)
		return dataset.NewUpdateDocumentResponse(), err
	}
	return &dataset.UpdateDocumentResponse{}, nil
}

func (k *KnowledgeApplicationService) GetDocumentProgress(ctx context.Context, req *dataset.GetDocumentProgressRequest) (*dataset.GetDocumentProgressResponse, error) {
	documentProgress, err := knowledgeDomainSVC.MGetDocumentProgress(ctx, req.GetDocumentIds())
	if err != nil {
		logs.CtxErrorf(ctx, "mget document progress failed, err: %v", err)
		return dataset.NewGetDocumentProgressResponse(), err
	}
	resp := dataset.NewGetDocumentProgressResponse()
	resp.Data = make([]*dataset.DocumentProgress, 0)
	for i := range documentProgress {
		url := "" // todo，图片型知识库需要
		resp.Data = append(resp.Data, &dataset.DocumentProgress{
			DocumentID:     documentProgress[i].ID,
			Progress:       int32(documentProgress[i].Progress),
			Status:         convertDocumentStatus2Model(documentProgress[i].Status),
			StatusDescript: &documentProgress[i].StatusMsg,
			DocumentName:   documentProgress[i].Name,
			RemainingTime:  &documentProgress[i].RemainingSec,
			Size:           &documentProgress[i].Size,
			Type:           &documentProgress[i].Type,
			URL:            &url,
		})
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) Resegment(ctx context.Context, req *dataset.ResegmentRequest) (*dataset.ResegmentResponse, error) {
	resp := dataset.NewResegmentResponse()
	resp.DocumentInfos = make([]*dataset.DocumentInfo, 0)
	for i := range req.GetDocumentIds() {
		document, err := knowledgeDomainSVC.ResegmentDocument(ctx, knowledge.ResegmentDocumentRequest{
			ID:               req.GetDocumentIds()[i],
			ChunkingStrategy: convertChunkingStrategy2Entity(req.GetChunkStrategy()),
			ParsingStrategy:  convertParsingStrategy2Entity(req.GetParsingStrategy(), nil),
		})
		if err != nil {
			logs.CtxErrorf(ctx, "resegment document failed, err: %v", err)
			return dataset.NewResegmentResponse(), err
		}
		resp.DocumentInfos = append(resp.DocumentInfos, &dataset.DocumentInfo{
			Name:       document.Name,
			DocumentID: document.ID,
		})
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) CreateSlice(ctx context.Context, req *dataset.CreateSliceRequest) (*dataset.CreateSliceResponse, error) {
	sliceEntity, err := knowledgeDomainSVC.CreateSlice(ctx, &entity.Slice{
		PlainText:  req.GetRawText(),
		DocumentID: req.GetDocumentID(),
		Sequence:   req.GetSequence(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "create slice failed, err: %v", err)
		return dataset.NewCreateSliceResponse(), err
	}
	resp := dataset.NewCreateSliceResponse()
	resp.SliceID = sliceEntity.ID
	return resp, nil
}

func (k *KnowledgeApplicationService) DeleteSlice(ctx context.Context, req *dataset.DeleteSliceRequest) (*dataset.DeleteSliceResponse, error) {
	for i := range req.GetSliceIds() {
		_, err := knowledgeDomainSVC.DeleteSlice(ctx, &entity.Slice{
			Info: common.Info{ID: req.GetSliceIds()[i]},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete slice failed, err: %v", err)
			return dataset.NewDeleteSliceResponse(), err
		}
	}
	return &dataset.DeleteSliceResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateSlice(ctx context.Context, req *dataset.UpdateSliceRequest) (*dataset.UpdateSliceResponse, error) {
	_, err := knowledgeDomainSVC.UpdateSlice(ctx, &entity.Slice{
		Info:       common.Info{ID: req.GetSliceID()},
		DocumentID: req.GetDocumentID(),
		PlainText:  req.GetRawText(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update slice failed, err: %v", err)
		return dataset.NewUpdateSliceResponse(), err
	}
	return &dataset.UpdateSliceResponse{}, nil
}

func (k *KnowledgeApplicationService) ListSlice(ctx context.Context, req *dataset.ListSliceRequest) (*dataset.ListSliceResponse, error) {
	listResp, err := knowledgeDomainSVC.ListSlice(ctx, &knowledge.ListSliceRequest{
		KnowledgeID: req.GetDatasetID(),
		DocumentID:  req.GetDocumentID(),
		Keyword:     req.Keyword,
		Sequence:    req.Sequence,
		PageNo:      req.PageNo,
		PageSize:    req.PageSize,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list slice failed, err: %v", err)
		return dataset.NewListSliceResponse(), err
	}
	resp := dataset.NewListSliceResponse()
	resp.Total = int64(listResp.Total)
	resp.Hasmore = listResp.HasMore
	resp.Slices = make([]*dataset.SliceInfo, 0)
	for i := range listResp.Slices {
		resp.Slices = append(resp.Slices, convertSlice2Model(listResp.Slices[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) GetTableSchema(ctx context.Context, req *dataset.GetTableSchemaRequest) (*dataset.GetTableSchemaResponse, error) {
	resp := dataset.NewGetTableSchemaResponse()
	if req.TableSheet == nil {
		req.TableSheet = &dataset.TableSheet{
			SheetID:       0,
			HeaderLineIdx: 0,
			StartLineIdx:  1,
		}
	}
	if req.TableDataType == nil {
		req.TableDataType = dataset.TableDataTypePtr(dataset.TableDataType(knowledge.AllData))
	}

	domainResp, err := knowledgeDomainSVC.GetTableSchema(ctx, &knowledge.GetTableSchemaRequest{
		DocumentID: req.GetDocumentID(),

		TableSheet:       convertTableSheet2Entity(*req.GetTableSheet()),
		TableDataType:    convertTableDataType2Entity(req.GetTableDataType()),
		OriginTableMeta:  convertTableColumns2Entity(req.GetOriginTableMeta()),
		PreviewTableMeta: convertTableColumns2Entity(req.GetPreviewTableMeta()),
		SourceInfo: knowledge.TableSourceInfo{
			Uri:           req.GetSourceFile().GetTosURI(),
			FileBase64:    req.GetSourceFile().FileBase64,
			FileType:      req.GetSourceFile().FileType,
			CustomContent: req.GetSourceFile().CustomContent,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "get table schema failed, err: %v", err)
		return resp, err
	}
	resp.PreviewData = domainResp.PreviewData
	resp.TableMeta = convertTableColumns2Model(domainResp.TableMeta)
	resp.SheetList = make([]*dataset.DocTableSheet, 0)
	for i := range domainResp.TableSheet {
		if domainResp.TableSheet[i] == nil {
			continue
		}
		resp.SheetList = append(resp.SheetList, convertDocTableSheet2Model(*domainResp.TableSheet[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) ValidateTableSchema(ctx context.Context, req *dataset.ValidateTableSchemaRequest) (*dataset.ValidateTableSchemaResponse, error) {
	resp := dataset.NewValidateTableSchemaResponse()
	domainResp, err := knowledgeDomainSVC.ValidateTableSchema(ctx, &knowledge.ValidateTableSchemaRequest{
		DocumentID: req.GetDocumentID(),
		SourceInfo: knowledge.TableSourceInfo{
			Uri:           req.GetSourceInfo().GetTosURI(),
			FileBase64:    req.GetSourceInfo().FileBase64,
			FileType:      req.GetSourceInfo().FileType,
			CustomContent: req.GetSourceInfo().CustomContent,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "validate table schema failed, err: %v", err)
		return resp, err
	}
	resp.ColumnValidResult = domainResp.ColumnValidResult
	return resp, nil
}

func (k *KnowledgeApplicationService) GetDocumentTableInfo(ctx context.Context, req *document2.GetDocumentTableInfoRequest) (*document2.GetDocumentTableInfoResponse, error) {
	domainResp, err := knowledgeDomainSVC.GetDocumentTableInfo(ctx, &knowledge.GetDocumentTableInfoRequest{
		DocumentID: req.GetDocumentID(),
		SourceInfo: knowledge.TableSourceInfo{
			Uri: req.GetTosURI(),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "get document table info failed, err: %v", err)
		return document2.NewGetDocumentTableInfoResponse(), err
	}
	resp := document2.NewGetDocumentTableInfoResponse()
	resp.PreviewData = domainResp.PreviewData
	resp.SheetList = make([]*common2.DocTableSheet, 0)
	for i := range domainResp.TableSheet {
		if domainResp.TableSheet[i] == nil {
			continue
		}
		resp.SheetList = append(resp.SheetList, convertDocTableSheet(domainResp.TableSheet[i]))
	}
	resp.TableMeta = map[int64][]*common2.DocTableColumn{}
	for index, rows := range domainResp.TableMeta {
		resp.TableMeta[int64(index)] = convertTableMeta(rows)
	}
	return resp, nil
}

func convertTableDataType2Entity(t dataset.TableDataType) knowledge.TableDataType {
	switch t {
	case dataset.TableDataType_AllData:
		return knowledge.AllData
	case dataset.TableDataType_OnlySchema:
		return knowledge.OnlySchema
	case dataset.TableDataType_OnlyPreview:
		return knowledge.OnlyPreview
	default:
		return knowledge.AllData
	}
}

func convertTableSheet2Entity(sheet dataset.TableSheet) entity.TableSheet {
	return entity.TableSheet{
		SheetId:       sheet.GetSheetID(),
		StartLineIdx:  sheet.GetHeaderLineIdx(),
		HeaderLineIdx: sheet.GetHeaderLineIdx(),
	}
}

func convertDocTableSheet2Model(sheet entity.TableSheet) *dataset.DocTableSheet {
	return &dataset.DocTableSheet{
		ID:        sheet.SheetId,
		SheetName: sheet.SheetName,
		TotalRow:  sheet.TotalRows,
	}
}

func convertTableMeta(t []*entity.TableColumn) []*common2.DocTableColumn {
	if len(t) == 0 {
		return nil
	}
	resp := make([]*common2.DocTableColumn, 0)
	for i := range t {
		if t[i] == nil {
			continue
		}
		resp = append(resp, &common2.DocTableColumn{
			ID:         t[i].ID,
			ColumnName: t[i].Name,
			IsSemantic: t[i].Indexing,
			Desc:       &t[i].Description,
			Sequence:   t[i].Sequence,
			ColumnType: convertColumnType(t[i].Type),
		})
	}
	return resp
}

func convertColumnType(t entity.TableColumnType) *common2.ColumnType {
	switch t {
	case entity.TableColumnTypeString:
		return common2.ColumnTypePtr(common2.ColumnType_Text)
	case entity.TableColumnTypeBoolean:
		return common2.ColumnTypePtr(common2.ColumnType_Boolean)
	case entity.TableColumnTypeNumber:
		return common2.ColumnTypePtr(common2.ColumnType_Float)
	case entity.TableColumnTypeTime:
		return common2.ColumnTypePtr(common2.ColumnType_Date)
	case entity.TableColumnTypeInteger:
		return common2.ColumnTypePtr(common2.ColumnType_Number)
	case entity.TableColumnTypeImage:
		return common2.ColumnTypePtr(common2.ColumnType_Image)
	default:
		return common2.ColumnTypePtr(common2.ColumnType_Text)
	}
}

func convertDocTableSheet(t *entity.TableSheet) *common2.DocTableSheet {
	if t == nil {
		return nil
	}
	return &common2.DocTableSheet{
		ID:        t.SheetId,
		SheetName: t.SheetName,
		TotalRow:  t.TotalRows,
	}
}

func convertSlice2Model(sliceEntity *entity.Slice) *dataset.SliceInfo {
	if sliceEntity == nil {
		return nil
	}
	return &dataset.SliceInfo{
		SliceID:    sliceEntity.ID,
		Content:    sliceEntity.PlainText,
		Status:     convertSliceStatus2Model(sliceEntity.SliceStatus),
		HitCount:   0, // todo hot count
		CharCount:  sliceEntity.CharCount,
		TokenCount: sliceEntity.ByteCount,
		Sequence:   sliceEntity.Sequence,
		DocumentID: sliceEntity.DocumentID,
		ChunkInfo:  "", // todo chunk info逻辑没写
	}
}

func convertSliceStatus2Model(status entity.SliceStatus) dataset.SliceStatus {
	switch status {
	case entity.SliceStatusInit:
		return dataset.SliceStatus_PendingVectoring
	case entity.SliceStatusFinishStore:
		return dataset.SliceStatus_FinishVectoring
	case entity.SliceStatusFailed:
		return dataset.SliceStatus_Deactive
	default:
		return dataset.SliceStatus_PendingVectoring
	}
}
func convertDocument2Model(documentEntity *entity.Document) *dataset.DocumentInfo {
	if documentEntity == nil {
		return nil
	}
	chunkStrategy := convertChunkingStrategy2Model(documentEntity.ChunkingStrategy)
	parseStrategy, _ := convertParsingStrategy2Model(documentEntity.ParsingStrategy)
	docInfo := &dataset.DocumentInfo{
		Name:                  documentEntity.Name,
		DocumentID:            documentEntity.ID,
		TosURI:                &documentEntity.URI,
		CreateTime:            int32(documentEntity.CreatedAtMs),
		UpdateTime:            int32(documentEntity.UpdatedAtMs),
		CreatorID:             &documentEntity.CreatorID,
		SliceCount:            int32(documentEntity.SliceCount),
		Type:                  documentEntity.FilenameExtension,
		Size:                  int32(documentEntity.Size),
		CharCount:             int32(documentEntity.CharCount),
		Status:                convertDocumentStatus2Model(documentEntity.Status),
		HitCount:              int32(documentEntity.Hits),
		SourceType:            convertDocumentSource2Model(documentEntity.Source),
		FormatType:            convertDocumentTypeEntity2Dataset(documentEntity.Type),
		WebURL:                &documentEntity.URL,
		TableMeta:             convertTableColumns2Model(documentEntity.TableInfo.Columns),
		StatusDescript:        &documentEntity.StatusMsg,
		SpaceID:               &documentEntity.SpaceID,
		EditableAppendContent: nil,
		ChunkStrategy:         chunkStrategy,
		ParsingStrategy:       parseStrategy,
		IndexStrategy:         nil, // todo，好像没啥用
		FilterStrategy:        nil, // todo，好像没啥用
	}
	return docInfo
}

func convertDocumentSource2Entity(sourceType dataset.DocumentSource) entity.DocumentSource {
	switch sourceType {
	case dataset.DocumentSource_Custom:
		return entity.DocumentSourceCustom
	case dataset.DocumentSource_Document:
		return entity.DocumentSourceLocal
	default:
		return entity.DocumentSourceLocal
	}
}

func convertDocumentSource2Model(sourceType entity.DocumentSource) dataset.DocumentSource {
	switch sourceType {
	case entity.DocumentSourceCustom:
		return dataset.DocumentSource_Custom
	case entity.DocumentSourceLocal:
		return dataset.DocumentSource_Document
	default:
		return dataset.DocumentSource_Document
	}
}

func convertDocumentStatus2Model(status entity.DocumentStatus) dataset.DocumentStatus {
	switch status {
	case entity.DocumentStatusDeleted:
		return dataset.DocumentStatus_Deleted
	case entity.DocumentStatusEnable:
		return dataset.DocumentStatus_Enable
	case entity.DocumentStatusFailed:
		return dataset.DocumentStatus_Failed
	default:
		return dataset.DocumentStatus_Processing
	}
}

func convertTableColumns2Entity(columns []*dataset.TableColumn) []*entity.TableColumn {
	if len(columns) == 0 {
		return nil
	}
	columnEntities := make([]*entity.TableColumn, 0, len(columns))
	for i := range columns {
		columnEntities = append(columnEntities, &entity.TableColumn{
			ID:          columns[i].GetID(),
			Name:        columns[i].GetColumnName(),
			Type:        convertColumnType2Entity(columns[i].GetColumnType()),
			Description: columns[i].GetDesc(),
			Indexing:    columns[i].GetIsSemantic(),
			Sequence:    columns[i].GetSequence(),
		})
	}
	return columnEntities
}
func convertTableColumns2Model(columns []*entity.TableColumn) []*dataset.TableColumn {
	if len(columns) == 0 {
		return nil
	}
	columnModels := make([]*dataset.TableColumn, 0, len(columns))
	for i := range columns {
		columnType := convertColumnType2Model(columns[i].Type)
		columnModels = append(columnModels, &dataset.TableColumn{
			ID:         columns[i].ID,
			ColumnName: columns[i].Name,
			ColumnType: &columnType,
			Desc:       &columns[i].Description,
			IsSemantic: columns[i].Indexing,
			Sequence:   columns[i].Sequence,
		})
	}
	return columnModels
}
func convertColumnType2Model(columnType entity.TableColumnType) dataset.ColumnType {
	switch columnType {
	case entity.TableColumnTypeString:
		return dataset.ColumnType_Text
	case entity.TableColumnTypeInteger:
		return dataset.ColumnType_Number
	case entity.TableColumnTypeImage:
		return dataset.ColumnType_Image
	case entity.TableColumnTypeBoolean:
		return dataset.ColumnType_Boolean
	case entity.TableColumnTypeTime:
		return dataset.ColumnType_Date
	case entity.TableColumnTypeNumber:
		return dataset.ColumnType_Float
	default:
		return dataset.ColumnType_Text
	}
}

func convertColumnType2Entity(columnType dataset.ColumnType) entity.TableColumnType {
	switch columnType {
	case dataset.ColumnType_Text:
		return entity.TableColumnTypeString
	case dataset.ColumnType_Number:
		return entity.TableColumnTypeInteger
	case dataset.ColumnType_Image:
		return entity.TableColumnTypeImage
	case dataset.ColumnType_Boolean:
		return entity.TableColumnTypeBoolean
	case dataset.ColumnType_Date:
		return entity.TableColumnTypeTime
	case dataset.ColumnType_Float:
		return entity.TableColumnTypeNumber
	default:
		return entity.TableColumnTypeString
	}
}

func convertParsingStrategy2Entity(strategy *dataset.ParsingStrategy, sheet *dataset.TableSheet) *entity.ParsingStrategy {
	if strategy == nil {
		return nil
	}
	res := &entity.ParsingStrategy{
		ExtractImage: strategy.GetImageExtraction(),
		ExtractTable: strategy.GetTableExtraction(),
		ImageOCR:     strategy.GetImageOcr(),
	}
	if sheet != nil {
		res.SheetID = int(sheet.GetSheetID())
		res.HeaderLine = int(sheet.GetHeaderLineIdx())
		res.DataStartLine = int(sheet.GetStartLineIdx())
	}
	return res
}

func convertParsingStrategy2Model(strategy *entity.ParsingStrategy) (s *dataset.ParsingStrategy, sheet *dataset.TableSheet) {
	if strategy == nil {
		return nil, nil
	}
	sheet = &dataset.TableSheet{
		SheetID:       sheet.SheetID,
		HeaderLineIdx: sheet.HeaderLineIdx,
		StartLineIdx:  sheet.StartLineIdx,
	}
	return &dataset.ParsingStrategy{
		ImageExtraction: &strategy.ExtractImage,
		TableExtraction: &strategy.ExtractTable,
		ImageOcr:        &strategy.ImageOCR,
	}, sheet
}

func convertChunkingStrategy2Entity(strategy *dataset.ChunkStrategy) *entity.ChunkingStrategy {
	if strategy == nil {
		return nil
	}
	return &entity.ChunkingStrategy{
		ChunkType:       convertChunkType2Entity(strategy.ChunkType),
		ChunkSize:       strategy.GetMaxTokens(),
		Separator:       strategy.GetSeparator(),
		Overlap:         strategy.GetOverlap(),
		TrimSpace:       strategy.GetRemoveExtraSpaces(),
		TrimURLAndEmail: strategy.GetRemoveUrlsEmails(),
		MaxDepth:        strategy.GetMaxLevel(),
		SaveTitle:       strategy.GetSaveTitle(),
	}
}

func GetExtension(uri string) string {
	if uri == "" {
		return ""
	}
	fileExtension := path.Base(uri)
	return path.Ext(fileExtension)
}

func convertDatasetStatus2Entity(status dataset.DatasetStatus) entity.KnowledgeStatus {
	switch status {
	case dataset.DatasetStatus_DatasetReady:
		return entity.KnowledgeStatusEnable
	case dataset.DatasetStatus_DatasetForbid, dataset.DatasetStatus_DatasetDeleted:
		return entity.KnowledgeStatusDisable
	default:
		return entity.KnowledgeStatusEnable
	}
}
func convertChunkType2model(chunkType entity.ChunkType) dataset.ChunkType {
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
func convertChunkType2Entity(chunkType dataset.ChunkType) entity.ChunkType {
	switch chunkType {
	case dataset.ChunkType_CustomChunk:
		return entity.ChunkTypeCustom
	case dataset.ChunkType_DefaultChunk:
		return entity.ChunkTypeDefault
	case dataset.ChunkType_LevelChunk:
		return entity.ChunkTypeLeveled
	default:
		return entity.ChunkTypeDefault
	}
}
func convertChunkingStrategy2Model(chunkingStrategy *entity.ChunkingStrategy) *dataset.ChunkStrategy {
	if chunkingStrategy == nil {
		return nil
	}
	return &dataset.ChunkStrategy{
		Separator:         chunkingStrategy.Separator,
		MaxTokens:         chunkingStrategy.ChunkSize,
		RemoveExtraSpaces: chunkingStrategy.TrimSpace,
		RemoveUrlsEmails:  chunkingStrategy.TrimURLAndEmail,
		ChunkType:         convertChunkType2model(chunkingStrategy.ChunkType),
		CaptionType:       nil, // todo，图片型知识
		Overlap:           &chunkingStrategy.Overlap,
		MaxLevel:          &chunkingStrategy.MaxDepth,
		SaveTitle:         &chunkingStrategy.SaveTitle,
	}
}
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
func batchConvertKnowledgeEntity2Model(ctx context.Context, knowledgeEntity []*entity.Knowledge) (map[int64]*dataset.Dataset, error) {
	knowledgeMap := map[int64]*dataset.Dataset{}
	for _, k := range knowledgeEntity {
		documentEntity, err := knowledgeDomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
			KnowledgeID: k.ID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "list document failed, err: %v", err)
			return nil, err
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
			IconURL:              k.IconURI,
			Description:          k.Description,
			CanEdit:              true, // todo，判断user id是否等于creator id
			CreateTime:           int32(k.CreatedAtMs),
			CreatorID:            k.CreatorID,
			SpaceID:              k.SpaceID,
			FailedFileList:       nil, // 原本的dataset服务里也没有
			FormatType:           convertDocumentTypeEntity2Dataset(k.Type),
			SliceCount:           sliceCount,
			HitCount:             0, // todo记录每个slice的hit次数，这个还没搞
			ChunkStrategy:        convertChunkingStrategy2Model(rule),
			ProcessingFileIDList: processingFileIDList,
			ProjectID:            strconv.FormatInt(k.ProjectID, 10),
		}
	}
	return knowledgeMap, nil
}
