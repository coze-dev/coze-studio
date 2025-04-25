package service

import (
	"context"
	"errors"
	"strconv"
	"time"
	"unicode/utf8"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/processor/impl"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank/rrf"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func NewKnowledgeSVC(config *KnowledgeSVCConfig) (knowledge.Knowledge, eventbus.ConsumerHandler) {
	svc := &knowledgeSVC{
		knowledgeRepo: dao.NewKnowledgeDAO(config.DB),
		documentRepo:  dao.NewKnowledgeDocumentDAO(config.DB),
		sliceRepo:     dao.NewKnowledgeDocumentSliceDAO(config.DB),
		idgen:         config.IDGen,
		rdb:           config.RDB,
		producer:      config.Producer,
		searchStores:  config.SearchStores,
		parser:        config.FileParser,
		storage:       config.Storage,
		reranker:      config.Reranker,
		rewriter:      config.QueryRewriter,
	}
	if svc.reranker == nil {
		svc.reranker = rrf.NewRRFReranker(0)
	}

	return svc, svc
}

type KnowledgeSVCConfig struct {
	DB            *gorm.DB                  // required
	IDGen         idgen.IDGenerator         // required
	RDB           rdb.RDB                   // required: 表格存储
	Producer      eventbus.Producer         // required: 文档 indexing 过程走 mq 异步处理
	SearchStores  []searchstore.SearchStore // required: 向量 / 全文
	FileParser    parser.Parser             // required: 文档切分与处理能力，不一定支持所有策略
	Storage       storage.Storage           // required: oss
	QueryRewriter rewrite.QueryRewriter     // optional: 未配置时不改写 query
	Reranker      rerank.Reranker           // optional: 未配置时默认 rrf
}

type knowledgeSVC struct {
	knowledgeRepo dao.KnowledgeRepo
	documentRepo  dao.KnowledgeDocumentRepo
	sliceRepo     dao.KnowledgeDocumentSliceRepo

	idgen        idgen.IDGenerator
	rdb          rdb.RDB
	producer     eventbus.Producer
	searchStores []searchstore.SearchStore
	parser       parser.Parser
	rewriter     rewrite.QueryRewriter
	reranker     rerank.Reranker
	storage      storage.Storage
}

func (k *knowledgeSVC) CreateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
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

	return knowledge, nil
}

func (k *knowledgeSVC) UpdateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	now := time.Now().UnixMilli()
	if err := k.knowledgeRepo.Update(ctx, &model.Knowledge{
		ID:          knowledge.ID,
		Name:        knowledge.Name,
		UpdatedAt:   now,
		Description: knowledge.Description,
		IconURI:     knowledge.IconURI,
		Status:      int32(knowledge.Status),
	}); err != nil {
		return nil, err
	}

	knowledge.UpdatedAtMs = now

	return knowledge, nil
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	// 先获取一下knowledge的信息
	kn, _, err := k.knowledgeRepo.FindKnowledgeByCondition(ctx, &dao.WhereKnowledgeOption{
		KnowledgeIDs: []int64{knowledge.ID},
	})
	if err != nil {
		return nil, err
	}
	if len(kn) != 1 {
		return nil, errors.New("knowledge not found")
	}
	if kn[0].FormatType == int32(entity.DocumentTypeTable) {
		docs, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
			KnowledgeIDs: []int64{kn[0].ID},
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
					logs.CtxWarnf(ctx, "drop table failed, err: %v", err)
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
	return knowledge, nil
}

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context) {
	// 这个有哪些场景要讨论一下，目前能想到的场景有跨空间复制
	// TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) MGetKnowledge(ctx context.Context, request *knowledge.MGetKnowledgeRequest) ([]*entity.Knowledge, int64, error) {
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

	id2Knowledge := make(map[int64]*entity.Knowledge)
	for i := range pos {
		po := pos[i]
		if po == nil { // unexpected
			continue
		}

		id2Knowledge[po.ID] = k.fromModelKnowledge(po)
	}

	resp := make([]*entity.Knowledge, len(request.IDs))
	for i, id := range request.IDs {
		resp[i] = id2Knowledge[id]
	}

	return resp, total, nil
}

func (k *knowledgeSVC) ListKnowledge(ctx context.Context) {
	// TODO implement me
	panic("implement me")
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
	doc, err := k.documentRepo.MGetByID(ctx, []int64{document.ID})
	if err != nil {
		return nil, err
	}
	if len(doc) != 1 {
		return nil, errors.New("document not found")
	}
	if doc[0].DocumentType == int32(entity.DocumentTypeTable) {
		// 如果是表格类型，可能是要改table的meta
		if len(document.TableInfo.Columns) != 0 {
			doc[0].TableInfo.Columns = document.TableInfo.Columns
		}
		if document.TableInfo.PhysicalTableName != "" {
			doc[0].TableInfo.PhysicalTableName = document.TableInfo.PhysicalTableName
		}
		// todo，如果是更改索引列怎么处理
	}
	err = k.documentRepo.Update(ctx, doc[0])
	if err != nil {
		return nil, err
	}
	return document, nil
}

