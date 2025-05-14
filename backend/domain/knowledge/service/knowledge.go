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
	"github.com/cloudwego/eino/compose"
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
	"code.byted.org/flow/opencoze/backend/domain/knowledge/nl2sql"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser/builtin"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/processor/impl"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank/rrf"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	resourceEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func NewKnowledgeSVC(config *KnowledgeSVCConfig) (knowledge.Knowledge, eventbus.ConsumerHandler) {
	svc := &knowledgeSVC{
		knowledgeRepo:  dao.NewKnowledgeDAO(config.DB),
		documentRepo:   dao.NewKnowledgeDocumentDAO(config.DB),
		sliceRepo:      dao.NewKnowledgeDocumentSliceDAO(config.DB),
		reviewRepo:     dao.NewKnowledgeDocumentReviewDAO(config.DB),
		idgen:          config.IDGen,
		rdb:            config.RDB,
		producer:       config.Producer,
		searchStores:   config.SearchStores,
		parser:         config.FileParser,
		storage:        config.Storage,
		imageX:         config.ImageX,
		reranker:       config.Reranker,
		rewriter:       config.QueryRewriter,
		nl2Sql:         config.NL2Sql,
		domainNotifier: config.DomainNotifier,
	}
	if svc.reranker == nil {
		svc.reranker = rrf.NewRRFReranker(0)
	}
	if svc.parser == nil {
		svc.parser = builtin.NewParser(svc.imageX)
	}
	return svc, svc
}

type KnowledgeSVCConfig struct {
	DB             *gorm.DB                   // required
	IDGen          idgen.IDGenerator          // required
	RDB            rdb.RDB                    // required: 表格存储
	Producer       eventbus.Producer          // required: 文档 indexing 过程走 mq 异步处理
	DomainNotifier crossdomain.DomainNotifier // required: search域事件生产者
	SearchStores   []searchstore.SearchStore  // required: 向量 / 全文
	FileParser     parser.Parser              // optional: 文档切分与处理能力, default builtin parser
	Storage        storage.Storage            // required: oss
	ImageX         imagex.ImageX              // TODO: 确认下 oss 是否返回 uri / url
	QueryRewriter  rewrite.QueryRewriter      // optional: 未配置时不改写 query
	Reranker       rerank.Reranker            // optional: 未配置时默认 rrf
	NL2Sql         nl2sql.NL2Sql              // optional: 未配置时默认不支持
}

type knowledgeSVC struct {
	knowledgeRepo dao.KnowledgeRepo
	documentRepo  dao.KnowledgeDocumentRepo
	sliceRepo     dao.KnowledgeDocumentSliceRepo
	reviewRepo    dao.KnowledgeDocumentReviewRepo

	idgen          idgen.IDGenerator
	rdb            rdb.RDB
	producer       eventbus.Producer
	domainNotifier crossdomain.DomainNotifier
	searchStores   []searchstore.SearchStore
	parser         parser.Parser
	rewriter       rewrite.QueryRewriter
	reranker       rerank.Reranker
	storage        storage.Storage
	nl2Sql         nl2sql.NL2Sql
	imageX         imagex.ImageX
}

