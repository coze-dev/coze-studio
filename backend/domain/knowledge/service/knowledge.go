package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/bytedance/sonic"
	"gorm.io/gorm"

	resCommon "code.byted.org/flow/opencoze/backend/api/model/resource/common"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/processor/impl"
	resourceEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/nl2sql"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/ocr"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/rerank"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/messages2query"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/infra/contract/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/document/parser/builtin"
	"code.byted.org/flow/opencoze/backend/infra/impl/document/rerank/rrf"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func NewKnowledgeSVC(config *KnowledgeSVCConfig) (knowledge.Knowledge, eventbus.ConsumerHandler) {
	svc := &knowledgeSVC{
		knowledgeRepo:       dao.NewKnowledgeDAO(config.DB),
		documentRepo:        dao.NewKnowledgeDocumentDAO(config.DB),
		sliceRepo:           dao.NewKnowledgeDocumentSliceDAO(config.DB),
		reviewRepo:          dao.NewKnowledgeDocumentReviewDAO(config.DB),
		idgen:               config.IDGen,
		rdb:                 config.RDB,
		producer:            config.Producer,
		searchStoreManagers: config.SearchStoreManagers,
		parseManager:        config.ParseManager,
		storage:             config.Storage,
		imageX:              config.ImageX,
		reranker:            config.Reranker,
		rewriter:            config.Rewriter,
		nl2Sql:              config.NL2Sql,
		domainNotifier:      config.DomainNotifier,
		enableCompactTable:  ptr.FromOrDefault(config.EnableCompactTable, true),
	}
	if svc.reranker == nil {
		svc.reranker = rrf.NewRRFReranker(0)
	}
	if svc.parseManager == nil {
		svc.parseManager = builtin.NewManager(config.Storage, config.OCR)
	}

	return svc, svc
}

type KnowledgeSVCConfig struct {
	DB                  *gorm.DB                       // required
	IDGen               idgen.IDGenerator              // required
	RDB                 rdb.RDB                        // required: 表格存储
	Producer            eventbus.Producer              // required: 文档 indexing 过程走 mq 异步处理
	DomainNotifier      crossdomain.DomainNotifier     // required: search域事件生产者
	SearchStoreManagers []searchstore.Manager          // required: 向量 / 全文
	ParseManager        parser.Manager                 // optional: 文档切分与处理能力, default builtin parser
	Storage             storage.Storage                // required: oss
	ImageX              imagex.ImageX                  // TODO: 确认下 oss 是否返回 uri / url
	Rewriter            messages2query.MessagesToQuery // optional: 未配置时不改写
	Reranker            rerank.Reranker                // optional: 未配置时默认 rrf
	NL2Sql              nl2sql.NL2SQL                  // optional: 未配置时默认不支持
	EnableCompactTable  *bool                          // optional: 表格数据压缩，默认 true
	OCR                 ocr.OCR                        // optional: ocr, 未提供时 ocr 功能不可用
}

type knowledgeSVC struct {
	knowledgeRepo dao.KnowledgeRepo
	documentRepo  dao.KnowledgeDocumentRepo
	sliceRepo     dao.KnowledgeDocumentSliceRepo
	reviewRepo    dao.KnowledgeDocumentReviewRepo

	idgen               idgen.IDGenerator
	rdb                 rdb.RDB
	producer            eventbus.Producer
	domainNotifier      crossdomain.DomainNotifier
	searchStoreManagers []searchstore.Manager
	parseManager        parser.Manager
	rewriter            messages2query.MessagesToQuery
	reranker            rerank.Reranker
	storage             storage.Storage
	nl2Sql              nl2sql.NL2SQL
	imageX              imagex.ImageX

	enableCompactTable bool // 表格数据压缩
}

