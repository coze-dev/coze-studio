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

package service

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/bytedance/sonic"
	redisV9 "github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/repository"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/events"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/processor/impl"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/nl2sql"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/rerank"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/messages2query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	rdbEntity "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/parser/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/progressbar"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/rerank/rrf"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func NewKnowledgeSVC(config *KnowledgeSVCConfig) (Knowledge, eventbus.ConsumerHandler) {
	svc := &knowledgeSVC{
		knowledgeRepo:             repository.NewKnowledgeDAO(config.DB),
		documentRepo:              repository.NewKnowledgeDocumentDAO(config.DB),
		sliceRepo:                 repository.NewKnowledgeDocumentSliceDAO(config.DB),
		reviewRepo:                repository.NewKnowledgeDocumentReviewDAO(config.DB),
		idgen:                     config.IDGen,
		rdb:                       config.RDB,
		producer:                  config.Producer,
		searchStoreManagers:       config.SearchStoreManagers,
		parseManager:              config.ParseManager,
		storage:                   config.Storage,
		reranker:                  config.Reranker,
		rewriter:                  config.Rewriter,
		nl2Sql:                    config.NL2Sql,
		enableCompactTable:        ptr.FromOrDefault(config.EnableCompactTable, true),
		cacheCli:                  config.CacheCli,
		isAutoAnnotationSupported: config.IsAutoAnnotationSupported,
		modelFactory:              config.ModelFactory,
	}
	if svc.reranker == nil {
		svc.reranker = rrf.NewRRFReranker(0)
	}
	if svc.parseManager == nil {
		svc.parseManager = builtin.NewManager(config.Storage, config.OCR, nil)
	}

	return svc, svc
}

type KnowledgeSVCConfig struct {
	DB                        *gorm.DB                       // required
	IDGen                     idgen.IDGenerator              // required
	RDB                       rdb.RDB                        // required: 表格存储
	Producer                  eventbus.Producer              // required: 文档 indexing 过程走 mq 异步处理
	SearchStoreManagers       []searchstore.Manager          // required: 向量 / 全文
	ParseManager              parser.Manager                 // optional: 文档切分与处理能力, default builtin parser
	Storage                   storage.Storage                // required: oss
	ModelFactory              chatmodel.Factory              // required: 模型 factory
	Rewriter                  messages2query.MessagesToQuery // optional: 未配置时不改写
	Reranker                  rerank.Reranker                // optional: 未配置时默认 rrf
	NL2Sql                    nl2sql.NL2SQL                  // optional: 未配置时默认不支持
	EnableCompactTable        *bool                          // optional: 表格数据压缩，默认 true
	OCR                       ocr.OCR                        // optional: ocr, 未提供时 ocr 功能不可用
	CacheCli                  cache.Cmdable                  // optional: 缓存实现
	IsAutoAnnotationSupported bool                           // 是否支持了图片自动标注
}

type knowledgeSVC struct {
	knowledgeRepo repository.KnowledgeRepo
	documentRepo  repository.KnowledgeDocumentRepo
	sliceRepo     repository.KnowledgeDocumentSliceRepo
	reviewRepo    repository.KnowledgeDocumentReviewRepo
	modelFactory  chatmodel.Factory

	idgen                     idgen.IDGenerator
	rdb                       rdb.RDB
	producer                  eventbus.Producer
	searchStoreManagers       []searchstore.Manager
	parseManager              parser.Manager
	rewriter                  messages2query.MessagesToQuery
	reranker                  rerank.Reranker
	storage                   storage.Storage
	nl2Sql                    nl2sql.NL2SQL
	cacheCli                  cache.Cmdable
	enableCompactTable        bool // 表格数据压缩
	isAutoAnnotationSupported bool // 是否支持了图片自动标注
}

func (k *knowledgeSVC) CreateKnowledge(ctx context.Context, request *CreateKnowledgeRequest) (response *CreateKnowledgeResponse, err error) {
	now := time.Now().UnixMilli()
	if len(request.Name) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge name is empty"))
	}
	if request.CreatorID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge creator id is empty"))
	}
	if request.SpaceID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge space id is empty"))
	}
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode)
	}

	if err = k.knowledgeRepo.Create(ctx, &model.Knowledge{
		ID:          id,
		Name:        request.Name,
		CreatorID:   request.CreatorID,
		AppID:       request.AppID,
		SpaceID:     request.SpaceID,
		CreatedAt:   now,
		UpdatedAt:   now,
		Status:      int32(knowledgeModel.KnowledgeStatusEnable), // 目前向量库的初始化由文档触发，知识库无 init 过程
		Description: request.Description,
		IconURI:     request.IconUri,
		FormatType:  int32(request.FormatType),
	}); err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	return &CreateKnowledgeResponse{
		KnowledgeID: id,
		CreatedAtMs: now,
	}, nil
}