func (k *knowledgeSVC) CreateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (kn *entity.Knowledge, err error) {
	now := time.Now().UnixMilli()
	if len(knowledge.Name) == 0 {
		return nil, errors.New("knowledge name is empty")
	}
	if knowledge.CreatorID == 0 {
		return nil, errors.New("knowledge creator id is empty")
	}
	if knowledge.SpaceID == 0 {
		return nil, errors.New("knowledge space id is empty")
	}
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	if err = k.knowledgeRepo.Create(ctx, &model.Knowledge{
		ID:          id,
		Name:        knowledge.Name,
		CreatorID:   knowledge.CreatorID,
		ProjectID:   strconv.FormatInt(knowledge.ProjectID, 10),
		SpaceID:     knowledge.SpaceID,
		CreatedAt:   now,
		UpdatedAt:   now,
		Status:      int32(entity.KnowledgeStatusEnable), // 目前向量库的初始化由文档触发，知识库无 init 过程
		Description: knowledge.Description,
		IconURI:     knowledge.IconURI,
		FormatType:  int32(knowledge.Type),
	}); err != nil {
		return nil, err
	}

	knowledge.ID = id
	knowledge.CreatedAtMs = now
	knowledge.UpdatedAtMs = now
	err = k.domainNotifier.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Created,
		Resource: &resourceEntity.Resource{
			ResType:    resCommon.ResType_Knowledge,
			ID:         knowledge.ID,
			Name:       knowledge.Name,
			IconURI:    knowledge.IconURI,
			Desc:       knowledge.Description,
			ResSubType: int32(knowledge.Type),
			SpaceID:    knowledge.SpaceID,
			OwnerID:    knowledge.CreatorID,
			CreatedAt:  now,
			UpdatedAt:  now,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
	}
	return knowledge, err
}

func (k *knowledgeSVC) UpdateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (kn *entity.Knowledge, err error) {
	if knowledge.ID == 0 {
		return knowledge, errors.New("knowledge id is empty")
	}
	if len(knowledge.Name) == 0 {
		return knowledge, errors.New("knowledge name is empty")
	}
	knModel, err := k.knowledgeRepo.GetByID(ctx, knowledge.ID)
	if err != nil {
		return nil, err
	}
	if knModel == nil {
		return nil, errors.New("knowledge not found")
	}
	now := time.Now().UnixMilli()
	if knowledge.Status != 0 {
		knModel.Status = int32(knowledge.Status)
	}
	if knowledge.IconURI != "" {
		knModel.IconURI = knowledge.IconURI
	}
	if knowledge.Description != "" {
		knModel.Description = knowledge.Description
	}
	knModel.Name = knowledge.Name
	knModel.Description = knowledge.Description
	if err := k.knowledgeRepo.Update(ctx, knModel); err != nil {
		return knowledge, err
	}
	knowledge = k.fromModelKnowledge(ctx, knModel)
	knowledge.UpdatedAtMs = now
	err = k.domainNotifier.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Updated,
		Resource: &resourceEntity.Resource{
			ResType:    resCommon.ResType_Knowledge,
			ID:         knowledge.ID,
			Name:       knowledge.Name,
			IconURI:    knModel.IconURI,
			Desc:       knowledge.Description,
			ResSubType: int32(knowledge.Type),
			SpaceID:    knowledge.SpaceID,
			OwnerID:    knowledge.CreatorID,
			CreatedAt:  now,
			UpdatedAt:  now,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
	}
	return knowledge, err
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, knowledge *entity.Knowledge) (kn *entity.Knowledge, err error) {
	// 先获取一下knowledge的信息
	knModel, _, err := k.knowledgeRepo.FindKnowledgeByCondition(ctx, &dao.WhereKnowledgeOption{
		KnowledgeIDs: []int64{knowledge.ID},
	})
	if err != nil {
		return nil, err
	}
	if len(knModel) != 1 {
		return nil, errors.New("knowledge not found")
	}
	if knModel[0].FormatType == int32(entity.DocumentTypeTable) {
		docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
			KnowledgeIDs: []int64{knModel[0].ID},
		})
		if err != nil {
			return nil, err
		}
		for _, doc := range docs {
			if doc.TableInfo != nil {
				resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
					TableName: doc.TableInfo.PhysicalTableName,
					IfExists:  true,
				})
				if err != nil {
					logs.CtxWarnf(ctx, "drop table failed, err %v", err)
				}
				if !resp.Success {
					logs.CtxWarnf(ctx, "drop table failed, err")
				}
			}
		}
	}
	err = k.knowledgeRepo.Delete(ctx, knowledge.ID)
	if err != nil {
		return nil, err
	}

	err = k.deleteDocument(ctx, knowledge.ID, nil, 0)
	if err != nil {
		return nil, err
	}
	knowledge.DeletedAtMs = time.Now().UnixMilli()
	err = k.domainNotifier.PublishResources(ctx, &resourceEntity.ResourceDomainEvent{
		OpType: resourceEntity.Deleted,
		Resource: &resourceEntity.Resource{
			ID: knowledge.ID,
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "publish resource event failed, err: %v", err)
	}
	return knowledge, err
}

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context) {
	// 这个有哪些场景要讨论一下，目前能想到的场景有跨空间复制
	// TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) MGetKnowledge(ctx context.Context, request *knowledge.MGetKnowledgeRequest) ([]*entity.Knowledge, int64, error) {
	if len(request.IDs) == 0 && request.ProjectID == nil && request.SpaceID == nil {
		return nil, 0, errors.New("knowledge ids, project id, space id and query can not be all empty")
	}
	pos, total, err := k.knowledgeRepo.FindKnowledgeByCondition(
		ctx, &dao.WhereKnowledgeOption{
			KnowledgeIDs: request.IDs,
			ProjectID:    request.ProjectID,
			SpaceID:      request.SpaceID,
			Name:         request.Name,
			Status:       request.Status,
			UserID:       request.UserID,
			Query:        request.Query,
			Page:         request.Page,
			PageSize:     request.PageSize,
			Order:        convertOrder(request.Order),
			OrderType:    convertOrderType(request.OrderType),
			FormatType:   request.FormatType,
		},
	)
	if err != nil {
		return nil, 0, err
	}
	resp := make([]*entity.Knowledge, len(pos))
	for i := range pos {
		if pos[i] == nil {
			continue
		}
		resp[i] = k.fromModelKnowledge(ctx, pos[i])
	}

	return resp, total, nil
}