func (k *knowledgeSVC) CreateKnowledge(ctx context.Context, request *knowledge.CreateKnowledgeRequest) (response *knowledge.CreateKnowledgeResponse, err error) {
	now := time.Now().UnixMilli()
	if len(request.Name) == 0 {
		return nil, errors.New("knowledge name is empty")
	}
	if request.CreatorID == 0 {
		return nil, errors.New("knowledge creator id is empty")
	}
	if request.SpaceID == 0 {
		return nil, errors.New("knowledge space id is empty")
	}
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	if err = k.knowledgeRepo.Create(ctx, &model.Knowledge{
		ID:          id,
		Name:        request.Name,
		CreatorID:   request.CreatorID,
		ProjectID:   conv.Int64ToStr(request.ProjectID),
		SpaceID:     request.SpaceID,
		CreatedAt:   now,
		UpdatedAt:   now,
		Status:      int32(entity.KnowledgeStatusEnable), // 目前向量库的初始化由文档触发，知识库无 init 过程
		Description: request.Description,
		IconURI:     request.IconUri,
		FormatType:  int32(request.FormatType),
	}); err != nil {
		return nil, err
	}

	err = k.domainNotifier.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Created,
		Resource: &resourceEntity.ResourceDocument{
			ResType:      resCommon.ResType_Knowledge,
			ResID:        id,
			Name:         ptr.Of(request.Name),
			ResSubType:   ptr.Of(int32(request.FormatType)),
			SpaceID:      ptr.Of(request.SpaceID),
			OwnerID:      ptr.Of(request.CreatorID),
			CreateTimeMS: ptr.Of(now),
			UpdateTimeMS: ptr.Of(now),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
	}
	return &knowledge.CreateKnowledgeResponse{
		KnowledgeID: id,
		CreatedAtMs: now,
	}, err
}

func (k *knowledgeSVC) UpdateKnowledge(ctx context.Context, request *knowledge.UpdateKnowledgeRequest) error {
	if request.KnowledgeID == 0 {
		return errors.New("knowledge id is empty")
	}
	if request.Name != nil && len(*request.Name) == 0 {
		return errors.New("knowledge name is empty")
	}
	knModel, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return err
	}
	if knModel == nil {
		return errors.New("knowledge not found")
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
	if err := k.knowledgeRepo.Update(ctx, knModel); err != nil {
		return err
	}
	knowledge := k.fromModelKnowledge(ctx, knModel)
	knowledge.UpdatedAtMs = now
	err = k.domainNotifier.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Updated,
		Resource: &resourceEntity.ResourceDocument{
			ResType:      resCommon.ResType_Knowledge,
			ResID:        knowledge.ID,
			Name:         &knowledge.Name,
			ResSubType:   ptr.Of(int32(knowledge.Type)),
			SpaceID:      ptr.Of(knowledge.SpaceID),
			OwnerID:      ptr.Of(knowledge.CreatorID),
			UpdateTimeMS: ptr.Of(now),
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
	}
	return err
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, request *knowledge.DeleteKnowledgeRequest) error {
	// 先获取一下knowledge的信息
	knModel, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return err
	}
	if knModel == nil || knModel.ID == 0 {
		return errors.New("knowledge not found")
	}
	if knModel.FormatType == int32(entity.DocumentTypeTable) {
		docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
			KnowledgeIDs: []int64{knModel.ID},
		})
		if err != nil {
			return err
		}
		for _, doc := range docs {
			if doc.TableInfo != nil {
				resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
					TableName: doc.TableInfo.PhysicalTableName,
					IfExists:  true,
				})
				if err != nil {
					logs.CtxWarnf(ctx, "[DeleteKnowledge] drop table failed, err %v", err)
				}
				if !resp.Success {
					logs.CtxWarnf(ctx, "[DeleteKnowledge] drop table failed without err?")
				}
			}
		}
	}
	collectionName := getCollectionName(request.KnowledgeID)
	for _, mgr := range k.searchStoreManagers {
		if err = mgr.Drop(ctx, &searchstore.DropRequest{CollectionName: collectionName}); err != nil {
			return err
		}
	}

	err = k.knowledgeRepo.Delete(ctx, request.KnowledgeID)
	if err != nil {
		return err
	}

	docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		KnowledgeIDs: []int64{request.KnowledgeID},
	})
	if err != nil {
		return fmt.Errorf("[DeleteKnowledge] FindDocumentByCondition failed, %w", err)
	}

	if err = k.documentRepo.SoftDeleteDocuments(ctx, slices.Transform(docs, func(a *model.KnowledgeDocument) int64 {
		return a.ID
	})); err != nil {
		return fmt.Errorf("[DeleteDocument] soft delete documents failed, err: %v", err)
	}

	err = k.domainNotifier.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Deleted,
		Resource: &resourceEntity.ResourceDocument{
			ResID: request.KnowledgeID,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
	}
	return err
}

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context) {
	// 这个有哪些场景要讨论一下，目前能想到的场景有跨空间复制
	// TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) ListKnowledge(ctx context.Context, request *knowledge.ListKnowledgeRequest) (response *knowledge.ListKnowledgeResponse, err error) {
	if len(request.IDs) == 0 && request.ProjectID == nil && request.SpaceID == nil {
		return nil, errors.New("knowledge ids, project id, space id and query can not be all empty")
	}
	opts := &dao.WhereKnowledgeOption{
		KnowledgeIDs: request.IDs,
		ProjectID:    ptr.Of(conv.Int64ToStr(ptr.From(request.ProjectID))),
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
		return nil, err
	}
	knList := make([]*entity.Knowledge, len(pos))
	for i := range pos {
		if pos[i] == nil {
			continue
		}
		knList[i] = k.fromModelKnowledge(ctx, pos[i])
	}

	return &knowledge.ListKnowledgeResponse{
		KnowledgeList: knList,
		Total:         total,
	}, nil
}