func (k *knowledgeSVC) UpdateKnowledge(ctx context.Context, request *UpdateKnowledgeRequest) error {
	if request.KnowledgeID == 0 {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge id is empty"))
	}
	if request.Name != nil && len(*request.Name) == 0 {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge name is empty"))
	}
	knModel, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if knModel == nil {
		return errorx.New(errno.ErrKnowledgeNotExistCode, errorx.KV("msg", "knowledge not found"))
	}
	now := time.Now().UnixMilli()
	if request.Status != nil {
		knModel.Status = int32(*request.Status)
	}
	if request.Name != nil {
		knModel.Name = *request.Name
	}
	if request.IconUri != nil {
		knModel.IconURI = *request.IconUri
	}
	if request.Description != nil {
		knModel.Description = *request.Description
	}
	knModel.UpdatedAt = now
	if err := k.knowledgeRepo.Update(ctx, knModel); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	knowledge, err := k.fromModelKnowledge(ctx, knModel)
	if err != nil {
		return err
	}
	knowledge.UpdatedAtMs = now
	return err
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, request *DeleteKnowledgeRequest) error {
	// 先获取一下knowledge的信息
	knModel, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if knModel == nil || knModel.ID == 0 {
		return errorx.New(errno.ErrKnowledgeNotExistCode, errorx.KV("msg", "knowledge not found"))
	}
	docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
		KnowledgeIDs: []int64{request.KnowledgeID},
		SelectAll:    true,
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if knModel.FormatType == int32(knowledgeModel.DocumentTypeTable) {
		for _, doc := range docs {
			if doc == nil {
				continue
			}
			if doc.TableInfo != nil {
				resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
					TableName: doc.TableInfo.PhysicalTableName,
					IfExists:  true,
				})
				if err != nil {
					logs.CtxWarnf(ctx, "[DeleteKnowledge] drop table failed, err %v", err)
				}
				if !resp.Success {
					logs.CtxWarnf(ctx, "[DeleteKnowledge] drop table failed")
				}
			}
		}
	}
	collectionName := getCollectionName(request.KnowledgeID)
	for _, mgr := range k.searchStoreManagers {
		if err = mgr.Drop(ctx, &searchstore.DropRequest{CollectionName: collectionName}); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", err.Error()))
		}
	}

	err = k.knowledgeRepo.Delete(ctx, request.KnowledgeID)
	if err != nil {
		return err
	}

	if err = k.documentRepo.DeleteDocuments(ctx, slices.Transform(docs, func(a *model.KnowledgeDocument) int64 {
		return a.ID
	})); err != nil {
		logs.CtxErrorf(ctx, "[DeleteKnowledge] delete documents failed, err %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	return nil
}

func (k *knowledgeSVC) ListKnowledge(ctx context.Context, request *ListKnowledgeRequest) (response *ListKnowledgeResponse, err error) {
	if len(request.IDs) == 0 && request.AppID == nil && request.SpaceID == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge ids, project id, space id and query can not be all empty"))
	}
	opts := &entity.WhereKnowledgeOption{
		KnowledgeIDs: request.IDs,
		AppID:        request.AppID,
		SpaceID:      request.SpaceID,
		Name:         request.Name,
		Status:       request.Status,
		UserID:       request.UserID,
		Query:        request.Query,
		Page:         request.Page,
		PageSize:     request.PageSize,
		Order:        convertOrder(request.Order),
		OrderType:    convertOrderType(request.OrderType),
	}
	if request.FormatType != nil {
		opts.FormatType = ptr.Of(int64(*request.FormatType))
	}
	pos, total, err := k.knowledgeRepo.FindKnowledgeByCondition(ctx, opts)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	knList := make([]*knowledgeModel.Knowledge, len(pos))
	for i := range pos {
		if pos[i] == nil {
			continue
		}
		knList[i], err = k.fromModelKnowledge(ctx, pos[i])
		if err != nil {
			return nil, err
		}
	}

	return &ListKnowledgeResponse{
		KnowledgeList: knList,
		Total:         total,
	}, nil
}

func (k *knowledgeSVC) checkRequest(request *CreateDocumentRequest) error {
	if len(request.Documents) == 0 {
		return errors.New("document is empty")
	}
	for i := range request.Documents {
		if request.Documents[i].Type == knowledgeModel.DocumentTypeImage && ptr.From(request.Documents[i].ParsingStrategy.CaptionType) == parser.ImageAnnotationTypeModel {
			if !k.isAutoAnnotationSupported {
				return errors.New("auto caption type is not supported")
			}
		}
		if request.Documents[i].ChunkingStrategy != nil {
			if request.Documents[i].ChunkingStrategy.ChunkType == parser.ChunkTypeDefault {
				request.Documents[i].ChunkingStrategy = getDefaultChunkStrategy()
			}
		}
	}
	return nil
}

func (k *knowledgeSVC) CreateDocument(ctx context.Context, request *CreateDocumentRequest) (response *CreateDocumentResponse, err error) {
	if err = k.checkRequest(request); err != nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", err.Error()))
	}
	if err = k.documentsURL2URI(ctx, request.Documents); err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDownloadFailedCode, errorx.KV("msg", err.Error()))
	}
	userID := request.Documents[0].CreatorID
	spaceID := request.Documents[0].SpaceID
	documentSource := request.Documents[0].Source
	docProcessor := impl.NewDocProcessor(ctx, &impl.DocProcessorConfig{
		UserID:         userID,
		SpaceID:        spaceID,
		DocumentSource: documentSource,
		Documents:      request.Documents,
		KnowledgeRepo:  k.knowledgeRepo,
		DocumentRepo:   k.documentRepo,
		SliceRepo:      k.sliceRepo,
		Idgen:          k.idgen,
		Producer:       k.producer,
		ParseManager:   k.parseManager,
		Storage:        k.storage,
		Rdb:            k.rdb,
	})
	// 1. 前置的动作，上传 tos 等
	err = docProcessor.BeforeCreate()
	if err != nil {
		return nil, err
	}
	// 2. 构建 落库
	err = docProcessor.BuildDBModel()
	if err != nil {
		return nil, err
	}
	// 3. 插入数据库
	err = docProcessor.InsertDBModel()
	if err != nil {
		return nil, err
	}
	// 4. 发起索引任务
	err = docProcessor.Indexing()
	if err != nil {
		return nil, err
	}
	// 5. 返回处理后的文档信息
	docs := docProcessor.GetResp()
	return &CreateDocumentResponse{
		Documents: docs,
	}, nil
}