func (k *knowledgeSVC) CreateDocument(ctx context.Context, document []*entity.Document) (doc []*entity.Document, err error) {
	if len(document) == 0 {
		return nil, errors.New("document is empty")
	}
	userID := document[0].CreatorID
	spaceID := document[0].SpaceID
	documentSource := document[0].Source
	docProcessor := impl.NewDocProcessor(ctx, &impl.DocProcessorConfig{
		UserID:         userID,
		SpaceID:        spaceID,
		DocumentSource: documentSource,
		Documents:      document,
		KnowledgeRepo:  k.knowledgeRepo,
		DocumentRepo:   k.documentRepo,
		SliceRepo:      k.sliceRepo,
		Idgen:          k.idgen,
		Producer:       k.producer,
		Parser:         k.parser,
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
	resp := docProcessor.GetResp()
	return resp, nil
}

func (k *knowledgeSVC) UpdateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	if document == nil {
		return nil, errors.New("document is empty")
	}
	doc, err := k.documentRepo.GetByID(ctx, document.ID)
	if err != nil {
		return nil, err
	}
	if document.Name != "" {
		doc.Name = document.Name
	}

	if doc.DocumentType == int32(entity.DocumentTypeTable) {
		// 如果是表格类型，可能是要改table的meta
		if doc.TableInfo != nil {
			finalColumns, err := k.alterTableSchema(ctx, doc.TableInfo.Columns, document.TableInfo.Columns, doc.TableInfo.PhysicalTableName)
			if err != nil {
				return nil, err
			}
			doc.TableInfo.VirtualTableName = doc.Name
			if len(document.TableInfo.Columns) != 0 {
				doc.TableInfo.Columns = finalColumns
			}
		}
		// todo，如果是更改索引列怎么处理
	}
	err = k.documentRepo.Update(ctx, doc)
	if err != nil {
		return nil, err
	}
	return document, nil
}

func (k *knowledgeSVC) DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		IDs: []int64{document.ID},
	})
	if err != nil {
		return nil, err
	}
	if len(docs) != 1 {
		return nil, errors.New("document not found")
	}
	if docs[0].DocumentType == int32(entity.DocumentTypeTable) && docs[0].TableInfo != nil {
		resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
			TableName: docs[0].TableInfo.PhysicalTableName,
			IfExists:  true,
		})
		if err != nil {
			logs.CtxWarnf(ctx, "drop table failed, err: %v", err)
		}
		if len(docs) != 1 {
			return nil, errors.New("document not found")
		}
		if !resp.Success {
			logs.CtxWarnf(ctx, "drop table failed, err")
		}
	}
	err = k.deleteDocument(ctx, document.KnowledgeID, []int64{document.ID}, 0)
	if err != nil {
		return nil, err
	}
	document.DeletedAtMs = time.Now().UnixMilli()
	return document, nil
}