func (k *knowledgeSVC) CreateDocument(ctx context.Context, request *knowledge.CreateDocumentRequest) (response *knowledge.CreateDocumentResponse, err error) {
	if len(request.Documents) == 0 {
		return nil, errors.New("document is empty")
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
	return &knowledge.CreateDocumentResponse{
		Documents: docs,
	}, nil
}

func (k *knowledgeSVC) UpdateDocument(ctx context.Context, request *knowledge.UpdateDocumentRequest) error {
	if request == nil {
		return errors.New("request is null")
	}
	doc, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return err
	}
	if request.DocumentName != nil {
		doc.Name = *request.DocumentName
	}

	if doc.DocumentType == int32(entity.DocumentTypeTable) {
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
		// todo，如果是更改索引列怎么处理
	}
	err = k.documentRepo.Update(ctx, doc)
	if err != nil {
		return err
	}
	return nil
}

func (k *knowledgeSVC) DeleteDocument(ctx context.Context, request *knowledge.DeleteDocumentRequest) error {
	if request == nil {
		return errors.New("request is null")
	}
	doc, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return errors.New("document not found")
	}
	if doc == nil || doc.ID == 0 {
		return errors.New("document not found")
	}

	if doc.DocumentType == int32(entity.DocumentTypeTable) && doc.TableInfo != nil {
		resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: doc.TableInfo.PhysicalTableName,
			IfExists:  true,
		})
		if err != nil {
			logs.CtxWarnf(ctx, "[DeleteDocument] drop table failed, err: %v", err)
		}
		if !resp.Success {
			logs.CtxWarnf(ctx, "[DeleteDocument] drop table failed, err")
		}
	}

	err = k.documentRepo.SoftDeleteDocuments(ctx, []int64{request.DocumentID})
	if err != nil {
		return fmt.Errorf("[DeleteDocument] soft delete documents failed, err: %v", err)
	}

	sliceIDs, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{request.DocumentID})
	if err != nil {
		return fmt.Errorf("[DeleteDocument] get document slices failed, %w", err)
	}

	if err = k.emitDeleteKnowledgeDataEvent(ctx, doc.KnowledgeID, sliceIDs, strconv.FormatInt(request.DocumentID, 10)); err != nil {
		return fmt.Errorf("[DeleteDocument] emitDeleteKnowledgeDataEvent failed, err: %v", err)
	}

	return nil
}