func (k *knowledgeSVC) UpdateDocument(ctx context.Context, request *UpdateDocumentRequest) error {
	if request == nil {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	doc, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if request.DocumentName != nil {
		doc.Name = *request.DocumentName
	}

	if doc.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		// 如果是表格类型，可能是要改table的meta
		if doc.TableInfo != nil {
			finalColumns, err := k.alterTableSchema(ctx, doc.TableInfo.Columns, request.TableInfo.Columns, doc.TableInfo.PhysicalTableName)
			if err != nil {
				return err
			}
			doc.TableInfo.VirtualTableName = doc.Name
			if len(request.TableInfo.Columns) != 0 {
				doc.TableInfo.Columns = finalColumns
			}
		}
	}
	doc.UpdatedAt = time.Now().UnixMilli()
	err = k.documentRepo.Update(ctx, doc)
	if err != nil {
		logs.CtxErrorf(ctx, "[UpdateDocument] update document failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (k *knowledgeSVC) DeleteDocument(ctx context.Context, request *DeleteDocumentRequest) error {
	if request == nil {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	doc, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if doc == nil || doc.ID == 0 {
		logs.CtxWarnf(ctx, "[DeleteDocument] document not found, doc_id: %d", request.DocumentID)
		return nil
	}

	if doc.DocumentType == int32(knowledgeModel.DocumentTypeTable) && doc.TableInfo != nil {
		resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: doc.TableInfo.PhysicalTableName,
			IfExists:  true,
		})
		if err != nil {
			logs.CtxWarnf(ctx, "[DeleteDocument] drop table failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
		}
		if !resp.Success {
			logs.CtxWarnf(ctx, "[DeleteDocument] drop table failed")
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", "drop table failed"))
		}
	}

	err = k.documentRepo.DeleteDocuments(ctx, []int64{request.DocumentID})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	sliceIDs, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{request.DocumentID})
	if err != nil {
		logs.CtxErrorf(ctx, "[DeleteDocument] get document slice ids failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	if err = k.emitDeleteKnowledgeDataEvent(ctx, doc.KnowledgeID, sliceIDs, strconv.FormatInt(request.DocumentID, 10)); err != nil {
		return err
	}

	return nil
}

func (k *knowledgeSVC) ListDocument(ctx context.Context, request *ListDocumentRequest) (response *ListDocumentResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	opts := entity.WhereDocumentOpt{
		StatusNotIn: []int32{int32(entity.DocumentStatusDeleted)},
	}
	if request.Limit != nil {
		opts.Limit = ptr.From(request.Limit)
	}
	if request.Offset != nil {
		opts.Offset = request.Offset
	}
	if request.Cursor != nil {
		opts.Cursor = request.Cursor
	}
	if len(request.DocumentIDs) > 0 {
		opts.IDs = request.DocumentIDs
	}
	if request.KnowledgeID != 0 {
		opts.KnowledgeIDs = []int64{request.KnowledgeID}
	}
	if request.SelectAll {
		opts.SelectAll = true
	}
	documents, total, err := k.documentRepo.FindDocumentByCondition(ctx, &opts)
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	resp := &ListDocumentResponse{
		Total: total,
	}
	if len(documents)+ptr.From(opts.Offset) < int(total) {
		resp.HasMore = true
		if len(documents) > 0 {
			nextCursor := strconv.FormatInt(documents[len(documents)-1].ID, 10)
			resp.NextCursor = &nextCursor
		}
	}
	resp.Documents = []*entity.Document{}
	for i := range documents {
		docItem, err := k.fromModelDocument(ctx, documents[i])
		if err != nil {
			return nil, err
		}
		resp.Documents = append(resp.Documents, docItem)
	}
	return resp, nil
}

func (k *knowledgeSVC) MGetDocumentProgress(ctx context.Context, request *MGetDocumentProgressRequest) (response *MGetDocumentProgressResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	documents, err := k.documentRepo.MGetByID(ctx, request.DocumentIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "mget document failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	progresslist := []*DocumentProgress{}
	for i := range documents {
		item := DocumentProgress{
			ID:            documents[i].ID,
			Name:          documents[i].Name,
			Size:          documents[i].Size,
			FileExtension: documents[i].FileExtension,
			Status:        entity.DocumentStatus(documents[i].Status),
			StatusMsg:     entity.DocumentStatus(documents[i].Status).String(),
		}
		if documents[i].DocumentType == int32(knowledge.DocumentTypeImage) && len(documents[i].URI) != 0 {
			item.URL, err = k.storage.GetObjectUrl(ctx, documents[i].URI)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
			}
		}
		if documents[i].Status == int32(entity.DocumentStatusEnable) || documents[i].Status == int32(entity.DocumentStatusFailed) {
			item.Progress = progressbar.ProcessDone
		} else {
			if documents[i].FailReason != "" {
				item.StatusMsg = documents[i].FailReason
				item.Status = entity.DocumentStatusFailed
				progresslist = append(progresslist, &item)
				continue
			}
			err = k.getProgressFromCache(ctx, &item)
			if err != nil {
				logs.CtxErrorf(ctx, "get progress from cache failed, err: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeGetDocProgressFailCode, errorx.KV("msg", err.Error()))
			}
		}
		progresslist = append(progresslist, &item)
	}
	return &MGetDocumentProgressResponse{
		ProgressList: progresslist,
	}, nil
}

func (k *knowledgeSVC) getProgressFromCache(ctx context.Context, documentProgress *DocumentProgress) (err error) {
	progressBar := progressbar.NewProgressBar(ctx, documentProgress.ID, 0, k.cacheCli, false)
	percent, remainSec, errMsg := progressBar.GetProgress(ctx)
	documentProgress.Progress = int(percent)
	documentProgress.RemainingSec = int64(remainSec)
	if len(errMsg) != 0 {
		documentProgress.Status = entity.DocumentStatusFailed
		documentProgress.StatusMsg = errMsg
		return err
	}
	return err
}

func (k *knowledgeSVC) ResegmentDocument(ctx context.Context, request *ResegmentDocumentRequest) (response *ResegmentDocumentResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	if request.ChunkingStrategy != nil {
		if request.ChunkingStrategy.ChunkType == parser.ChunkTypeDefault {
			request.ChunkingStrategy = getDefaultChunkStrategy()
		}
	}
	doc, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if doc == nil || doc.ID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "document not found"))
	}
	docEntity, err := k.fromModelDocument(ctx, doc)
	if err != nil {
		return nil, err
	}
	docEntity.ChunkingStrategy = request.ChunkingStrategy
	docEntity.ParsingStrategy = request.ParsingStrategy
	event := events.NewIndexDocumentEvent(docEntity.KnowledgeID, docEntity)
	body, err := sonic.Marshal(event)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}
	doc.ParseRule.ChunkingStrategy = request.ChunkingStrategy
	doc.ParseRule.ParsingStrategy = request.ParsingStrategy
	doc.Status = int32(entity.DocumentStatusChunking)
	err = k.documentRepo.Update(ctx, doc)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(docEntity.KnowledgeID, 10))); err != nil {
		return nil, errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", err.Error()))
	}
	docEntity.Status = entity.DocumentStatusChunking
	return &ResegmentDocumentResponse{
		Document: docEntity,
	}, nil
}

