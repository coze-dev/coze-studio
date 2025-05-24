package knowledge

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/bytedance/sonic"

	modelCommon "code.byted.org/flow/opencoze/backend/api/model/common"
	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/api/model/knowledge/document"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	cd "code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/maps"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type KnowledgeApplicationService struct {
	DomainSVC knowledge.Knowledge
}

var KnowledgeSVC = &KnowledgeApplicationService{}

func (k *KnowledgeApplicationService) CreateKnowledge(ctx context.Context, req *dataset.CreateDatasetRequest) (*dataset.CreateDatasetResponse, error) {
	documentType := convertDocumentTypeDataset2Entity(req.FormatType)
	if documentType == entity.DocumentTypeUnknown {
		return dataset.NewCreateDatasetResponse(), errors.New("unknown document type")
	}
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	createReq := knowledge.CreateKnowledgeRequest{
		Name:        req.Name,
		Description: req.Description,
		CreatorID:   ptr.From(uid),
		SpaceID:     req.SpaceID,
		ProjectID:   req.GetProjectID(),
		FormatType:  documentType,
	}
	if req.IconURI == "" {
		createReq.IconUri = getIconURI(req.GetFormatType())
	}
	domainResp, err := k.DomainSVC.CreateKnowledge(ctx, &createReq)
	if err != nil {
		logs.CtxErrorf(ctx, "create knowledge failed, err: %v", err)
		return dataset.NewCreateDatasetResponse(), err
	}
	return &dataset.CreateDatasetResponse{
		DatasetID: domainResp.KnowledgeID,
	}, nil
}

func (k *KnowledgeApplicationService) DatasetDetail(ctx context.Context, req *dataset.DatasetDetailRequest) (*dataset.DatasetDetailResponse, error) {
	var err error
	var datasetIDs []int64

	datasetIDs, err = slices.TransformWithErrorCheck(req.GetDatasetIDs(), func(s string) (int64, error) {
		id, err := strconv.ParseInt(s, 10, 64)
		return id, err
	})
	if err != nil {
		logs.CtxErrorf(ctx, "convert string ids failed, err: %v", err)
		return dataset.NewDatasetDetailResponse(), err
	}

	domainResp, err := k.DomainSVC.ListKnowledge(ctx, &knowledge.ListKnowledgeRequest{
		IDs:       datasetIDs,
		SpaceID:   &req.SpaceID,
		ProjectID: &req.ProjectID,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "get knowledge failed, err: %v", err)
		return dataset.NewDatasetDetailResponse(), err
	}
	knowledgeMap, err := batchConvertKnowledgeEntity2Model(ctx, domainResp.KnowledgeList)
	if err != nil {
		logs.CtxErrorf(ctx, "batch convert knowledge entity failed, err: %v", err)
		return dataset.NewDatasetDetailResponse(), err
	}
	response := dataset.NewDatasetDetailResponse()
	response.DatasetDetails = maps.TransformKey(knowledgeMap, func(key int64) string {
		return strconv.FormatInt(key, 10)
	})
	return response, nil
}