func (k *knowledgeSVC) ListDocument(ctx context.Context, request *knowledge.ListDocumentRequest) (*knowledge.ListDocumentResponse, error) {
	opts := dao.WhereDocumentOpt{}
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

	resp := &knowledge.ListDocumentResponse{}
	if len(documents) < int(total) {
		resp.HasMore = true
		nextCursor := strconv.FormatInt(documents[len(documents)-1].ID, 10)
		resp.NextCursor = &nextCursor
	}
	resp.Documents = []*entity.Document{}
	for i := range documents {
		resp.Documents = append(resp.Documents, k.fromModelDocument(documents[i]))
	}
	return resp, nil
}

func (k *knowledgeSVC) MGetDocumentProgress(ctx context.Context, ids []int64) ([]*knowledge.DocumentProgress, error) {
	documents, err := k.documentRepo.MGetByID(ctx, ids)
	if err != nil {
		logs.CtxErrorf(ctx, "mget document failed, err: %v", err)
		return nil, err
	}
	resp := []*knowledge.DocumentProgress{}
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
		resp = append(resp, &item)
	}
	return resp, nil
}

func (k *knowledgeSVC) ResegmentDocument(ctx context.Context, request knowledge.ResegmentDocumentRequest) (*entity.Document, error) {
	// 这个接口目前实现文档知识库的文档重新分片
	// 1. 获取文档信息
	docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		IDs: []int64{request.ID},
	})
	if err != nil {
		return nil, err
	}
	if len(docs) != 1 {
		return nil, errors.New("document not found")
	}
	docEntity := k.fromModelDocument(docs[0])
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
	return docEntity, nil
}

func (k *knowledgeSVC) CreateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	slices, err := k.sliceRepo.GetSliceBySequence(ctx, slice.DocumentID, slice.Sequence)
	if err != nil {
		logs.CtxErrorf(ctx, "get slice by sequence failed, err: %v", err)
		return nil, err
	}
	docInfo, err := k.documentRepo.GetByID(ctx, slice.DocumentID)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return nil, err
	}
	if docInfo == nil {
		return nil, errors.New("document not found")
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
		CreatorID:   slice.CreatorID,
		SpaceID:     docInfo.SpaceID,
		Status:      int32(entity.SliceStatusInit),
	}
	slice.ID = id
	if len(slices) == 0 {
		if slice.Sequence == 0 {
			slice.Sequence = 1
			sliceInfo.Sequence = 1
		} else {
			err = fmt.Errorf("the inserted slice position is illegal")
			return nil, err
		}
	}
	if len(slices) == 1 {
		if slice.Sequence == 1 || slice.Sequence == 0 {
			// 插入到最前面
			sliceInfo.Sequence = slices[0].Sequence - 1
		} else {
			sliceInfo.Sequence = slices[0].Sequence + 1
		}
	}
	if len(slices) == 2 {
		if slice.Sequence == 0 || slice.Sequence == 1 {
			sliceInfo.Sequence = slices[0].Sequence - 1
		} else {
			if slices[0].Sequence+1 < slices[1].Sequence {
				sliceInfo.Sequence = float64(int(slices[0].Sequence) + 1)
			} else {
				sliceInfo.Sequence = (slices[0].Sequence + slices[1].Sequence) / 2
			}
		}
	}
	indexSliceEvent := entity.Event{
		Type:  entity.EventTypeIndexSlice,
		Slice: slice,
	}
	if docInfo.DocumentType == int32(entity.DocumentTypeText) {
		indexSliceEvent.Slice.PlainText = *slice.RawContent[0].Text
		sliceInfo.Content = *slice.RawContent[0].Text
	}
	if docInfo.DocumentType == int32(entity.DocumentTypeTable) {
		err = k.upsertDataToTable(ctx, docInfo.TableInfo, []*entity.Slice{slice}, []int64{sliceInfo.ID})
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
	return k.fromModelSlice(ctx, &sliceInfo), nil
}