func (k *knowledgeSVC) ListDocument(ctx context.Context, request *knowledge.ListDocumentRequest) (response *knowledge.ListDocumentResponse, err error) {
	if request == nil {
		return nil, errors.New("request is null")
	}
	opts := dao.WhereDocumentOpt{
		StatusNotIn: []int32{int32(entity.DocumentStatusDeleted)},
	}
	if request.Limit != nil {
		opts.Limit = *request.Limit
	} else {
		opts.Limit = 50 // todo，放到默认值里
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
	documents, total, err := k.documentRepo.FindDocumentByCondition(ctx, &opts)
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return nil, err
	}

	resp := &knowledge.ListDocumentResponse{
		Total: total,
	}
	if len(documents) < int(total) {
		resp.HasMore = true
		nextCursor := strconv.FormatInt(documents[len(documents)-1].ID, 10)
		resp.NextCursor = &nextCursor
	}
	resp.Documents = []*entity.Document{}
	for i := range documents {
		resp.Documents = append(resp.Documents, k.fromModelDocument(ctx, documents[i]))
	}
	return resp, nil
}

func (k *knowledgeSVC) MGetDocumentProgress(ctx context.Context, request *knowledge.MGetDocumentProgressRequest) (response *knowledge.MGetDocumentProgressResponse, err error) {
	if request == nil {
		return nil, errors.New("request is null")
	}
	documents, err := k.documentRepo.MGetByID(ctx, request.DocumentIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "mget document failed, err: %v", err)
		return nil, err
	}
	progresslist := []*knowledge.DocumentProgress{}
	for i := range documents {
		item := knowledge.DocumentProgress{
			ID:            documents[i].ID,
			Name:          documents[i].Name,
			Size:          documents[i].Size,
			FileExtension: documents[i].FileExtension,
			Progress:      100, // 这个进度怎么计算，之前也是粗估的
			Status:        entity.DocumentStatus(documents[i].Status),
			StatusMsg:     entity.DocumentStatus(documents[i].Status).String(),
			RemainingSec:  0, // 这个是计算已经用了多长时间了？
		}
		progresslist = append(progresslist, &item)
	}
	return &knowledge.MGetDocumentProgressResponse{
		ProgressList: progresslist,
	}, nil
}

func (k *knowledgeSVC) ResegmentDocument(ctx context.Context, request *knowledge.ResegmentDocumentRequest) (response *knowledge.ResegmentDocumentResponse, err error) {
	if request == nil {
		return nil, errors.New("request is null")
	}
	doc, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		return nil, err
	}
	if doc == nil || doc.ID == 0 {
		return nil, errors.New("document not found")
	}
	docEntity := k.fromModelDocument(ctx, doc)
	docEntity.ChunkingStrategy = request.ChunkingStrategy
	docEntity.ParsingStrategy = request.ParsingStrategy
	body, err := sonic.Marshal(&entity.Event{
		Type:     entity.EventTypeIndexDocument,
		Document: docEntity,
	})
	if err != nil {
		return nil, err
	}

	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(docEntity.KnowledgeID, 10))); err != nil {
		return nil, err
	}
	return &knowledge.ResegmentDocumentResponse{
		Document: docEntity,
	}, nil
}