func (k *KnowledgeApplicationService) ListKnowledge(ctx context.Context, req *dataset.ListDatasetRequest) (*dataset.ListDatasetResponse, error) {
	var err error
	var projectID int64
	request := knowledge.ListKnowledgeRequest{}
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
		projectID, err = conv.StrToInt64(req.GetProjectID())
		if err != nil {
			logs.CtxErrorf(ctx, "convert project id failed, err: %v", err)
			return dataset.NewListDatasetResponse(), err
		}
		request.ProjectID = ptr.Of(projectID)
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
			request.IDs, err = slices.TransformWithErrorCheck(req.GetFilter().GetDatasetIds(), func(s string) (int64, error) {
				id, err := strconv.ParseInt(s, 10, 64)
				return id, err
			})
			if err != nil {
				logs.CtxErrorf(ctx, "convert string ids failed, err: %v", err)
				return dataset.NewListDatasetResponse(), err
			}
		}
		if req.GetFilter().FormatType != nil {
			request.FormatType = ptr.Of(convertFormatType2Entity(req.Filter.GetFormatType()))
		}
	}
	domainResp, err := k.DomainSVC.ListKnowledge(ctx, &request)
	if err != nil {
		logs.CtxErrorf(ctx, "mget knowledge failed, err: %v", err)
		return dataset.NewListDatasetResponse(), err
	}
	resp := dataset.ListDatasetResponse{}
	resp.Total = int32(domainResp.Total)
	knowledgeMap, err := batchConvertKnowledgeEntity2Model(ctx, domainResp.KnowledgeList)
	if err != nil {
		logs.CtxErrorf(ctx, "batch convert knowledge entity failed, err: %v", err)
		return dataset.NewListDatasetResponse(), err
	}
	resp.DatasetList = make([]*dataset.Dataset, 0)
	for i := range domainResp.KnowledgeList {
		resp.DatasetList = append(resp.DatasetList, knowledgeMap[domainResp.KnowledgeList[i].ID])
	}
	return &resp, nil
}