func (k *knowledgeSVC) CreateSlice(ctx context.Context, request *CreateSliceRequest) (response *CreateSliceResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	docInfo, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if docInfo == nil || docInfo.ID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "document not found"))
	}
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		_, total, err := k.sliceRepo.FindSliceByCondition(ctx, &entity.WhereSliceOpt{
			DocumentID: docInfo.ID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "FindSliceByCondition err:%v", err)
			return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		request.Position = total + 1
	}
	slices, err := k.sliceRepo.GetSliceBySequence(ctx, request.DocumentID, request.Position)
	if err != nil {
		logs.CtxErrorf(ctx, "get slice by sequence failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	now := time.Now().UnixMilli()
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "gen id failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode)
	}
	sliceInfo := model.KnowledgeDocumentSlice{
		ID:          id,
		KnowledgeID: docInfo.KnowledgeID,
		DocumentID:  docInfo.ID,
		CreatedAt:   now,
		UpdatedAt:   now,
		CreatorID:   request.CreatorID,
		SpaceID:     docInfo.SpaceID,
		Status:      int32(knowledgeModel.SliceStatusInit),
	}
	if len(slices) == 0 {
		if request.Position == 0 {
			request.Position = 1
			sliceInfo.Sequence = 1
		} else {
			return nil, errorx.New(errno.ErrKnowledgeSliceInsertPositionIllegalCode)
		}
	}
	if len(slices) == 1 {
		if request.Position == 1 || request.Position == 0 {
			// 插入到最前面
			sliceInfo.Sequence = slices[0].Sequence - 1
		} else {
			sliceInfo.Sequence = slices[0].Sequence + 1
		}
	}
	if len(slices) == 2 {
		if request.Position == 0 || request.Position == 1 {
			sliceInfo.Sequence = slices[0].Sequence - 1
		} else {
			if slices[0].Sequence+1 < slices[1].Sequence {
				sliceInfo.Sequence = float64(int(slices[0].Sequence) + 1)
			} else {
				sliceInfo.Sequence = (slices[0].Sequence + slices[1].Sequence) / 2
			}
		}
	}
	sliceEntity := entity.Slice{
		Info: knowledgeModel.Info{
			ID:        id,
			CreatorID: request.CreatorID,
		},
		DocumentID: request.DocumentID,
		RawContent: request.RawContent,
	}
	docEntity, err := k.fromModelDocument(ctx, docInfo)
	if err != nil {
		logs.CtxErrorf(ctx, "fromModelDocument failed, err: %v", err)
		return nil, err
	}
	indexSliceEvent := events.NewIndexSliceEvent(&sliceEntity, docEntity)
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeText) ||
		docInfo.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		sliceInfo.Content = sliceEntity.GetSliceContent()
	}
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		sliceEntity.ID = sliceInfo.ID
		err = k.upsertDataToTable(ctx, docInfo.TableInfo, []*entity.Slice{&sliceEntity})
		if err != nil {
			logs.CtxErrorf(ctx, "insert data to table failed, err: %v", err)
			return nil, err
		}
	}
	err = k.sliceRepo.Create(ctx, &sliceInfo)
	if err != nil {
		logs.CtxErrorf(ctx, "create slice failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	body, err := sonic.Marshal(&indexSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(sliceInfo.DocumentID, 10))); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", err.Error()))
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, docInfo.ID); err != nil {
		logs.CtxErrorf(ctx, "update document slice info failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return &CreateSliceResponse{
		SliceID: id,
	}, nil
}