func (k *knowledgeSVC) CreateSlice(ctx context.Context, request *knowledge.CreateSliceRequest) (response *knowledge.CreateSliceResponse, err error) {
	if request == nil {
		return nil, errors.New("request is null")
	}
	docInfo, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return nil, err
	}
	if docInfo == nil || docInfo.ID == 0 {
		return nil, errors.New("document not found")
	}
	if docInfo.DocumentType == int32(entity.DocumentTypeTable) {
		_, total, err := k.sliceRepo.FindSliceByCondition(ctx, &dao.WhereSliceOpt{
			DocumentID: docInfo.ID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "FindSliceByCondition err:%v", err)
			return nil, err
		}
		request.Position = total + 1
	}
	slices, err := k.sliceRepo.GetSliceBySequence(ctx, request.DocumentID, request.Position)
	if err != nil {
		logs.CtxErrorf(ctx, "get slice by sequence failed, err: %v", err)
		return nil, err
	}
	now := time.Now().UnixMilli()
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "gen id failed, err: %v", err)
		return nil, err
	}
	sliceInfo := model.KnowledgeDocumentSlice{
		ID:          id,
		KnowledgeID: docInfo.KnowledgeID,
		DocumentID:  docInfo.ID,
		CreatedAt:   now,
		UpdatedAt:   now,
		CreatorID:   request.CreatorID,
		SpaceID:     docInfo.SpaceID,
		Status:      int32(entity.SliceStatusInit),
	}
	if len(slices) == 0 {
		if request.Position == 0 {
			request.Position = 1
			sliceInfo.Sequence = 1
		} else {
			err = fmt.Errorf("the inserted slice position is illegal")
			return nil, err
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
		Info: common.Info{
			ID:        id,
			CreatorID: request.CreatorID,
		},
		DocumentID: request.DocumentID,
		RawContent: request.RawContent,
	}
	indexSliceEvent := entity.Event{
		Type:  entity.EventTypeIndexSlice,
		Slice: &sliceEntity,
	}
	if docInfo.DocumentType == int32(entity.DocumentTypeText) ||
		docInfo.DocumentType == int32(entity.DocumentTypeTable) {
		sliceInfo.Content = sliceEntity.GetSliceContent()
	}
	if docInfo.DocumentType == int32(entity.DocumentTypeTable) {
		err = k.upsertDataToTable(ctx, docInfo.TableInfo, []*entity.Slice{&sliceEntity}, []int64{sliceInfo.ID})
		if err != nil {
			logs.CtxErrorf(ctx, "insert data to table failed, err: %v", err)
			return nil, err
		}
	}
	err = k.sliceRepo.Create(ctx, &sliceInfo)
	if err != nil {
		logs.CtxErrorf(ctx, "create slice failed, err: %v", err)
		return nil, err
	}
	body, err := sonic.Marshal(&indexSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return nil, err
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(sliceInfo.DocumentID, 10))); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return nil, err
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, docInfo.ID); err != nil {
		logs.CtxErrorf(ctx, "update document slice info failed, err: %v", err)
		return nil, err
	}
	return &knowledge.CreateSliceResponse{
		SliceID: id,
	}, nil
}

func (k *knowledgeSVC) UpdateSlice(ctx context.Context, request *knowledge.UpdateSliceRequest) error {
	if request == nil {
		return errors.New("request is null")
	}
	sliceInfo, err := k.sliceRepo.MGetSlices(ctx, []int64{request.SliceID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget slice failed, err: %v", err)
		return err
	}
	if len(sliceInfo) != 1 {
		return errors.New("slice not found")
	}
	docInfo, err := k.documentRepo.GetByID(ctx, request.DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return err
	}
	if docInfo == nil || docInfo.ID == 0 {
		return errors.New("document not found")
	}
	// 更新数据库中的存储
	if docInfo.DocumentType == int32(entity.DocumentTypeText) ||
		docInfo.DocumentType == int32(entity.DocumentTypeTable) {
		sliceEntity := entity.Slice{RawContent: request.RawContent}
		sliceInfo[0].Content = sliceEntity.GetSliceContent()
	}
	sliceInfo[0].UpdatedAt = time.Now().UnixMilli()
	sliceInfo[0].Status = int32(entity.SliceStatusInit)
	indexSliceEvent := entity.Event{
		Type: entity.EventTypeIndexSlice,
		Slice: &entity.Slice{
			Info: common.Info{
				ID: sliceInfo[0].ID,
			},
			KnowledgeID: sliceInfo[0].KnowledgeID,
			DocumentID:  sliceInfo[0].DocumentID,
			RawContent:  request.RawContent,
		},
	}

	if docInfo.DocumentType == int32(entity.DocumentTypeTable) {
		// todo更新表里的内容
		err = k.upsertDataToTable(ctx, docInfo.TableInfo, []*entity.Slice{indexSliceEvent.Slice}, []int64{sliceInfo[0].ID})
		if err != nil {
			logs.CtxErrorf(ctx, "upsert data to table failed, err: %v", err)
			return err
		}
	}
	err = k.sliceRepo.Update(ctx, sliceInfo[0])
	if err != nil {
		logs.CtxErrorf(ctx, "update slice failed, err: %v", err)
		return err
	}
	body, err := sonic.Marshal(&indexSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return err
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(sliceInfo[0].DocumentID, 10))); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return err
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, docInfo.ID); err != nil {
		logs.CtxErrorf(ctx, "update document slice info failed, err: %v", err)
		return err
	}
	return nil
}