func (k *KnowledgeApplicationService) DeleteKnowledge(ctx context.Context, req *dataset.DeleteDatasetRequest) (*dataset.DeleteDatasetResponse, error) {
	err := k.DomainSVC.DeleteKnowledge(ctx, &knowledge.DeleteKnowledgeRequest{
		KnowledgeID: req.GetDatasetID(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "delete knowledge failed, err: %v", err)
		return dataset.NewDeleteDatasetResponse(), err
	}
	return &dataset.DeleteDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateKnowledge(ctx context.Context, req *dataset.UpdateDatasetRequest) (*dataset.UpdateDatasetResponse, error) {
	updateReq := knowledge.UpdateKnowledgeRequest{
		KnowledgeID: req.GetDatasetID(),
		Name:        &req.Name,
		IconUri:     &req.IconURI,
		Description: &req.Description,
	}
	if req.Status != nil {
		updateReq.Status = ptr.Of(convertDatasetStatus2Entity(req.GetStatus()))
	}
	err := k.DomainSVC.UpdateKnowledge(ctx, &updateReq)
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return dataset.NewUpdateDatasetResponse(), err
	}
	return &dataset.UpdateDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) CreateDocument(ctx context.Context, req *dataset.CreateDocumentRequest) (*dataset.CreateDocumentResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	listResp, err := k.DomainSVC.ListKnowledge(ctx, &knowledge.ListKnowledgeRequest{IDs: []int64{req.GetDatasetID()}})
	if err != nil {
		logs.CtxErrorf(ctx, "mget knowledge failed, err: %v", err)
		return dataset.NewCreateDocumentResponse(), err
	}
	if len(listResp.KnowledgeList) == 0 {
		return dataset.NewCreateDocumentResponse(), errors.New("knowledge not found")
	}
	knowledgeInfo := listResp.KnowledgeList[0]
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
		if req.GetDocumentBases()[i].GetSourceInfo().GetTosURI() != "" {
			docSource = entity.DocumentSourceLocal
		}
		document := entity.Document{
			Info: common.Info{
				Name:      req.GetDocumentBases()[i].GetName(),
				CreatorID: *uid,
				SpaceID:   knowledgeInfo.SpaceID,
				ProjectID: knowledgeInfo.ProjectID,
			},
			KnowledgeID:      req.GetDatasetID(),
			Type:             convertDocumentTypeDataset2Entity(req.GetFormatType()),
			RawContent:       req.GetDocumentBases()[i].GetSourceInfo().GetCustomContent(),
			URI:              req.GetDocumentBases()[i].GetSourceInfo().GetTosURI(),
			FileExtension:    parser.FileExtension(GetExtension(req.GetDocumentBases()[i].GetSourceInfo().GetTosURI())),
			Source:           docSource,
			IsAppend:         req.GetIsAppend(),
			ParsingStrategy:  convertParsingStrategy2Entity(req.GetParsingStrategy(), req.GetDocumentBases()[i].TableSheet),
			ChunkingStrategy: convertChunkingStrategy2Entity(req.GetChunkStrategy()),
			TableInfo: entity.TableInfo{
				Columns: convertTableColumns2Entity(req.GetDocumentBases()[i].GetTableMeta()),
			},
		}
		documents = append(documents, &document)
	}
	createResp, err := k.DomainSVC.CreateDocument(ctx, &knowledge.CreateDocumentRequest{
		Documents: documents,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "create document failed, err: %v", err)
		return dataset.NewCreateDocumentResponse(), err
	}
	resp := dataset.NewCreateDocumentResponse()
	resp.DocumentInfos = make([]*dataset.DocumentInfo, 0)
	for i := range createResp.Documents {
		resp.DocumentInfos = append(resp.DocumentInfos, convertDocument2Model(createResp.Documents[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) ListDocument(ctx context.Context, req *dataset.ListDocumentRequest) (*dataset.ListDocumentResponse, error) {
	// req.keywords在coze的代码里没有用到
	var limit int = int(req.GetSize())
	var offset int = int(req.GetPage() * req.GetSize())
	var err error
	docIDs := make([]int64, 0)
	if len(req.GetDocumentIds()) != 0 {
		docIDs, err = slices.TransformWithErrorCheck(req.GetDocumentIds(), func(s string) (int64, error) {
			id, err := strconv.ParseInt(s, 10, 64)
			return id, err
		})
		if err != nil {
			logs.CtxErrorf(ctx, "convert string ids failed, err: %v", err)
			return dataset.NewListDocumentResponse(), err
		}
	}
	listResp, err := k.DomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
		KnowledgeID: req.GetDatasetID(),
		DocumentIDs: docIDs,
		Limit:       &limit,
		Offset:      &offset,
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
	if len(req.GetDocumentIds()) == 0 {
		return dataset.NewDeleteDocumentResponse(), errors.New("document ids is empty")
	}
	for i := range req.GetDocumentIds() {
		docID, err := strconv.ParseInt(req.GetDocumentIds()[i], 10, 64)
		if err != nil {
			logs.CtxErrorf(ctx, "parse int failed, err: %v", err)
			return dataset.NewDeleteDocumentResponse(), err
		}
		err = k.DomainSVC.DeleteDocument(ctx, &knowledge.DeleteDocumentRequest{
			DocumentID: docID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete document failed, err: %v", err)
			return dataset.NewDeleteDocumentResponse(), err
		}
	}
	return &dataset.DeleteDocumentResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateDocument(ctx context.Context, req *dataset.UpdateDocumentRequest) (*dataset.UpdateDocumentResponse, error) {
	err := k.DomainSVC.UpdateDocument(ctx, &knowledge.UpdateDocumentRequest{
		DocumentID:   req.GetDocumentID(),
		DocumentName: req.DocumentName,
		TableInfo: &entity.TableInfo{
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
	docIDs, err := slices.TransformWithErrorCheck(req.GetDocumentIds(), func(s string) (int64, error) {
		id, err := strconv.ParseInt(s, 10, 64)
		return id, err
	})
	if err != nil {
		logs.CtxErrorf(ctx, "convert string ids failed, err: %v", err)
		return dataset.NewGetDocumentProgressResponse(), err
	}
	domainResp, err := k.DomainSVC.MGetDocumentProgress(ctx, &knowledge.MGetDocumentProgressRequest{
		DocumentIDs: docIDs,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "mget document progress failed, err: %v", err)
		return dataset.NewGetDocumentProgressResponse(), err
	}
	resp := dataset.NewGetDocumentProgressResponse()
	resp.Data = make([]*dataset.DocumentProgress, 0)
	for i := range domainResp.ProgressList {
		url := "" // todo，图片型知识库需要
		resp.Data = append(resp.Data, &dataset.DocumentProgress{
			DocumentID:     domainResp.ProgressList[i].ID,
			Progress:       int32(domainResp.ProgressList[i].Progress),
			Status:         convertDocumentStatus2Model(domainResp.ProgressList[i].Status),
			StatusDescript: ptr.Of(convertDocumentStatus2Model(domainResp.ProgressList[i].Status).String()),
			DocumentName:   domainResp.ProgressList[i].Name,
			RemainingTime:  &domainResp.ProgressList[i].RemainingSec,
			Size:           &domainResp.ProgressList[i].Size,
			Type:           &domainResp.ProgressList[i].FileExtension,
			URL:            &url,
		})
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) Resegment(ctx context.Context, req *dataset.ResegmentRequest) (*dataset.ResegmentResponse, error) {
	resp := dataset.NewResegmentResponse()
	resp.DocumentInfos = make([]*dataset.DocumentInfo, 0)
	for i := range req.GetDocumentIds() {
		docID, err := strconv.ParseInt(req.GetDocumentIds()[i], 10, 64)
		if err != nil {
			logs.CtxErrorf(ctx, "parse int failed, err: %v", err)
			return dataset.NewResegmentResponse(), err
		}
		resegmentResp, err := k.DomainSVC.ResegmentDocument(ctx, &knowledge.ResegmentDocumentRequest{
			DocumentID:       docID,
			ChunkingStrategy: convertChunkingStrategy2Entity(req.GetChunkStrategy()),
			ParsingStrategy:  convertParsingStrategy2Entity(req.GetParsingStrategy(), nil),
		})
		if err != nil {
			logs.CtxErrorf(ctx, "resegment document failed, err: %v", err)
			return dataset.NewResegmentResponse(), err
		}
		resp.DocumentInfos = append(resp.DocumentInfos, &dataset.DocumentInfo{
			Name:       resegmentResp.Document.Name,
			DocumentID: resegmentResp.Document.ID,
		})
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) CreateSlice(ctx context.Context, req *dataset.CreateSliceRequest) (*dataset.CreateSliceResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	listResp, err := k.DomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
		DocumentIDs: []int64{req.GetDocumentID()},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return dataset.NewCreateSliceResponse(), err
	}
	if len(listResp.Documents) != 1 {
		return dataset.NewCreateSliceResponse(), errors.New("document not found")
	}
	sliceEntity := &entity.Slice{
		Info: common.Info{
			CreatorID: *uid,
		},
		DocumentID: req.GetDocumentID(),
		Sequence:   req.GetSequence(),
	}
	if listResp.Documents[0].Type == entity.DocumentTypeTable {
		err = packTableSliceColumnData(ctx, sliceEntity, req.GetRawText(), listResp.Documents[0])
		if err != nil {
			logs.CtxErrorf(ctx, "pack table slice column data failed, err: %v", err)
			return dataset.NewCreateSliceResponse(), err
		}
	} else {
		sliceEntity.RawContent = []*entity.SliceContent{
			{
				Type: entity.SliceContentTypeText,
				Text: req.RawText,
			},
		}
	}
	createResp, err := k.DomainSVC.CreateSlice(ctx, &knowledge.CreateSliceRequest{
		DocumentID: req.GetDocumentID(),
		CreatorID:  ptr.From(uid),
		Position:   req.GetSequence(),
		RawContent: sliceEntity.RawContent,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "create slice failed, err: %v", err)
		return dataset.NewCreateSliceResponse(), err
	}
	resp := dataset.NewCreateSliceResponse()
	resp.SliceID = createResp.SliceID
	return resp, nil
}

func (k *KnowledgeApplicationService) DeleteSlice(ctx context.Context, req *dataset.DeleteSliceRequest) (*dataset.DeleteSliceResponse, error) {
	for i := range req.GetSliceIds() {
		sliceID, err := strconv.ParseInt(req.GetSliceIds()[i], 10, 64)
		if err != nil {
			logs.CtxErrorf(ctx, "parse int failed, err: %v", err)
			return dataset.NewDeleteSliceResponse(), err
		}
		err = k.DomainSVC.DeleteSlice(ctx, &knowledge.DeleteSliceRequest{
			SliceID: sliceID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete slice failed, err: %v", err)
			return dataset.NewDeleteSliceResponse(), err
		}
	}
	return &dataset.DeleteSliceResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateSlice(ctx context.Context, req *dataset.UpdateSliceRequest) (*dataset.UpdateSliceResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	docID := req.GetDocumentID()
	if docID == 0 {
		getSliceResp, err := k.DomainSVC.GetSlice(ctx, &knowledge.GetSliceRequest{
			SliceID: req.GetSliceID(),
		})
		if err != nil {
			return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", "slice not found"))
		}
		docID = getSliceResp.Slice.DocumentID
	}
	listResp, err := k.DomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
		DocumentIDs: []int64{docID},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return dataset.NewUpdateSliceResponse(), err
	}
	if len(listResp.Documents) != 1 {
		return dataset.NewUpdateSliceResponse(), errors.New("document not found")
	}
	sliceEntity := &entity.Slice{
		Info: common.Info{
			ID:        req.GetSliceID(),
			CreatorID: *uid,
		},
		DocumentID: docID,
	}
	if listResp.Documents[0].Type == entity.DocumentTypeTable {
		err = packTableSliceColumnData(ctx, sliceEntity, req.GetRawText(), listResp.Documents[0])
		if err != nil {
			logs.CtxErrorf(ctx, "pack table slice column data failed, err: %v", err)
			return dataset.NewUpdateSliceResponse(), err
		}
	} else {
		sliceEntity.RawContent = []*entity.SliceContent{
			{
				Type: entity.SliceContentTypeText,
				Text: req.RawText,
			},
		}
	}
	err = k.DomainSVC.UpdateSlice(ctx, &knowledge.UpdateSliceRequest{
		SliceID:    req.GetSliceID(),
		DocumentID: docID,
		CreatorID:  ptr.From(uid),
		RawContent: sliceEntity.RawContent,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update slice failed, err: %v", err)
		return dataset.NewUpdateSliceResponse(), err
	}
	return &dataset.UpdateSliceResponse{}, nil
}

func packTableSliceColumnData(ctx context.Context, slice *entity.Slice, text string, doc *entity.Document) error {
	columnMap := map[int64]string{}
	columnTypeMap := map[int64]cd.TableColumnType{}
	for i := range doc.TableInfo.Columns {
		columnMap[doc.TableInfo.Columns[i].ID] = doc.TableInfo.Columns[i].Name
		columnTypeMap[doc.TableInfo.Columns[i].ID] = doc.TableInfo.Columns[i].Type
	}
	dataMap := map[string]string{}
	err := sonic.Unmarshal([]byte(text), &dataMap)
	if err != nil {
		logs.CtxErrorf(ctx, "unmarshal raw text failed, err: %v", err)
		return err
	}
	slice.RawContent = []*entity.SliceContent{
		{
			Type: entity.SliceContentTypeTable,
			Table: &entity.SliceTable{
				Columns: make([]*cd.ColumnData, 0, len(dataMap)),
			},
		},
	}
	for columnID, val := range dataMap {
		cid, err := strconv.ParseInt(columnID, 10, 64)
		if err != nil {
			logs.CtxErrorf(ctx, "parse column id failed, err: %v", err)
			return err
		}
		value := val
		column, err := assertValAs(columnTypeMap[cid], value)
		if err != nil {
			logs.CtxErrorf(ctx, "assert val as failed, err: %v", err)
			return err
		}
		column.ColumnID = cid
		column.ColumnName = columnMap[cid]
		slice.RawContent[0].Table.Columns = append(slice.RawContent[0].Table.Columns, column)
	}
	return nil
}

func (k *KnowledgeApplicationService) ListSlice(ctx context.Context, req *dataset.ListSliceRequest) (*dataset.ListSliceResponse, error) {
	listResp, err := k.DomainSVC.ListSlice(ctx, &knowledge.ListSliceRequest{
		KnowledgeID: req.DatasetID,
		DocumentID:  req.DocumentID,
		Keyword:     req.Keyword,
		Sequence:    req.GetSequence(),
		Limit:       req.GetPageSize(),
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

	var (
		domainResp *knowledge.TableSchemaResponse
		err        error
	)

	if req.SourceFile == nil { // alter table
		domainResp, err = k.DomainSVC.GetAlterTableSchema(ctx, &knowledge.AlterTableSchemaRequest{
			DocumentID:       req.GetDocumentID(),
			TableDataType:    convertTableDataType2Entity(req.GetTableDataType()),
			OriginTableMeta:  convertTableColumns2Entity(req.GetOriginTableMeta()),
			PreviewTableMeta: convertTableColumns2Entity(req.GetPreviewTableMeta()),
		})
	} else {
		var srcInfo *knowledge.TableSourceInfo
		srcInfo, err = convertSourceInfo(req.SourceFile)
		if err != nil {
			return resp, err
		}

		domainResp, err = k.DomainSVC.GetImportDataTableSchema(ctx, &knowledge.ImportDataTableSchemaRequest{
			SourceInfo:       *srcInfo,
			TableSheet:       convertTableSheet2Entity(req.TableSheet),
			TableDataType:    convertTableDataType2Entity(req.GetTableDataType()),
			DocumentID:       req.DocumentID,
			OriginTableMeta:  convertTableColumns2Entity(req.GetOriginTableMeta()),
			PreviewTableMeta: convertTableColumns2Entity(req.GetPreviewTableMeta()),
		})
	}
	if err != nil {
		logs.CtxErrorf(ctx, "get table schema failed, err: %v", err)
		return resp, err
	}

	prevData := make([]map[string]string, 0, len(domainResp.PreviewData))
	for _, data := range domainResp.PreviewData {
		if len(data) == 0 {
			continue
		}
		prev, err := convertTableColumnDataSlice(domainResp.TableMeta, data)
		if err != nil {
			return resp, err
		}
		prevData = append(prevData, prev)
	}

	resp.PreviewData = prevData

	resp.TableMeta = convertTableColumns2Model(domainResp.TableMeta)

	// TODO: sheet list 有个问题，怎么表示当前选中的是哪个？
	resp.SheetList = make([]*dataset.DocTableSheet, 0)
	for i := range domainResp.AllTableSheets {
		if domainResp.AllTableSheets[i] == nil {
			continue
		}
		resp.SheetList = append(resp.SheetList, convertDocTableSheet2Model(*domainResp.AllTableSheets[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) ValidateTableSchema(ctx context.Context, req *dataset.ValidateTableSchemaRequest) (*dataset.ValidateTableSchemaResponse, error) {
	resp := dataset.NewValidateTableSchemaResponse()
	srcInfo, err := convertSourceInfo(req.SourceInfo)
	if err != nil {
		return resp, err
	}
	if srcInfo == nil {
		return nil, fmt.Errorf("source info not provided")
	}
	var tableSheet *entity.TableSheet
	if req.TableSheet != nil {
		tableSheet = &entity.TableSheet{
			SheetId:       req.TableSheet.SheetID,
			HeaderLineIdx: req.TableSheet.HeaderLineIdx,
			StartLineIdx:  req.TableSheet.StartLineIdx,
		}
	}
	domainResp, err := k.DomainSVC.ValidateTableSchema(ctx, &knowledge.ValidateTableSchemaRequest{
		DocumentID: req.GetDocumentID(),
		SourceInfo: *srcInfo,
		TableSheet: tableSheet,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "validate table schema failed, err: %v", err)
		return resp, err
	}
	resp.ColumnValidResult = domainResp.ColumnValidResult
	return resp, nil
}

func (k *KnowledgeApplicationService) GetDocumentTableInfo(ctx context.Context, req *document.GetDocumentTableInfoRequest) (*document.GetDocumentTableInfoResponse, error) {
	domainResp, err := k.DomainSVC.GetDocumentTableInfo(ctx, &knowledge.GetDocumentTableInfoRequest{
		DocumentID: req.DocumentID,
		SourceInfo: &knowledge.TableSourceInfo{
			Uri: req.TosURI,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "get document table info failed, err: %v", err)
		return document.NewGetDocumentTableInfoResponse(), err
	}
	resp := document.NewGetDocumentTableInfoResponse()
	resp.PreviewData = domainResp.PreviewData
	resp.SheetList = make([]*modelCommon.DocTableSheet, 0)
	for i := range domainResp.TableSheet {
		if domainResp.TableSheet[i] == nil {
			continue
		}
		resp.SheetList = append(resp.SheetList, convertDocTableSheet(domainResp.TableSheet[i]))
	}
	resp.TableMeta = map[string][]*modelCommon.DocTableColumn{}
	for index, rows := range domainResp.TableMeta {
		resp.TableMeta[index] = convertTableMeta(rows)
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) CreateDocumentReview(ctx context.Context, req *dataset.CreateDocumentReviewRequest) (*dataset.CreateDocumentReviewResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	createResp, err := k.DomainSVC.CreateDocumentReview(ctx, convertCreateDocReviewReq(req))
	if err != nil {
		logs.CtxErrorf(ctx, "create document review failed, err: %v", err)
		return dataset.NewCreateDocumentReviewResponse(), err
	}
	resp := dataset.NewCreateDocumentReviewResponse()
	resp.DatasetID = req.GetDatasetID()
	resp.Reviews = slices.Transform(createResp.Reviews, func(item *entity.Review) *dataset.Review {
		return &dataset.Review{
			ReviewID:      item.ReviewID,
			DocumentName:  item.DocumentName,
			DocumentType:  item.DocumentType,
			TosURL:        item.Url,
			Status:        convertReviewStatus2Model(item.Status),
			DocTreeTosURL: item.DocTreeTosUrl,
			PreviewTosURL: item.PreviewTosUrl,
		}
	})
	return resp, nil
}

func (k *KnowledgeApplicationService) MGetDocumentReview(ctx context.Context, req *dataset.MGetDocumentReviewRequest) (*dataset.MGetDocumentReviewResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	reviewIDs, err := slices.TransformWithErrorCheck(req.GetReviewIds(), func(s string) (int64, error) {
		id, err := strconv.ParseInt(s, 10, 64)
		return id, err
	})
	if err != nil {
		logs.CtxErrorf(ctx, "parse int failed, err: %v", err)
		return dataset.NewMGetDocumentReviewResponse(), err
	}
	mGetResp, err := k.DomainSVC.MGetDocumentReview(ctx, &knowledge.MGetDocumentReviewRequest{
		KnowledgeID: req.GetDatasetID(),
		ReviewIDs:   reviewIDs,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "mget document review failed, err: %v", err)
		return dataset.NewMGetDocumentReviewResponse(), err
	}
	resp := dataset.NewMGetDocumentReviewResponse()
	resp.Reviews = slices.Transform(mGetResp.Reviews, func(item *entity.Review) *dataset.Review {
		return &dataset.Review{
			ReviewID:      item.ReviewID,
			DocumentName:  item.DocumentName,
			DocumentType:  item.DocumentType,
			TosURL:        item.Url,
			Status:        convertReviewStatus2Model(item.Status),
			DocTreeTosURL: item.DocTreeTosUrl,
			PreviewTosURL: item.PreviewTosUrl,
		}
	})
	resp.DatasetID = req.GetDatasetID()
	return resp, nil
}

func (k *KnowledgeApplicationService) SaveDocumentReview(ctx context.Context, req *dataset.SaveDocumentReviewRequest) (*dataset.SaveDocumentReviewResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	err := k.DomainSVC.SaveDocumentReview(ctx, &knowledge.SaveDocumentReviewRequest{
		KnowledgeID: req.GetDatasetID(),
		DocTreeJson: req.GetDocTreeJSON(),
		ReviewID:    req.GetReviewID(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "save document review failed, err: %v", err)
		return dataset.NewSaveDocumentReviewResponse(), err
	}
	return &dataset.SaveDocumentReviewResponse{}, nil
}