func (k *knowledgeSVC) DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	if document.Type == entity.DocumentTypeTable {
		docs, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
			IDs: []int64{document.ID},
		})
		if err != nil {
			return nil, err
		}
		if len(docs) != 1 {
			return nil, errors.New("document not found")
		}
		if docs[0].TableInfo != nil {
			resp, err := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
				TableName: docs[0].TableInfo.PhysicalTableName,
				IfExists:  true,
			})
			if err != nil {
				logs.CtxWarnf(ctx, "drop table failed, err: %v", err)
			}
			if !resp.Success {
				logs.CtxWarnf(ctx, "drop table failed, err")
			}
		}

	}
	err := k.deleteDocument(ctx, document.KnowledgeID, []int64{document.ID}, 0)
	if err != nil {
		return nil, err
	}
	document.DeletedAtMs = time.Now().UnixMilli()
	return document, nil
}

func (k *knowledgeSVC) ListDocument(ctx context.Context, request *knowledge.ListDocumentRequest) (*knowledge.ListDocumentResponse, error) {
	documents, nextCursor, hasMore, err := k.documentRepo.List(ctx, request.KnowledgeID, &request.Name, request.Limit, request.Cursor)
	if err != nil {
		logs.CtxErrorf(ctx, "list document failed, err: %v", err)
		return nil, err
	}
	resp := &knowledge.ListDocumentResponse{
		HasMore:    hasMore,
		NextCursor: nextCursor,
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
	docs, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
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

	if err = k.producer.Send(ctx, body); err != nil {
		return nil, err
	}
	return docEntity, nil
}

func (k *knowledgeSVC) GetTableSchema(ctx context.Context, request *knowledge.GetTableSchemaRequest) (knowledge.GetTableSchemaResponse, error) {
	// TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) CreateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	// TODO implement me
	// todo注意顺序问题
	panic("implement me")
}

func (k *knowledgeSVC) UpdateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	// TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) DeleteSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	// TODO implement me
	panic("implement me")
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
	slices, nextCursor, hasMore, err := k.sliceRepo.List(ctx, request.KnowledgeID, request.DocumentID, request.Limit, request.Cursor)
	if err != nil {
		logs.CtxErrorf(ctx, "list slice failed, err: %v", err)
		return nil, err
	}
	resp.HasMore = hasMore
	resp.NextCursor = nextCursor
	// 如果是表格类型，那么去table中取一下原始数据
	if kn[0].FormatType == int32(entity.DocumentTypeTable) {
		doc, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
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
		err = k.selectTableData(ctx, doc[0].TableInfo, slices)
		if err != nil {
			logs.CtxErrorf(ctx, "select table data failed, err: %v", err)
			return nil, err
		}
	}
	resp.Slices = []*entity.Slice{}
	for i := range slices {
		resp.Slices = append(resp.Slices, k.fromModelSlice(ctx, slices[i]))
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

func (k *knowledgeSVC) fromModelKnowledge(knowledge *model.Knowledge) *entity.Knowledge {
	if knowledge == nil {
		return nil
	}

	return &entity.Knowledge{
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
}

func (k *knowledgeSVC) fromModelDocument(document *model.KnowledgeDocument) *entity.Document {
	if document == nil {
		return nil
	}
	return &entity.Document{
		Info: common.Info{
			ID:          document.ID,
			Name:        document.Name,
			CreatorID:   document.CreatorID,
			SpaceID:     document.SpaceID,
			CreatedAtMs: document.CreatedAt,
			UpdatedAtMs: document.UpdatedAt,
		},
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

}

func (k *knowledgeSVC) fromModelSlice(ctx context.Context, slice *model.KnowledgeDocumentSlice) *entity.Slice {
	if slice == nil {
		return nil
	}
	return &entity.Slice{
		Info: common.Info{
			ID:          slice.ID,
			CreatorID:   slice.CreatorID,
			SpaceID:     slice.SpaceID,
			CreatedAtMs: slice.CreatedAt,
			UpdatedAtMs: slice.UpdatedAt,
		},
		DocumentID:  slice.DocumentID,
		KnowledgeID: slice.KnowledgeID,
		Sequence:    int64(slice.Sequence),
		PlainText:   slice.Content,
		ByteCount:   int64(len(slice.Content)),
		CharCount:   int64(utf8.RuneCountInString(slice.Content)),
	}
}

func (k *knowledgeSVC) ValidateTableSchema(ctx context.Context, request *knowledge.ValidateTableSchemaRequest) (knowledge.ValidateTableSchemaResponse, error) {
	// TODO implement me
	return knowledge.ValidateTableSchemaResponse{}, nil
}

func (k *knowledgeSVC) GetDocumentTableInfo(ctx context.Context, request *knowledge.GetDocumentTableInfoRequest) (knowledge.GetDocumentTableInfoResponse, error) {
	// TODO implement me
	return knowledge.GetDocumentTableInfoResponse{}, nil
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