func (k *knowledgeSVC) DeleteSlice(ctx context.Context, request *knowledge.DeleteSliceRequest) error {
	if request == nil {
		return errors.New("request is null")
	}
	sliceInfo, err := k.sliceRepo.MGetSlices(ctx, []int64{request.SliceID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget slice failed, err: %v", err)
		return err
	}
	if len(sliceInfo) != 1 {
		return errors.New("slice not found")
	}
	docInfo, err := k.documentRepo.GetByID(ctx, sliceInfo[0].DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return err
	}
	if docInfo == nil || docInfo.ID == 0 {
		return errors.New("document not found")
	}
	if docInfo.DocumentType == int32(entity.DocumentTypeTable) {
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
			return err
		}
	}
	// 删除数据库中的存储
	err = k.sliceRepo.Delete(ctx, &model.KnowledgeDocumentSlice{ID: request.SliceID})
	if err != nil {
		logs.CtxErrorf(ctx, "delete slice failed, err: %v", err)
		return err
	}

	if err = k.emitDeleteKnowledgeDataEvent(ctx, sliceInfo[0].KnowledgeID, []int64{request.SliceID}, strconv.FormatInt(sliceInfo[0].DocumentID, 10)); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return fmt.Errorf("[DeleteSlice] send message failed, %w", err)
	}

	return nil
}

func (k *knowledgeSVC) ListSlice(ctx context.Context, request *knowledge.ListSliceRequest) (response *knowledge.ListSliceResponse, err error) {
	if request == nil {
		return nil, fmt.Errorf("[ListSlice] request is null")
	}
	if request.DocumentID == nil {
		return nil, fmt.Errorf("[ListSlice] document id not provided")
	}
	doc, err := k.documentRepo.GetByID(ctx, ptr.From(request.DocumentID))
	if err != nil {
		logs.CtxErrorf(ctx, "get document failed, err: %v", err)
		return nil, err
	}
	resp := knowledge.ListSliceResponse{}
	if doc.Status == int32(entity.DocumentStatusDeleted) {
		return &resp, nil
	}

	slices, total, err := k.sliceRepo.FindSliceByCondition(ctx, &dao.WhereSliceOpt{
		KnowledgeID: ptr.From(request.KnowledgeID),
		DocumentID:  ptr.From(request.DocumentID),
		Keyword:     request.Keyword,
		Sequence:    request.Sequence,
		PageSize:    request.Limit,
		Offset:      request.Offset,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "list slice failed, err: %v", err)
		return nil, err
	}

	if total > (request.Sequence + request.Limit) {
		resp.HasMore = true
	} else {
		resp.HasMore = false
	}
	resp.Total = int(total)
	var sliceMap map[int64]*entity.Slice
	// 如果是表格类型，那么去table中取一下原始数据
	if doc.DocumentType == int32(entity.DocumentTypeTable) {
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

func (k *knowledgeSVC) GetSlice(ctx context.Context, request *knowledge.GetSliceRequest) (response *knowledge.GetSliceResponse, err error) {
	slices, err := k.sliceRepo.MGetSlices(ctx, []int64{request.SliceID})
	if err != nil {
		return nil, fmt.Errorf("[GetSlice] repo query failed, %w", err)
	}

	if len(slices) == 0 {
		return nil, fmt.Errorf("[GetSlice] slice not found, id=%d", request.SliceID)
	}

	return &knowledge.GetSliceResponse{
		Slice: k.fromModelSlice(ctx, slices[0]),
	}, nil
}

func (k *knowledgeSVC) CreateDocumentReview(ctx context.Context, request *knowledge.CreateDocumentReviewRequest) (response *knowledge.CreateDocumentReviewResponse, err error) {
	if request == nil {
		return nil, errors.New("request is null")
	}
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		logs.CtxErrorf(ctx, "get knowledge failed, err: %v", err)
		return nil, err
	}
	if kn == nil {
		return nil, errors.New("knowledge not found")
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
			return nil, err
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
			return nil, err
		}
		reviews = append(reviews, review)
	}
	// STEP 1. 生成ID
	reviewIDs, err := k.idgen.GenMultiIDs(ctx, len(request.Reviews))
	if err != nil {
		return nil, err
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
		return nil, err
	}
	for i := range reviews {
		review := reviews[i]
		reviewEvent := entity.Event{
			Type:           entity.EventTypeDocumentReview,
			DocumentReview: review,
			Document: &entity.Document{
				KnowledgeID:      request.KnowledgeID,
				ParsingStrategy:  request.ParsingStrategy,
				ChunkingStrategy: request.ChunkStrategy,
				Type:             entity.DocumentTypeText,
				URI:              review.Uri,
				FileExtension:    parser.FileExtension(review.DocumentType),
				Info: common.Info{
					Name:      review.DocumentName,
					CreatorID: *uid,
				},
				Source: entity.DocumentSourceLocal,
			},
		}
		body, err := sonic.Marshal(&reviewEvent)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
			return nil, err
		}
		err = k.producer.Send(ctx, body)
		if err != nil {
			logs.CtxErrorf(ctx, "send message failed, err: %v", err)
			return nil, err
		}
	}
	return &knowledge.CreateDocumentReviewResponse{
		Reviews: reviews,
	}, nil
}