func (k *knowledgeSVC) UpdateSlice(ctx context.Context, request *UpdateSliceRequest) error {
	if request == nil {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	sliceInfo, err := k.sliceRepo.MGetSlices(ctx, []int64{request.SliceID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget slice failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if len(sliceInfo) != 1 {
		return errorx.New(errno.ErrKnowledgeSliceNotExistCode)
	}
	docInfo, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if docInfo == nil || docInfo.ID == 0 {
		return errorx.New(errno.ErrKnowledgeDocumentNotExistCode)
	}
	// 更新数据库中的存储
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeText) ||
		docInfo.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		sliceEntity := entity.Slice{RawContent: request.RawContent}
		sliceInfo[0].Content = sliceEntity.GetSliceContent()
	}
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeImage) {
		sliceInfo[0].Content = ptr.From(request.RawContent[0].Text)
	}
	docEntity, err := k.fromModelDocument(ctx, docInfo)
	if err != nil {
		logs.CtxErrorf(ctx, "fromModelDocument failed, err: %v", err)
		return err
	}
	sliceInfo[0].UpdatedAt = time.Now().UnixMilli()
	sliceInfo[0].Status = int32(knowledgeModel.SliceStatusInit)
	indexSliceEvent := events.NewIndexSliceEvent(&entity.Slice{
		Info: knowledgeModel.Info{
			ID: sliceInfo[0].ID,
		},
		KnowledgeID: sliceInfo[0].KnowledgeID,
		DocumentID:  sliceInfo[0].DocumentID,
		RawContent:  request.RawContent,
	}, docEntity)
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		indexSliceEvent.Slice.ID = sliceInfo[0].ID
		err = k.upsertDataToTable(ctx, docInfo.TableInfo, []*entity.Slice{indexSliceEvent.Slice})
		if err != nil {
			logs.CtxErrorf(ctx, "upsert data to table failed, err: %v", err)
			return err
		}
	}
	err = k.sliceRepo.Update(ctx, sliceInfo[0])
	if err != nil {
		logs.CtxErrorf(ctx, "update slice failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	body, err := sonic.Marshal(&indexSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(sliceInfo[0].DocumentID, 10))); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", err.Error()))
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, docInfo.ID); err != nil {
		logs.CtxErrorf(ctx, "update document slice info failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (k *knowledgeSVC) DeleteSlice(ctx context.Context, request *DeleteSliceRequest) error {
	if request == nil {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	sliceInfo, err := k.sliceRepo.MGetSlices(ctx, []int64{request.SliceID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget slice failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if len(sliceInfo) != 1 {
		logs.CtxWarnf(ctx, "slice not found, slice_id: %d", request.SliceID)
		return nil
	}
	docInfo, err := k.documentRepo.GetByID(ctx, sliceInfo[0].DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if docInfo == nil || docInfo.ID == 0 {
		return errorx.New(errno.ErrKnowledgeDocumentNotExistCode)
	}
	if docInfo.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		_, err := k.rdb.DeleteData(ctx, &rdb.DeleteDataRequest{
			TableName: docInfo.TableInfo.PhysicalTableName,
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    consts.RDBFieldID,
						Operator: rdbEntity.OperatorEqual,
						Value:    request.SliceID,
					},
				},
			},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete data failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
		}
	}
	// 删除数据库中的存储
	err = k.sliceRepo.Delete(ctx, &model.KnowledgeDocumentSlice{ID: request.SliceID})
	if err != nil {
		logs.CtxErrorf(ctx, "delete slice failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	if err = k.emitDeleteKnowledgeDataEvent(ctx, sliceInfo[0].KnowledgeID, []int64{request.SliceID}, strconv.FormatInt(sliceInfo[0].DocumentID, 10)); err != nil {
		return err
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, docInfo.ID); err != nil {
		logs.CtxErrorf(ctx, "update document slice info failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (k *knowledgeSVC) ListSlice(ctx context.Context, request *ListSliceRequest) (response *ListSliceResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	if request.DocumentID == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "document_id is empty"))
	}
	doc, err := k.documentRepo.GetByID(ctx, ptr.From(request.DocumentID))
	if err != nil {
		logs.CtxErrorf(ctx, "get document failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	resp := ListSliceResponse{}
	if doc.Status == int32(entity.DocumentStatusDeleted) {
		return &resp, nil
	}

	slices, total, err := k.sliceRepo.FindSliceByCondition(ctx, &entity.WhereSliceOpt{
		KnowledgeID: ptr.From(request.KnowledgeID),
		DocumentID:  ptr.From(request.DocumentID),
		Keyword:     request.Keyword,
		Sequence:    request.Sequence,
		PageSize:    request.Limit,
		Offset:      request.Offset,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list slice failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	if total > (request.Sequence + request.Limit) {
		resp.HasMore = true
	} else {
		resp.HasMore = false
	}
	resp.Total = int(total)
	var sliceMap map[int64]*entity.Slice
	// 如果是表格类型，那么去table中取一下原始数据
	if doc.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		// 从数据库中查询原始数据
		sliceMap, err = k.selectTableData(ctx, doc.TableInfo, slices)
		if err != nil {
			logs.CtxErrorf(ctx, "select table data failed, err: %v", err)
			return nil, err
		}
	}
	resp.Slices = []*entity.Slice{}
	for i := range slices {
		resp.Slices = append(resp.Slices, k.fromModelSlice(ctx, slices[i]))
		if sliceMap[slices[i].ID] != nil {
			resp.Slices[i].RawContent = sliceMap[slices[i].ID].RawContent
		}
		resp.Slices[i].Sequence = request.Sequence + 1 + int64(i)
	}
	return &resp, nil
}

func (k *knowledgeSVC) GetSlice(ctx context.Context, request *GetSliceRequest) (response *GetSliceResponse, err error) {
	slices, err := k.sliceRepo.MGetSlices(ctx, []int64{request.SliceID})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}

	if len(slices) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeSliceNotExistCode)
	}

	return &GetSliceResponse{
		Slice: k.fromModelSlice(ctx, slices[0]),
	}, nil
}

func getDefaultChunkStrategy() *entity.ChunkingStrategy {
	return &entity.ChunkingStrategy{
		ChunkType:       parser.ChunkTypeDefault,
		ChunkSize:       consts.DefaultChunkSize,
		Separator:       consts.DefaultSeparator,
		Overlap:         consts.DefaultOverlap,
		TrimSpace:       consts.DefaultTrimSpace,
		TrimURLAndEmail: consts.DefaultTrimURLAndEmail,
	}
}
func (k *knowledgeSVC) CreateDocumentReview(ctx context.Context, request *CreateDocumentReviewRequest) (response *CreateDocumentReviewResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	if request.ChunkStrategy != nil {
		if request.ChunkStrategy.ChunkType == parser.ChunkTypeDefault {
			request.ChunkStrategy = getDefaultChunkStrategy()
		}
	}
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		logs.CtxErrorf(ctx, "get knowledge failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if kn == nil {
		return nil, errorx.New(errno.ErrKnowledgeNotExistCode)
	}
	documentIDs := make([]int64, 0, len(request.Reviews))
	documentMap := make(map[int64]*model.KnowledgeDocument)
	for _, input := range request.Reviews {
		if input.DocumentID != nil && *input.DocumentID > 0 {
			documentIDs = append(documentIDs, *input.DocumentID)
		}
	}
	if len(documentIDs) > 0 {
		documents, err := k.documentRepo.MGetByID(ctx, documentIDs)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		for _, document := range documents {
			documentMap[document.ID] = document
		}
	}
	reviews := make([]*entity.Review, 0, len(request.Reviews))
	for _, input := range request.Reviews {
		review := &entity.Review{
			DocumentName: input.DocumentName,
			DocumentType: input.DocumentType,
			Uri:          input.TosUri,
		}
		if input.DocumentID != nil && *input.DocumentID > 0 {
			if document, ok := documentMap[*input.DocumentID]; ok {
				review.DocumentName = document.Name
				names := strings.Split(document.URI, "/")
				objectName := strings.Split(names[len(names)-1], ".")
				review.DocumentType = objectName[len(objectName)-1]
				review.Uri = document.URI
			}
		}
		review.Url, err = k.storage.GetObjectUrl(ctx, review.Uri)
		if err != nil {
			logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
			return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
		}
		reviews = append(reviews, review)
	}
	// STEP 1. 生成ID
	reviewIDs, err := k.genMultiIDs(ctx, len(request.Reviews))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode)
	}
	for i := range request.Reviews {
		reviews[i].ReviewID = ptr.Of(reviewIDs[i])
	}
	modelReviews := make([]*model.KnowledgeDocumentReview, 0, len(reviews))
	for _, review := range reviews {
		modelReviews = append(modelReviews, &model.KnowledgeDocumentReview{
			ID:          *review.ReviewID,
			KnowledgeID: request.KnowledgeID,
			SpaceID:     kn.SpaceID,
			Name:        review.DocumentName,
			Type:        review.DocumentType,
			URI:         review.Uri,
			CreatorID:   *uid,
		})
	}
	err = k.reviewRepo.CreateInBatches(ctx, modelReviews)
	if err != nil {
		logs.CtxErrorf(ctx, "create review failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	for i := range reviews {
		review := reviews[i]
		doc := &entity.Document{
			KnowledgeID:      request.KnowledgeID,
			ParsingStrategy:  request.ParsingStrategy,
			ChunkingStrategy: request.ChunkStrategy,
			Type:             knowledgeModel.DocumentTypeText,
			URI:              review.Uri,
			FileExtension:    parser.FileExtension(review.DocumentType),
			Info: knowledgeModel.Info{
				Name:      review.DocumentName,
				CreatorID: *uid,
			},
			Source: entity.DocumentSourceLocal,
		}
		reviewEvent := events.NewDocumentReviewEvent(doc, review)
		body, err := sonic.Marshal(&reviewEvent)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
			return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
		}
		err = k.producer.Send(ctx, body)
		if err != nil {
			logs.CtxErrorf(ctx, "send message failed, err: %v", err)
			return nil, errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", err.Error()))
		}
	}
	return &CreateDocumentReviewResponse{
		Reviews: reviews,
	}, nil
}

func (k *knowledgeSVC) MGetDocumentReview(ctx context.Context, request *MGetDocumentReviewRequest) (response *MGetDocumentReviewResponse, err error) {
	reviews, err := k.reviewRepo.MGetByIDs(ctx, request.ReviewIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "mget review failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	for _, review := range reviews {
		if review.KnowledgeID != request.KnowledgeID {
			return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge_id and doc not match"))
		}
	}
	reviewEntity := make([]*entity.Review, 0, len(reviews))
	for _, review := range reviews {
		status := entity.ReviewStatus(review.Status)
		var reviewTosURL, reviewChunkRespTosURL string
		if review.URI != "" {
			reviewTosURL, err = k.getObjectURL(ctx, review.URI)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
			}
		}
		if review.ChunkRespURI != "" {
			reviewChunkRespTosURL, err = k.getObjectURL(ctx, review.ChunkRespURI)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
			}
		}
		reviewEntity = append(reviewEntity, &entity.Review{
			ReviewID:      &review.ID,
			DocumentName:  review.Name,
			DocumentType:  review.Type,
			Url:           reviewTosURL,
			Status:        &status,
			DocTreeTosUrl: ptr.Of(reviewChunkRespTosURL),
			PreviewTosUrl: ptr.Of(reviewTosURL),
		})
	}
	return &MGetDocumentReviewResponse{
		Reviews: reviewEntity,
	}, nil
}