func (k *knowledgeSVC) UpdateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	sliceInfo, err := k.sliceRepo.MGetSlices(ctx, []int64{slice.ID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget slice failed, err: %v", err)
		return nil, err
	}
	if len(sliceInfo) != 1 {
		return nil, errors.New("slice not found")
	}
	docInfo, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		IDs: []int64{sliceInfo[0].DocumentID},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return nil, err
	}
	if len(docInfo) != 1 {
		return nil, errors.New("document not found")
	}
	// 更新数据库中的存储
	if docInfo[0].DocumentType == int32(entity.DocumentTypeText) {
		sliceInfo[0].Content = *slice.RawContent[0].Text
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
			RawContent:  slice.RawContent,
		},
	}

	if docInfo[0].DocumentType == int32(entity.DocumentTypeTable) {
		// todo更新表里的内容
		err = k.upsertDataToTable(ctx, docInfo[0].TableInfo, []*entity.Slice{indexSliceEvent.Slice}, []int64{sliceInfo[0].ID})
		if err != nil {
			logs.CtxErrorf(ctx, "upsert data to table failed, err: %v", err)
			return nil, err
		}
	}
	err = k.sliceRepo.Update(ctx, sliceInfo[0])
	if err != nil {
		logs.CtxErrorf(ctx, "update slice failed, err: %v", err)
		return nil, err
	}
	body, err := sonic.Marshal(&indexSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return nil, err
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(sliceInfo[0].DocumentID, 10))); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return nil, err
	}
	return k.fromModelSlice(ctx, sliceInfo[0]), nil
}

func (k *knowledgeSVC) DeleteSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	sliceInfo, err := k.sliceRepo.MGetSlices(ctx, []int64{slice.ID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget slice failed, err: %v", err)
		return nil, err
	}
	if len(sliceInfo) != 1 {
		return nil, errors.New("slice not found")
	}
	docInfo, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		IDs: []int64{sliceInfo[0].DocumentID},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return nil, err
	}
	if len(docInfo) != 1 {
		return nil, errors.New("document not found")
	}
	if docInfo[0].DocumentType == int32(entity.DocumentTypeTable) {
		_, err := k.rdb.DeleteData(ctx, &rdb.DeleteDataRequest{
			TableName: docInfo[0].TableInfo.PhysicalTableName,
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    consts.RDBFieldID,
						Operator: rdbEntity.OperatorEqual,
						Value:    slice.ID,
					},
				},
			},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete data failed, err: %v", err)
			return nil, err
		}
	}
	// 删除数据库中的存储
	err = k.sliceRepo.Delete(ctx, &model.KnowledgeDocumentSlice{ID: slice.ID})
	if err != nil {
		logs.CtxErrorf(ctx, "delete slice failed, err: %v", err)
		return nil, err
	}
	deleteSliceEvent := entity.Event{
		Type:        entity.EventTypeDeleteKnowledgeData,
		KnowledgeID: sliceInfo[0].KnowledgeID,
		SliceIDs:    []int64{slice.ID},
	}
	body, err := sonic.Marshal(&deleteSliceEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return nil, err
	}
	if err = k.producer.Send(ctx, body, eventbus.WithShardingKey(strconv.FormatInt(sliceInfo[0].DocumentID, 10))); err != nil {
		logs.CtxErrorf(ctx, "send message failed, err: %v", err)
		return nil, err
	}
	return k.fromModelSlice(ctx, sliceInfo[0]), nil
}

