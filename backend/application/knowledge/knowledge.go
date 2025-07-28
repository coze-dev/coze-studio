/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package knowledge

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/bytedance/sonic"

	modelCommon "github.com/coze-dev/coze-studio/backend/api/model/common"
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/api/model/flow/dataengine/dataset"
	"github.com/coze-dev/coze-studio/backend/api/model/knowledge/document"
	resource "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/search"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	resourceEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	cd "github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/maps"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type KnowledgeApplicationService struct {
	DomainSVC service.Knowledge
	eventBus  search.ResourceEventBus
	storage   storage.Storage
}

var KnowledgeSVC = &KnowledgeApplicationService{}

func (k *KnowledgeApplicationService) CreateKnowledge(ctx context.Context, req *dataset.CreateDatasetRequest) (*dataset.CreateDatasetResponse, error) {
	documentType := convertDocumentTypeDataset2Entity(req.FormatType)
	if documentType == model.DocumentTypeUnknown {
		return dataset.NewCreateDatasetResponse(), errors.New("unknown document type")
	}
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	createReq := service.CreateKnowledgeRequest{
		Name:        req.Name,
		Description: req.Description,
		CreatorID:   ptr.From(uid),
		SpaceID:     req.SpaceID,
		AppID:       req.GetProjectID(),
		FormatType:  documentType,
		IconUri:     req.IconURI,
	}
	if req.IconURI == "" {
		createReq.IconUri = getIconURI(req.GetFormatType())
	}
	domainResp, err := k.DomainSVC.CreateKnowledge(ctx, &createReq)
	if err != nil {
		logs.CtxErrorf(ctx, "create knowledge failed, err: %v", err)
		return dataset.NewCreateDatasetResponse(), err
	}
	var ptrAppID *int64
	if req.ProjectID != 0 {
		ptrAppID = ptr.Of(req.ProjectID)
	}
	err = k.eventBus.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Created,
		Resource: &resourceEntity.ResourceDocument{
			ResType:       resource.ResType_Knowledge,
			ResID:         domainResp.KnowledgeID,
			Name:          ptr.Of(req.Name),
			ResSubType:    ptr.Of(int32(req.FormatType)),
			SpaceID:       ptr.Of(req.SpaceID),
			APPID:         ptrAppID,
			OwnerID:       ptr.Of(*uid),
			PublishStatus: ptr.Of(resource.PublishStatus_Published),
			PublishTimeMS: ptr.Of(domainResp.CreatedAtMs),
			CreateTimeMS:  ptr.Of(domainResp.CreatedAtMs),
			UpdateTimeMS:  ptr.Of(domainResp.CreatedAtMs),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
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

	domainResp, err := k.DomainSVC.ListKnowledge(ctx, &service.ListKnowledgeRequest{
		IDs:     datasetIDs,
		SpaceID: &req.SpaceID,
		AppID:   &req.ProjectID,
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
	request := service.ListKnowledgeRequest{}
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
		request.AppID = ptr.Of(projectID)
	}
	orderBy := model.OrderUpdatedAt
	if req.GetOrderField() == dataset.OrderField_CreateTime {
		orderBy = model.OrderCreatedAt
	}
	request.Order = &orderBy
	orderType := model.OrderTypeDesc
	if req.GetOrderType() == dataset.OrderType_Asc {
		orderType = model.OrderTypeAsc
	}
	if req.GetSpaceID() != 0 {
		request.SpaceID = &req.SpaceID
	}

	request.OrderType = &orderType
	if req.Filter != nil {
		if req.GetFilter().GetName() != "" {
			request.Query = req.GetFilter().Name
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
	err := k.DomainSVC.DeleteKnowledge(ctx, &service.DeleteKnowledgeRequest{
		KnowledgeID: req.GetDatasetID(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "delete knowledge failed, err: %v", err)
		return dataset.NewDeleteDatasetResponse(), err
	}
	err = k.eventBus.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Deleted,
		Resource: &resourceEntity.ResourceDocument{
			ResID:   req.GetDatasetID(),
			ResType: resource.ResType_Knowledge,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
		return dataset.NewDeleteDatasetResponse(), err
	}
	return &dataset.DeleteDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) UpdateKnowledge(ctx context.Context, req *dataset.UpdateDatasetRequest) (*dataset.UpdateDatasetResponse, error) {
	now := time.Now().UnixMilli()
	updateReq := service.UpdateKnowledgeRequest{
		KnowledgeID: req.GetDatasetID(),
		IconUri:     &req.IconURI,
		Description: &req.Description,
	}
	if len(req.GetName()) != 0 {
		updateReq.Name = &req.Name
	}
	if req.Status != nil {
		updateReq.Status = ptr.Of(convertDatasetStatus2Entity(req.GetStatus()))
	}
	err := k.DomainSVC.UpdateKnowledge(ctx, &updateReq)
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return dataset.NewUpdateDatasetResponse(), err
	}
	err = k.eventBus.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Updated,
		Resource: &resourceEntity.ResourceDocument{
			ResType:      resource.ResType_Knowledge,
			ResID:        req.GetDatasetID(),
			Name:         updateReq.Name,
			UpdateTimeMS: ptr.Of(now),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
		return dataset.NewUpdateDatasetResponse(), err
	}
	return &dataset.UpdateDatasetResponse{}, nil
}

func (k *KnowledgeApplicationService) CreateDocument(ctx context.Context, req *dataset.CreateDocumentRequest) (*dataset.CreateDocumentResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	listResp, err := k.DomainSVC.ListKnowledge(ctx, &service.ListKnowledgeRequest{IDs: []int64{req.GetDatasetID()}})
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
		var captionType *dataset.CaptionType
		if req.GetChunkStrategy() != nil {
			captionType = req.GetChunkStrategy().CaptionType
		}
		document := entity.Document{
			Info: model.Info{
				Name:      req.GetDocumentBases()[i].GetName(),
				CreatorID: *uid,
				SpaceID:   knowledgeInfo.SpaceID,
				AppID:     knowledgeInfo.AppID,
			},
			KnowledgeID:      req.GetDatasetID(),
			Type:             convertDocumentTypeDataset2Entity(req.GetFormatType()),
			RawContent:       req.GetDocumentBases()[i].GetSourceInfo().GetCustomContent(),
			URI:              req.GetDocumentBases()[i].GetSourceInfo().GetTosURI(),
			FileExtension:    parser.FileExtension(GetExtension(req.GetDocumentBases()[i].GetSourceInfo().GetTosURI())),
			Source:           docSource,
			IsAppend:         req.GetIsAppend(),
			ParsingStrategy:  convertParsingStrategy2Entity(req.GetParsingStrategy(), req.GetDocumentBases()[i].TableSheet, captionType, req.GetDocumentBases()[i].FilterStrategy),
			ChunkingStrategy: convertChunkingStrategy2Entity(req.GetChunkStrategy()),
			TableInfo: entity.TableInfo{
				Columns: convertTableColumns2Entity(req.GetDocumentBases()[i].GetTableMeta()),
			},
		}
		documents = append(documents, &document)
	}
	resp := dataset.NewCreateDocumentResponse()
	createResp, err := k.DomainSVC.CreateDocument(ctx, &service.CreateDocumentRequest{
		Documents: documents,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "create document failed, err: %v", err)
		return resp, err
	}
	resp.DocumentInfos = make([]*dataset.DocumentInfo, 0)
	for i := range createResp.Documents {
		resp.DocumentInfos = append(resp.DocumentInfos, convertDocument2Model(createResp.Documents[i]))
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) ListDocument(ctx context.Context, req *dataset.ListDocumentRequest) (*dataset.ListDocumentResponse, error) {
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
	listResp, err := k.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{
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
		err = k.DomainSVC.DeleteDocument(ctx, &service.DeleteDocumentRequest{
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
	err := k.DomainSVC.UpdateDocument(ctx, &service.UpdateDocumentRequest{
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
	domainResp, err := k.DomainSVC.MGetDocumentProgress(ctx, &service.MGetDocumentProgressRequest{
		DocumentIDs: docIDs,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "mget document progress failed, err: %v", err)
		return dataset.NewGetDocumentProgressResponse(), err
	}
	resp := dataset.NewGetDocumentProgressResponse()
	resp.Data = make([]*dataset.DocumentProgress, 0)
	for i := range domainResp.ProgressList {
		resp.Data = append(resp.Data, &dataset.DocumentProgress{
			DocumentID:     domainResp.ProgressList[i].ID,
			Progress:       int32(domainResp.ProgressList[i].Progress),
			Status:         convertDocumentStatus2Model(domainResp.ProgressList[i].Status),
			StatusDescript: &domainResp.ProgressList[i].StatusMsg,
			DocumentName:   domainResp.ProgressList[i].Name,
			RemainingTime:  &domainResp.ProgressList[i].RemainingSec,
			Size:           &domainResp.ProgressList[i].Size,
			Type:           &domainResp.ProgressList[i].FileExtension,
			URL:            ptr.Of(domainResp.ProgressList[i].URL),
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
		var captionType *dataset.CaptionType
		if req.GetChunkStrategy() != nil {
			captionType = req.GetChunkStrategy().CaptionType
		}
		resegmentResp, err := k.DomainSVC.ResegmentDocument(ctx, &service.ResegmentDocumentRequest{
			DocumentID:       docID,
			ChunkingStrategy: convertChunkingStrategy2Entity(req.GetChunkStrategy()),
			ParsingStrategy:  convertParsingStrategy2Entity(req.GetParsingStrategy(), nil, captionType, req.FilterStrategy),
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
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	listResp, err := k.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{
		DocumentIDs: []int64{req.GetDocumentID()},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return dataset.NewCreateSliceResponse(), err
	}
	if len(listResp.Documents) != 1 {
		return dataset.NewCreateSliceResponse(), errors.New("document not found")
	}
	sliceEntity := &model.Slice{
		Info: model.Info{
			CreatorID: *uid,
		},
		DocumentID: req.GetDocumentID(),
		Sequence:   req.GetSequence(),
	}
	if listResp.Documents[0].Type == model.DocumentTypeTable {
		err = packTableSliceColumnData(ctx, sliceEntity, req.GetRawText(), listResp.Documents[0])
		if err != nil {
			logs.CtxErrorf(ctx, "pack table slice column data failed, err: %v", err)
			return dataset.NewCreateSliceResponse(), errorx.New(errno.ErrKnowledgeCheckTableSliceValidCode, errorx.KV("msg", err.Error()))
		}
	} else {
		sliceEntity.RawContent = []*model.SliceContent{
			{
				Type: model.SliceContentTypeText,
				Text: req.RawText,
			},
		}
	}
	createResp, err := k.DomainSVC.CreateSlice(ctx, &service.CreateSliceRequest{
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
		err = k.DomainSVC.DeleteSlice(ctx, &service.DeleteSliceRequest{
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
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	getSliceResp, err := k.DomainSVC.GetSlice(ctx, &service.GetSliceRequest{
		SliceID: req.GetSliceID(),
	})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "slice not found"))
	}
	docID := getSliceResp.Slice.DocumentID

	listResp, err := k.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{
		DocumentIDs: []int64{docID},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return dataset.NewUpdateSliceResponse(), err
	}
	if len(listResp.Documents) != 1 {
		return dataset.NewUpdateSliceResponse(), errors.New("document not found")
	}
	sliceEntity := &model.Slice{
		Info: model.Info{
			ID:        req.GetSliceID(),
			CreatorID: *uid,
		},
		DocumentID: docID,
	}
	if listResp.Documents[0].Type == model.DocumentTypeTable {
		err = packTableSliceColumnData(ctx, sliceEntity, req.GetRawText(), listResp.Documents[0])
		if err != nil {
			logs.CtxErrorf(ctx, "pack table slice column data failed, err: %v", err)
			return dataset.NewUpdateSliceResponse(), errorx.New(errno.ErrKnowledgeCheckTableSliceValidCode, errorx.KV("msg", err.Error()))
		}
	} else {
		sliceEntity.RawContent = []*model.SliceContent{
			{
				Type: model.SliceContentTypeText,
				Text: req.RawText,
			},
		}
	}
	err = k.DomainSVC.UpdateSlice(ctx, &service.UpdateSliceRequest{
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

func packTableSliceColumnData(ctx context.Context, slice *model.Slice, text string, doc *entity.Document) error {
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
	slice.RawContent = []*model.SliceContent{
		{
			Type: model.SliceContentTypeTable,
			Table: &model.SliceTable{
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
	listResp, err := k.DomainSVC.ListSlice(ctx, &service.ListSliceRequest{
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
		req.TableDataType = dataset.TableDataTypePtr(dataset.TableDataType(service.AllData))
	}

	var (
		domainResp *service.TableSchemaResponse
		err        error
	)

	if req.SourceFile == nil { // alter table
		domainResp, err = k.DomainSVC.GetAlterTableSchema(ctx, &service.AlterTableSchemaRequest{
			DocumentID:       req.GetDocumentID(),
			TableDataType:    convertTableDataType2Entity(req.GetTableDataType()),
			OriginTableMeta:  convertTableColumns2Entity(req.GetOriginTableMeta()),
			PreviewTableMeta: convertTableColumns2Entity(req.GetPreviewTableMeta()),
		})
	} else {
		var srcInfo *service.TableSourceInfo
		srcInfo, err = convertSourceInfo(req.SourceFile)
		if err != nil {
			return resp, err
		}

		domainResp, err = k.DomainSVC.GetImportDataTableSchema(ctx, &service.ImportDataTableSchemaRequest{
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
		if len(data) != len(domainResp.TableMeta) {
			data = append(data, make([]*cd.ColumnData, len(domainResp.TableMeta)-len(data))...)
		}
		prev, err := convertTableColumnDataSlice(domainResp.TableMeta, data)
		if err != nil {
			return resp, err
		}
		prevData = append(prevData, prev)
	}

	resp.PreviewData = prevData

	resp.TableMeta = convertTableColumns2Model(domainResp.TableMeta)

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
	domainResp, err := k.DomainSVC.ValidateTableSchema(ctx, &service.ValidateTableSchemaRequest{
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
	domainResp, err := k.DomainSVC.GetDocumentTableInfo(ctx, &service.GetDocumentTableInfoRequest{
		DocumentID: req.DocumentID,
		SourceInfo: &service.TableSourceInfo{
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
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
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
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	reviewIDs, err := slices.TransformWithErrorCheck(req.GetReviewIds(), func(s string) (int64, error) {
		id, err := strconv.ParseInt(s, 10, 64)
		return id, err
	})
	if err != nil {
		logs.CtxErrorf(ctx, "parse int failed, err: %v", err)
		return dataset.NewMGetDocumentReviewResponse(), err
	}
	mGetResp, err := k.DomainSVC.MGetDocumentReview(ctx, &service.MGetDocumentReviewRequest{
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
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	err := k.DomainSVC.SaveDocumentReview(ctx, &service.SaveDocumentReviewRequest{
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

func (k *KnowledgeApplicationService) DeleteAppKnowledge(ctx context.Context, req *DeleteAppKnowledgeRequest) error {
	listResp, err := k.DomainSVC.ListKnowledge(ctx, &model.ListKnowledgeRequest{
		AppID: &req.AppID,
	})
	if err != nil {
		return err
	}
	if len(listResp.KnowledgeList) == 0 {
		return nil
	}
	for i := range listResp.KnowledgeList {
		err := k.eventBus.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
			OpType: resourceEntity.Deleted,
			Resource: &resourceEntity.ResourceDocument{
				ResID:   listResp.KnowledgeList[i].ID,
				ResType: resource.ResType_Knowledge,
			},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "publish resources failed, err: %v", err)
			return err
		}
		err = k.DomainSVC.DeleteKnowledge(ctx, &model.DeleteKnowledgeRequest{
			KnowledgeID: listResp.KnowledgeList[i].ID,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (k *KnowledgeApplicationService) CopyKnowledge(ctx context.Context, req *model.CopyKnowledgeRequest) (*model.CopyKnowledgeResponse, error) {
	resp, err := k.DomainSVC.CopyKnowledge(ctx, req)
	if err != nil {
		return nil, err
	}
	getResp, err := k.DomainSVC.GetKnowledgeByID(ctx, &model.GetKnowledgeByIDRequest{
		KnowledgeID: resp.TargetKnowledgeID,
	})
	if err != nil {
		return nil, err
	}
	var appIDPtr *int64
	if req.TargetAppID != 0 {
		appIDPtr = &req.TargetAppID
	}
	if resp.CopyStatus == model.CopyStatus_Successful {
		err = k.eventBus.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
			OpType: resourceEntity.Created,
			Resource: &resourceEntity.ResourceDocument{
				ResID:         resp.TargetKnowledgeID,
				ResType:       resource.ResType_Knowledge,
				ResSubType:    ptr.Of(int32(getResp.Knowledge.Type)),
				Name:          ptr.Of(getResp.Knowledge.Name),
				OwnerID:       ptr.Of(getResp.Knowledge.CreatorID),
				SpaceID:       ptr.Of(getResp.Knowledge.SpaceID),
				APPID:         appIDPtr,
				PublishStatus: ptr.Of(resource.PublishStatus_Published),
				CreateTimeMS:  ptr.Of(getResp.Knowledge.CreatedAtMs),
				UpdateTimeMS:  ptr.Of(getResp.Knowledge.CreatedAtMs),
			},
		})
		if err != nil {
			return nil, err
		}
	}
	return resp, nil
}
func (k *KnowledgeApplicationService) UpdatePhotoCaption(ctx context.Context, req *dataset.UpdatePhotoCaptionRequest) (*dataset.UpdatePhotoCaptionResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	resp := dataset.NewUpdatePhotoCaptionResponse()
	listResp, err := k.DomainSVC.ListSlice(ctx, &service.ListSliceRequest{DocumentID: ptr.Of(req.DocumentID)})
	if err != nil {
		logs.CtxErrorf(ctx, "list slice failed, err: %v", err)
		return resp, err
	}
	if len(listResp.Slices) == 0 {
		return resp, nil
	}
	err = k.DomainSVC.UpdateSlice(ctx, &service.UpdateSliceRequest{
		SliceID:    listResp.Slices[0].ID,
		DocumentID: req.DocumentID,
		CreatorID:  ptr.From(uid),
		RawContent: []*model.SliceContent{{
			Type: model.SliceContentTypeText,
			Text: ptr.Of(req.Caption),
		}},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update slice failed, err: %v", err)
		return resp, err
	}
	return resp, nil
}

func (k *KnowledgeApplicationService) MoveKnowledgeToLibrary(ctx context.Context, req *model.MoveKnowledgeToLibraryRequest) error {
	err := k.DomainSVC.MoveKnowledgeToLibrary(ctx, req)
	if err != nil {
		return err
	}
	err = k.eventBus.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Updated,
		Resource: &resourceEntity.ResourceDocument{
			ResID:        req.KnowledgeID,
			ResType:      resource.ResType_Knowledge,
			APPID:        ptr.Of(int64(0)),
			UpdateTimeMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resources failed, err: %v", err)
		return err
	}
	return nil
}
func (k *KnowledgeApplicationService) ListPhoto(ctx context.Context, req *dataset.ListPhotoRequest) (*dataset.ListPhotoResponse, error) {
	resp := dataset.NewListPhotoResponse()
	var err error
	var offset int
	if req.GetPage() >= 1 {
		offset = int(req.GetSize() * (req.GetPage() - 1))
	}
	listPhotoSliceReq := service.ListPhotoSliceRequest{
		KnowledgeID: req.GetDatasetID(),
		Limit:       ptr.Of(int(req.GetSize())),
		Offset:      &offset,
	}
	if req.Filter != nil {
		listPhotoSliceReq.HasCaption = req.Filter.HasCaption
	}
	listResp, err := k.DomainSVC.ListPhotoSlice(ctx, &listPhotoSliceReq)
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return resp, err
	}
	if len(listResp.Slices) == 0 {
		resp.Total = int32(listResp.Total)
		return resp, nil
	}
	docIDs := slices.Transform(listResp.Slices, func(item *entity.Slice) int64 {
		return item.DocumentID
	})
	listDocResp, err := k.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{DocumentIDs: docIDs, SelectAll: true})
	if err != nil {
		logs.CtxErrorf(ctx, "get documents by slice ids failed, err: %v", err)
		return resp, err
	}
	photos := k.packPhotoInfo(listResp.Slices, listDocResp.Documents)
	sort.SliceStable(photos, func(i, j int) bool {
		return photos[i].UpdateTime > photos[j].UpdateTime
	})
	resp.PhotoInfos = photos
	resp.Total = int32(listResp.Total)
	return resp, nil
}

func (k *KnowledgeApplicationService) packPhotoInfo(slices []*entity.Slice, documents []*entity.Document) []*dataset.PhotoInfo {
	captions := map[int64]string{}
	for i := range slices {
		captions[slices[i].DocumentID] = slices[i].GetSliceContent()
	}
	photoInfo := make([]*dataset.PhotoInfo, 0, len(documents))
	for _, document := range documents {
		photoStatus := convertDocumentStatus2Model(document.Status)
		photoInfo = append(photoInfo, &dataset.PhotoInfo{
			Name:       document.Name,
			DocumentID: document.ID,
			URL:        document.URL,
			Caption:    captions[document.ID],
			CreateTime: int32(document.CreatedAtMs / 1000),
			UpdateTime: int32(document.UpdatedAtMs / 1000),
			CreatorID:  document.CreatorID,
			Type:       string(document.FileExtension),
			Size:       int32(document.Size),
			Status:     photoStatus,
			SourceType: dataset.DocumentSource_Document,
		})
	}
	return photoInfo
}

func (k *KnowledgeApplicationService) PhotoDetail(ctx context.Context, req *dataset.PhotoDetailRequest) (*dataset.PhotoDetailResponse, error) {
	resp := dataset.NewPhotoDetailResponse()
	if len(req.GetDocumentIds()) == 0 {
		resp.Code = 400
		resp.Msg = "document ids is empty"
		return resp, nil
	}
	docIDs, err := slices.TransformWithErrorCheck(req.GetDocumentIds(), func(s string) (int64, error) {
		id, err := strconv.ParseInt(s, 10, 64)
		return id, err
	})
	if err != nil {
		logs.CtxErrorf(ctx, "parse int failed, err: %v", err)
		return resp, err
	}
	listResp, err := k.DomainSVC.ListPhotoSlice(ctx, &service.ListPhotoSliceRequest{DocumentIDs: docIDs})
	if err != nil {
		logs.CtxErrorf(ctx, "list photo slice failed, err: %v", err)
		return resp, err
	}
	listDocResp, err := k.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{DocumentIDs: docIDs, SelectAll: true})
	if err != nil {
		logs.CtxErrorf(ctx, "get documents by slice ids failed, err: %v", err)
		return resp, err
	}
	if err != nil {
		logs.CtxErrorf(ctx, "get documents by slice ids failed, err: %v", err)
		return resp, err
	}
	photos := k.packPhotoInfo(listResp.Slices, listDocResp.Documents)
	sort.SliceStable(photos, func(i, j int) bool {
		return photos[i].UpdateTime > photos[j].UpdateTime
	})
	resp.PhotoInfos = slices.ToMap(photos, func(item *dataset.PhotoInfo) (string, *dataset.PhotoInfo) {
		return strconv.FormatInt(item.DocumentID, 10), item
	})
	return resp, nil
}

func (k *KnowledgeApplicationService) ExtractPhotoCaption(ctx context.Context, req *dataset.ExtractPhotoCaptionRequest) (*dataset.ExtractPhotoCaptionResponse, error) {
	resp := dataset.NewExtractPhotoCaptionResponse()
	if req.GetDocumentID() == 0 {
		resp.Code = 400
		resp.Msg = "document id is empty"
		return resp, nil
	}
	extractResp, err := k.DomainSVC.ExtractPhotoCaption(ctx, &service.ExtractPhotoCaptionRequest{DocumentID: req.GetDocumentID()})
	if err != nil {
		return resp, err
	}
	resp.Caption = extractResp.Caption
	return resp, nil
}

type DeleteAppKnowledgeRequest struct {
	AppID int64 `json:"app_id"`
}