func (k *knowledgeSVC) SaveDocumentReview(ctx context.Context, request *SaveDocumentReviewRequest) error {
	if request == nil {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	review, err := k.reviewRepo.GetByID(ctx, request.ReviewID)
	if err != nil {
		logs.CtxErrorf(ctx, "get review failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	uri := review.ChunkRespURI
	if review.Status == int32(entity.ReviewStatus_Enable) && len(uri) > 0 {
		newTosUri := fmt.Sprintf("DocReview/%d_%d_%d.txt", review.CreatorID, time.Now().UnixMilli(), review.ID)
		err = k.storage.PutObject(ctx, newTosUri, []byte(request.DocTreeJson))
		if err != nil {
			logs.CtxErrorf(ctx, "put object failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", err.Error()))
		}
		err = k.reviewRepo.UpdateReview(ctx, review.ID, map[string]interface{}{
			"chunk_resp_uri": newTosUri,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "update review chunk uri failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
	}
	return nil
}

func (k *knowledgeSVC) documentsURL2URI(ctx context.Context, docs []*entity.Document) error {
	download := func(url string) ([]byte, error) {
		resp, err := http.Get(url)
		if err != nil {
			return nil, fmt.Errorf("http get failed, %w", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("download file failed, status code=%d", resp.StatusCode)
		}
		data, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("read all failed, %w", err)
		}
		return data, nil
	}

	// same as UploadFile
	const baseWord = "1Aa2Bb3Cc4Dd5Ee6Ff7Gg8Hh9Ii0JjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"
	createURI := func(uid int64, fileType string) string {
		num := 10
		input := fmt.Sprintf("upload_%d_Ma*9)fhi_%d_gou_%s_rand_%d", uid, time.Now().Unix(), fileType, rand.Intn(100000))
		hash := sha256.Sum256([]byte(fmt.Sprintf("%s", input)))
		hashString := base64.StdEncoding.EncodeToString(hash[:])
		if len(hashString) > num {
			hashString = hashString[:num]
		}
		secret := ""
		for _, char := range hashString {
			index := int(char) % 62
			secret += string(baseWord[index])
		}
		suffix := fmt.Sprintf("%d_%d_%s.%s", uid, time.Now().UnixNano(), secret, fileType)
		uri := fmt.Sprintf("%s/%s", developer_api.FileBizType_BIZ_BOT_DATASET, suffix)
		return uri
	}

	for _, doc := range docs {
		if doc.URI != "" || doc.URL == "" {
			continue
		}
		b, err := download(doc.URL)
		if err != nil {
			return fmt.Errorf("[documentsURL2URI] download document failed, %w", err)
		}
		uri := createURI(doc.CreatorID, string(doc.FileExtension))
		if err = k.storage.PutObject(ctx, uri, b); err != nil {
			return fmt.Errorf("[documentsURL2URI] upload document failed, %w", err)
		}
		doc.URI = uri
	}

	return nil
}

func (k *knowledgeSVC) emitDeleteKnowledgeDataEvent(ctx context.Context, knowledgeID int64, sliceIDs []int64, shardingKey string) error {
	deleteSliceEvent := events.NewDeleteKnowledgeDataEvent(knowledgeID, sliceIDs)
	body, err := sonic.Marshal(&deleteSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(shardingKey)); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (k *knowledgeSVC) fromModelKnowledge(ctx context.Context, knowledge *model.Knowledge) (*knowledgeModel.Knowledge, error) {
	if knowledge == nil {
		return nil, nil
	}
	sliceHit, err := k.sliceRepo.GetSliceHitByKnowledgeID(ctx, knowledge.ID)
	if err != nil {
		logs.CtxErrorf(ctx, "get slice hit count failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	knEntity := &knowledgeModel.Knowledge{
		Info: knowledgeModel.Info{
			ID:          knowledge.ID,
			Name:        knowledge.Name,
			Description: knowledge.Description,
			IconURI:     knowledge.IconURI,
			CreatorID:   knowledge.CreatorID,
			SpaceID:     knowledge.SpaceID,
			CreatedAtMs: knowledge.CreatedAt,
			UpdatedAtMs: knowledge.UpdatedAt,
			AppID:       knowledge.AppID,
		},
		SliceHit: sliceHit,
		Type:     knowledgeModel.DocumentType(knowledge.FormatType),
		Status:   knowledgeModel.KnowledgeStatus(knowledge.Status),
	}

	if knowledge.IconURI != "" {
		objUrl, err := k.storage.GetObjectUrl(ctx, knowledge.IconURI)
		if err != nil {
			logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
			return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
		}
		knEntity.IconURL = objUrl
	}
	return knEntity, nil
}

func (k *knowledgeSVC) fromModelDocument(ctx context.Context, document *model.KnowledgeDocument) (*entity.Document, error) {
	if document == nil {
		return nil, nil
	}
	documentEntity := &entity.Document{
		Info: knowledgeModel.Info{
			ID:          document.ID,
			Name:        document.Name,
			CreatorID:   document.CreatorID,
			SpaceID:     document.SpaceID,
			CreatedAtMs: document.CreatedAt,
			UpdatedAtMs: document.UpdatedAt,
		},
		Type:             knowledgeModel.DocumentType(document.DocumentType),
		KnowledgeID:      document.KnowledgeID,
		URI:              document.URI,
		Size:             document.Size,
		SliceCount:       document.SliceCount,
		CharCount:        document.CharCount,
		FileExtension:    parser.FileExtension(document.FileExtension),
		Source:           entity.DocumentSource(document.SourceType),
		Status:           entity.DocumentStatus(document.Status),
		ParsingStrategy:  document.ParseRule.ParsingStrategy,
		ChunkingStrategy: document.ParseRule.ChunkingStrategy,
	}
	if document.TableInfo != nil {
		documentEntity.TableInfo = *document.TableInfo
		documentEntity.TableInfo.Columns = make([]*entity.TableColumn, 0)
		for i := range document.TableInfo.Columns {
			if document.TableInfo.Columns[i] == nil {
				continue
			}
			if document.TableInfo.Columns[i].Name == consts.RDBFieldID {
				continue
			}
			documentEntity.TableInfo.Columns = append(documentEntity.TableInfo.Columns, document.TableInfo.Columns[i])
		}
	}
	switch document.Status {
	case int32(entity.DocumentStatusChunking), int32(entity.DocumentStatusInit), int32(entity.DocumentStatusUploading):
		if document.FailReason != "" {
			documentEntity.Status = entity.DocumentStatusFailed
			documentEntity.StatusMsg = document.FailReason
		}
	case int32(entity.DocumentStatusFailed):
		documentEntity.StatusMsg = document.FailReason
	default:
	}
	if len(document.URI) != 0 {
		objUrl, err := k.storage.GetObjectUrl(ctx, document.URI)
		if err != nil {
			logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
			return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", err.Error()))
		}
		documentEntity.URL = objUrl
	}
	return documentEntity, nil
}

func (k *knowledgeSVC) fromModelSlice(ctx context.Context, slice *model.KnowledgeDocumentSlice) *entity.Slice {
	if slice == nil {
		return nil
	}
	s := &entity.Slice{
		Info: knowledgeModel.Info{
			ID:          slice.ID,
			CreatorID:   slice.CreatorID,
			SpaceID:     slice.SpaceID,
			CreatedAtMs: slice.CreatedAt,
			UpdatedAtMs: slice.UpdatedAt,
		},
		DocumentID:  slice.DocumentID,
		KnowledgeID: slice.KnowledgeID,
		ByteCount:   int64(len(slice.Content)),
		CharCount:   int64(utf8.RuneCountInString(slice.Content)),
		Hit:         slice.Hit,
		SliceStatus: knowledgeModel.SliceStatus(slice.Status),
	}
	if slice.Content != "" {
		processedContent := k.formatSliceContent(ctx, slice.Content)
		s.RawContent = make([]*knowledgeModel.SliceContent, 0)
		s.RawContent = append(s.RawContent, &knowledgeModel.SliceContent{
			Type: knowledgeModel.SliceContentTypeText,
			Text: ptr.Of(processedContent),
		})
	}
	return s
}

func convertOrderType(orderType *knowledgeModel.OrderType) *entity.OrderType {
	if orderType == nil {
		return nil
	}
	odType := *orderType
	switch odType {
	case knowledgeModel.OrderTypeAsc:
		return ptr.Of(entity.OrderTypeAsc)
	case knowledgeModel.OrderTypeDesc:
		return ptr.Of(entity.OrderTypeDesc)
	default:
		return ptr.Of(entity.OrderTypeDesc)
	}
}

func convertOrder(order *knowledgeModel.Order) *entity.Order {
	if order == nil {
		return nil
	}
	od := *order
	switch od {
	case knowledgeModel.OrderCreatedAt:
		return ptr.Of(entity.OrderCreatedAt)
	case knowledgeModel.OrderUpdatedAt:
		return ptr.Of(entity.OrderUpdatedAt)
	default:
		return ptr.Of(entity.OrderCreatedAt)
	}
}

func (k *knowledgeSVC) GetKnowledgeByID(ctx context.Context, request *GetKnowledgeByIDRequest) (response *GetKnowledgeByIDResponse, err error) {
	if request == nil || request.KnowledgeID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if kn == nil || kn.ID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeNotExistCode, errorx.KV("msg", "knowledge not found"))
	}
	knEntity, err := k.fromModelKnowledge(ctx, kn)
	if err != nil {
		return nil, err
	}
	return &GetKnowledgeByIDResponse{
		Knowledge: knEntity,
	}, nil
}

func (k *knowledgeSVC) ListPhotoSlice(ctx context.Context, request *ListPhotoSliceRequest) (response *ListPhotoSliceResponse, err error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	sliceArr, total, err := k.sliceRepo.FindSliceByCondition(ctx, &entity.WhereSliceOpt{
		KnowledgeID: request.KnowledgeID,
		DocumentIDs: request.DocumentIDs,
		Offset:      int64(ptr.From(request.Offset)),
		PageSize:    int64(ptr.From(request.Limit)),
		NotEmpty:    request.HasCaption,
	})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	response = &ListPhotoSliceResponse{
		Total: int(total),
		Slices: slices.Transform(sliceArr, func(item *model.KnowledgeDocumentSlice) *entity.Slice {
			res := k.fromModelSlice(ctx, item)
			return res
		}),
	}
	return response, nil
}

func (k *knowledgeSVC) ExtractPhotoCaption(ctx context.Context, request *ExtractPhotoCaptionRequest) (response *ExtractPhotoCaptionResponse, err error) {
	response = &ExtractPhotoCaptionResponse{}
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	if !k.isAutoAnnotationSupported {
		return nil, errorx.New(errno.ErrKnowledgeAutoAnnotationNotSupportedCode, errorx.KV("msg", "auto annotation is not supported"))
	}
	docInfo, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if docInfo == nil || docInfo.ID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "document not found"))
	}
	docEntity, err := k.fromModelDocument(ctx, docInfo)
	if err != nil {
		return nil, err
	}
	docEntity.ParsingStrategy.CaptionType = ptr.Of(parser.ImageAnnotationTypeModel)
	parser, err := k.parseManager.GetParser(convert.DocumentToParseConfig(docEntity))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeGetParserFailCode, errorx.KV("msg", err.Error()))
	}
	imageByte, err := k.storage.GetObject(ctx, docEntity.URI)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeGetObjectFailCode, errorx.KV("msg", err.Error()))
	}
	reader := bytes.NewReader(imageByte)
	schemaDoc, err := parser.Parse(ctx, reader)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KV("msg", err.Error()))
	}
	if len(schemaDoc) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KV("msg", "parse fail, schema doc is empty"))
	}
	response.Caption = schemaDoc[0].Content
	return response, nil
}