func (k *knowledgeSVC) MGetDocumentReview(ctx context.Context, request *knowledge.MGetDocumentReviewRequest) (response *knowledge.MGetDocumentReviewResponse, err error) {
	reviews, err := k.reviewRepo.MGetByIDs(ctx, request.ReviewIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "mget review failed, err: %v", err)
		return nil, err
	}
	for _, review := range reviews {
		if review.KnowledgeID != request.KnowledgeID {
			return nil, errors.New("knowledge ID not match")
		}
	}
	reviewEntity := make([]*entity.Review, 0, len(reviews))
	for _, review := range reviews {
		status := entity.ReviewStatus(review.Status)
		var reviewTosURL, reviewChunkRespTosURL string
		if review.URI != "" {
			reviewTosURL, err = k.storage.GetObjectUrl(ctx, review.URI)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
				return nil, err
			}
		}
		if review.ChunkRespURI != "" {
			reviewChunkRespTosURL, err = k.storage.GetObjectUrl(ctx, review.ChunkRespURI)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
				return nil, err
			}
		}
		reviewEntity = append(reviewEntity, &entity.Review{
			ReviewID:      &review.ID,
			DocumentName:  review.Name,
			DocumentType:  review.Type,
			Url:           reviewTosURL,
			Status:        &status,
			DocTreeTosUrl: ptr.Of(reviewChunkRespTosURL),
		})
	}
	return &knowledge.MGetDocumentReviewResponse{
		Reviews: reviewEntity,
	}, nil
}

func (k *knowledgeSVC) SaveDocumentReview(ctx context.Context, request *knowledge.SaveDocumentReviewRequest) error {
	if request == nil {
		return errors.New("request is null")
	}
	review, err := k.reviewRepo.GetByID(ctx, request.ReviewID)
	if err != nil {
		logs.CtxErrorf(ctx, "get review failed, err: %v", err)
		return err
	}
	uri := review.ChunkRespURI
	if review.Status == int32(entity.ReviewStatus_Enable) && len(uri) > 0 {
		newTosUri := fmt.Sprintf("DocReview/%d_%d_%d.txt", review.CreatorID, time.Now().UnixMilli(), review.ID)
		err = k.storage.PutObject(ctx, newTosUri, []byte(request.DocTreeJson))
		if err != nil {
			logs.CtxErrorf(ctx, "put object failed, err: %v", err)
			return err
		}
		err = k.reviewRepo.UpdateReview(ctx, review.ID, map[string]interface{}{
			"chunk_resp_uri": newTosUri,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "update review chunk uri failed, err: %v", err)
			return err
		}
	}
	return nil
}

func (k *knowledgeSVC) emitDeleteKnowledgeDataEvent(ctx context.Context, knowledgeID int64, sliceIDs []int64, shardingKey string) error {
	deleteSliceEvent := entity.Event{
		Type:        entity.EventTypeDeleteKnowledgeData,
		KnowledgeID: knowledgeID,
		SliceIDs:    sliceIDs,
	}
	body, err := sonic.Marshal(&deleteSliceEvent)
	if err != nil {
		return fmt.Errorf("[emitDeleteKnowledgeDataEvent] marshal event failed, %w", err)
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(shardingKey)); err != nil {
		return fmt.Errorf("[emitDeleteKnowledgeDataEvent] send message failed, %w", err)
	}
	return nil
}