func (k *knowledgeSVC) ListSlice(ctx context.Context, request *knowledge.ListSliceRequest) (*knowledge.ListSliceResponse, error) {
	kn, err := k.knowledgeRepo.MGetByID(ctx, []int64{request.KnowledgeID})
	if err != nil {
		logs.CtxErrorf(ctx, "mget knowledge failed, err: %v", err)
		return nil, err
	}
	if len(kn) == 0 {
		return nil, errors.New("knowledge not found")
	}
	resp := knowledge.ListSliceResponse{}
	slices, total, err := k.sliceRepo.FindSliceByCondition(ctx, &dao.WhereSliceOpt{
		KnowledgeID: request.KnowledgeID,
		DocumentID:  request.DocumentID,
		Keyword:     request.Keyword,
		Sequence:    request.Sequence,
		PageSize:    int64(request.Limit),
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
	if kn[0].FormatType == int32(entity.DocumentTypeTable) {
		doc, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
			KnowledgeIDs: []int64{request.KnowledgeID},
			StatusNotIn:  []int32{int32(entity.DocumentStatusDeleted)},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "find document failed, err: %v", err)
			return nil, err
		}
		if len(doc) != 1 {
			return nil, errors.New("document not found")
		}
		// 从数据库中查询原始数据
		sliceMap, err = k.selectTableData(ctx, doc[0].TableInfo, slices)
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

func (k *knowledgeSVC) Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) ([]*knowledge.RetrieveSlice, error) {
	retrieveContext, err := k.newRetrieveContext(ctx, req)
	if err != nil {
		return nil, err
	}
	chain := compose.NewChain[*knowledge.RetrieveContext, []*knowledge.RetrieveSlice]()
	rewriteNode := compose.InvokableLambda(k.queryRewriteNode)
	// 向量化召回
	vectorRetrieveNode := compose.InvokableLambda(k.vectorRetrieveNode)
	// ES召回
	EsRetrieveNode := compose.InvokableLambda(k.esRetrieveNode)
	// Nl2Sql召回
	Nl2SqlRetrieveNode := compose.InvokableLambda(k.nl2SqlRetrieveNode)
	// pass user query Node
	passRequestContextNode := compose.InvokableLambda(k.passRequestContext)
	// reRank Node
	reRankNode := compose.InvokableLambda(k.reRankNode)
	// pack Result接口
	packResult := compose.InvokableLambda(k.packResults)
	parallelNode := compose.NewParallel().AddLambda("vectorRetrieveNode", vectorRetrieveNode).AddLambda("esRetrieveNode", EsRetrieveNode).AddLambda("nl2SqlRetrieveNode", Nl2SqlRetrieveNode).AddLambda("passRequestContext", passRequestContextNode)
	r, err := chain.AppendLambda(rewriteNode).AppendParallel(parallelNode).AppendLambda(reRankNode).AppendLambda(packResult).Compile(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "compile chain failed: %v", err)
		return nil, err
	}
	output, err := r.Invoke(ctx, retrieveContext)
	if err != nil {
		logs.CtxErrorf(ctx, "invoke chain failed: %v", err)
		return nil, err
	}
	return output, nil
}