func (k *knowledgeSVC) MGetKnowledgeByID(ctx context.Context, request *MGetKnowledgeByIDRequest) (response *MGetKnowledgeByIDResponse, err error) {
	if request == nil || len(request.KnowledgeIDs) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}

	models, err := k.knowledgeRepo.MGetByID(ctx, request.KnowledgeIDs)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	response = &MGetKnowledgeByIDResponse{}
	response.Knowledge = make([]*knowledgeModel.Knowledge, 0, len(models))
	for _, model := range models {
		if model == nil {
			continue
		}
		kn, err := k.fromModelKnowledge(ctx, model)
		if err != nil {
			return nil, err
		}
		response.Knowledge = append(response.Knowledge, kn)
	}
	return response, nil
}

const (
	expireTime = 21600
	cacheTime  = 7200
)

func (k *knowledgeSVC) getObjectURL(ctx context.Context, uri string) (string, error) {
	cmd := k.cacheCli.Get(ctx, uri)
	if cmd.Err() != nil {
		url, err := k.storage.GetObjectUrl(ctx, uri, storage.WithExpire(expireTime))
		if err != nil {
			return "", errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KV("msg", fmt.Sprintf("get object url failed, %v", err)))
		}
		if errors.Is(cmd.Err(), redisV9.Nil) {
			err = k.cacheCli.Set(ctx, uri, url, cacheTime*time.Second).Err()
			if err != nil {
				logs.CtxErrorf(ctx, "[getObjectURL] set cache failed, %v", err)
			}
		}
		return url, nil
	}

	url := cmd.Val()
	return url, nil
}

func (k *knowledgeSVC) genMultiIDs(ctx context.Context, counts int) ([]int64, error) {
	allIDs := make([]int64, 0)
	for l := 0; l < counts; l += 100 {
		r := min(l+100, counts)
		batchSize := r - l
		ids, err := k.idgen.GenMultiIDs(ctx, batchSize)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("GenMultiIDs failed, err: %v", err)))
		}
		allIDs = append(allIDs, ids...)
	}
	return allIDs, nil
}