func (k *knowledgeSVC) fromModelKnowledge(ctx context.Context, knowledge *model.Knowledge) *entity.Knowledge {
	if knowledge == nil {
		return nil
	}
	sliceHit, err := k.sliceRepo.GetSliceHitByKnowledgeID(ctx, knowledge.ID)
	if err != nil {
		logs.CtxErrorf(ctx, "get slice hit count failed, err: %v", err)
	}
	knEntity := &entity.Knowledge{
		Info: common.Info{
			ID:          knowledge.ID,
			Name:        knowledge.Name,
			Description: knowledge.Description,
			IconURI:     knowledge.IconURI,
			CreatorID:   knowledge.CreatorID,
			SpaceID:     knowledge.SpaceID,
			CreatedAtMs: knowledge.CreatedAt,
			UpdatedAtMs: knowledge.UpdatedAt,
		},
		SliceHit: sliceHit,
		Type:     entity.DocumentType(knowledge.FormatType),
		Status:   entity.KnowledgeStatus(knowledge.Status),
	}
	if knowledge.ProjectID != "" {
		projectID, err := strconv.ParseInt(knowledge.ProjectID, 10, 64)
		if err != nil {
			logs.CtxErrorf(ctx, "parse project id failed, err: %v", err)
			return nil
		}
		knEntity.ProjectID = projectID
	} else {
		knEntity.ProjectID = 0
	}
	if knowledge.IconURI != "" {
		objUrl, err := k.storage.GetObjectUrl(ctx, knowledge.IconURI)
		if err != nil {
			logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
			return nil
		}
		knEntity.IconURL = objUrl
	}
	return knEntity
}

func (k *knowledgeSVC) fromModelDocument(ctx context.Context, document *model.KnowledgeDocument) *entity.Document {
	if document == nil {
		return nil
	}
	documentEntity := &entity.Document{
		Info: common.Info{
			ID:          document.ID,
			Name:        document.Name,
			CreatorID:   document.CreatorID,
			SpaceID:     document.SpaceID,
			CreatedAtMs: document.CreatedAt,
			UpdatedAtMs: document.UpdatedAt,
		},
		Type:             entity.DocumentType(document.DocumentType),
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
	if len(document.URI) != 0 {
		objUrl, err := k.storage.GetObjectUrl(ctx, document.URI)
		if err != nil {
			logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
			return nil
		}
		documentEntity.URL = objUrl
	}
	return documentEntity
}

func (k *knowledgeSVC) fromModelSlice(ctx context.Context, slice *model.KnowledgeDocumentSlice) *entity.Slice {
	if slice == nil {
		return nil
	}
	s := &entity.Slice{
		Info: common.Info{
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
		SliceStatus: entity.SliceStatus(slice.Status),
	}
	if slice.Content != "" {
		processedContent := k.formatSliceContent(ctx, slice.Content)
		s.RawContent = make([]*entity.SliceContent, 0)
		s.RawContent = append(s.RawContent, &entity.SliceContent{
			Type: entity.SliceContentTypeText,
			Text: ptr.Of(processedContent),
		})
	}
	return s
}

func convertOrderType(orderType *knowledge.OrderType) *dao.OrderType {
	if orderType == nil {
		return nil
	}
	asc := dao.OrderTypeAsc
	desc := dao.OrderTypeDesc
	odType := *orderType
	switch odType {
	case knowledge.OrderTypeAsc:
		return &asc
	case knowledge.OrderTypeDesc:
		return &desc
	default:
		return &desc
	}
}

func convertOrder(order *knowledge.Order) *dao.Order {
	if order == nil {
		return nil
	}
	od := *order
	createAt := dao.OrderCreatedAt
	updateAt := dao.OrderUpdatedAt
	switch od {
	case knowledge.OrderCreatedAt:
		return &createAt
	case knowledge.OrderUpdatedAt:
		return &updateAt
	default:
		return &createAt
	}
}