func (k *knowledgeSVC) CreateDocumentReview(ctx context.Context, req *knowledge.CreateDocumentReviewRequest) ([]*entity.Review, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, req.KnowledgeId)
	if err != nil {
		logs.CtxErrorf(ctx, "get knowledge failed, err: %v", err)
		return nil, err
	}
	if kn == nil {
		return nil, errors.New("knowledge not found")
	}
	documentIDs := make([]int64, 0, len(req.Reviews))
	documentMap := make(map[int64]*model.KnowledgeDocument)
	for _, input := range req.Reviews {
		if input.DocumentId != nil && *input.DocumentId > 0 {
			documentIDs = append(documentIDs, *input.DocumentId)
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
	reviews := make([]*entity.Review, 0, len(req.Reviews))
	for _, input := range req.Reviews {
		review := &entity.Review{
			DocumentName: input.DocumentName,
			DocumentType: input.DocumentType,
			Uri:          input.TosUri,
		}
		if input.DocumentId != nil && *input.DocumentId > 0 {
			if document, ok := documentMap[*input.DocumentId]; ok {
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
	reviewIDs, err := k.idgen.GenMultiIDs(ctx, len(req.Reviews))
	if err != nil {
		return nil, err
	}
	for i, _ := range req.Reviews {
		reviews[i].ReviewId = ptr.Of(reviewIDs[i])
	}
	modelReviews := make([]*model.KnowledgeDocumentReview, 0, len(reviews))
	for _, review := range reviews {
		modelReviews = append(modelReviews, &model.KnowledgeDocumentReview{
			ID:          *review.ReviewId,
			KnowledgeID: req.KnowledgeId,
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
				ParsingStrategy:  req.ParsingStrategy,
				ChunkingStrategy: req.ChunkStrategy,
				Type:             entity.DocumentTypeText,
				URI:              review.Uri,
				FileExtension:    review.DocumentType,
				Info:             common.Info{Name: review.DocumentName},
				Source:           entity.DocumentSourceLocal,
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
	return reviews, nil
}

func (k *knowledgeSVC) MGetDocumentReview(ctx context.Context, knowledgeID int64, reviewIDs []int64) ([]*entity.Review, error) {
	reviews, err := k.reviewRepo.MGetByIDs(ctx, reviewIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "mget review failed, err: %v", err)
		return nil, err
	}
	for _, review := range reviews {
		if review.KnowledgeID != knowledgeID {
			return nil, errors.New("knowledge ID not match")
		}
	}
	reviewEntity := make([]*entity.Review, 0, len(reviews))
	for _, review := range reviews {
		status := entity.ReviewStatus(review.Status)
		var reviewTosURL, reviewChunkRespTosURL, reviewPreviewTosURL string
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
		if review.PreviewURI != "" {
			reviewPreviewTosURL, err = k.storage.GetObjectUrl(ctx, review.PreviewURI)
			if err != nil {
				logs.CtxErrorf(ctx, "get object url failed, err: %v", err)
				return nil, err
			}
		}
		reviewEntity = append(reviewEntity, &entity.Review{
			ReviewId:      &review.ID,
			DocumentName:  review.Name,
			DocumentType:  review.Type,
			Url:           reviewTosURL,
			Status:        &status,
			DocTreeTosUrl: ptr.Of(reviewChunkRespTosURL),
			PreviewTosUrl: ptr.Of(reviewPreviewTosURL),
		})
	}
	return reviewEntity, nil
}

func (k *knowledgeSVC) SaveDocumentReview(ctx context.Context, req *knowledge.SaveDocumentReviewRequest) error {
	review, err := k.reviewRepo.GetByID(ctx, req.ReviewId)
	if err != nil {
		logs.CtxErrorf(ctx, "get review failed, err: %v", err)
		return err
	}
	uri := review.ChunkRespURI
	if review.Status == int32(entity.ReviewStatus_Enable) && len(uri) > 0 {
		newTosUri := fmt.Sprintf("DocReview/%d_%d_%d.txt", review.CreatorID, time.Now().UnixMilli(), review.ID)
		err = k.storage.PutObject(ctx, newTosUri, []byte(req.DocTreeJson))
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

func (k *knowledgeSVC) fromModelKnowledge(ctx context.Context, knowledge *model.Knowledge) *entity.Knowledge {
	if knowledge == nil {
		return nil
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
		Type:   entity.DocumentType(knowledge.FormatType),
		Status: entity.KnowledgeStatus(knowledge.Status),
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

func (k *knowledgeSVC) fromModelDocument(document *model.KnowledgeDocument) *entity.Document {
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
		FileExtension:    document.FileExtension,
		Source:           entity.DocumentSource(document.SourceType),
		Status:           entity.DocumentStatus(document.Status),
		ParsingStrategy:  document.ParseRule.ParsingStrategy,
		ChunkingStrategy: document.ParseRule.ChunkingStrategy,
	}
	if document.TableInfo != nil {
		documentEntity.TableInfo = *document.TableInfo
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
