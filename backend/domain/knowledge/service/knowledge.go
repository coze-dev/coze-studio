package service

import (
	"context"
	"fmt"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank/rrf"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/objectstorage/imagex"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func NewKnowledgeSVC(config *KnowledgeSVCConfig) (knowledge.Knowledge, eventbus.ConsumerHandle) {
	svc := &knowledgeSVC{
		knowledgeRepo: dao.NewKnowledgeDAO(config.DB),
		documentRepo:  dao.NewKnowledgeDocumentDAO(config.DB),
		sliceRepo:     dao.NewKnowledgeDocumentSliceDAO(config.DB),
		idgen:         config.IDGen,
		rdb:           config.RDB,
		producer:      config.Producer,
		searchStores:  config.SearchStores,
		parser:        config.FileParser,
		imageX:        config.ImageX,
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
	ImageX        *imagex.Imagex            // required: oss
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
	imageX       *imagex.Imagex
	rewriter     rewrite.QueryRewriter
	reranker     rerank.Reranker
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
		FormatType:  int32(knowledge.Type),
	}); err != nil {
		return nil, err
	}

	knowledge.UpdatedAtMs = now

	return knowledge, nil
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	if err := k.knowledgeRepo.Delete(ctx, knowledge.ID); err != nil {
		return nil, err
	}
	// todo 这里要把所有文档、分片要删除了，并且要把对应的向量库、es里的内容删除掉
	// 先实现文本型知识库的删除

	knowledge.DeletedAtMs = time.Now().UnixMilli()
	return knowledge, nil
}

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) MGetKnowledge(ctx context.Context, ids []int64) ([]*entity.Knowledge, error) {
	pos, err := k.knowledgeRepo.MGetByID(ctx, ids)
	if err != nil {
		return nil, err
	}

	id2Knowledge := make(map[int64]*entity.Knowledge)
	for i := range pos {
		po := pos[i]
		if po == nil { // unexpected
			continue
		}

		id2Knowledge[po.ID] = k.fromModelKnowledge(po)
	}

	resp := make([]*entity.Knowledge, len(ids))
	for i, id := range ids {
		resp[i] = id2Knowledge[id]
	}

	return resp, nil
}

func (k *knowledgeSVC) ListKnowledge(ctx context.Context) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) CreateDocument(ctx context.Context, document *entity.Document) (doc *entity.Document, err error) {
	id, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()
	m := &model.KnowledgeDocument{
		ID:          id,
		KnowledgeID: document.KnowledgeID,
		Name:        document.Name,
		Type:        document.FilenameExtension,
		URI:         document.URI,
		Size:        document.Size,
		SliceCount:  document.SliceCount,
		CharCount:   document.CharCount,
		CreatorID:   document.CreatorID,
		SpaceID:     document.SpaceID,
		CreatedAt:   now,
		UpdatedAt:   now,
		SourceType:  int32(document.Source),
		Status:      int32(entity.DocumentStatusUploading),
		FailReason:  "",
		ParseRule: &model.DocumentParseRule{
			ParsingStrategy:  document.ParsingStrategy,
			ChunkingStrategy: document.ChunkingStrategy,
		},
		TableID: "",
	}

	if document.Type == entity.DocumentTypeTable {
		tableSchema, err := convert.DocumentToTableSchema(id, document)
		if err != nil {
			return nil, err
		}

		createTableResp, err := k.rdb.CreateTable(ctx, &rdb.CreateTableRequest{Table: tableSchema})
		if err != nil {
			return nil, err
		}

		m.TableID = createTableResp.Table.Name
	}

	if err = k.documentRepo.Create(ctx, m); err != nil {
		return nil, err
	}

	defer func() {
		if err != nil { // try set doc status
			m.Status = int32(entity.DocumentStatusFailed)
			m.FailReason = fmt.Sprintf("[CreateDocument] failed, %w", err)
			_ = k.documentRepo.Update(ctx, m)
		}
	}()

	body, err := sonic.Marshal(&entity.Event{
		Type:     entity.EventTypeIndexDocument,
		Document: document,
	})
	if err != nil {
		return nil, err
	}

	if err = k.producer.Send(ctx, body); err != nil {
		return nil, err
	}

	document.ID = id
	document.CreatedAtMs = now
	document.UpdatedAtMs = now

	return document, nil
}

func (k *knowledgeSVC) UpdateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) ListDocument(ctx context.Context, request *knowledge.ListDocumentRequest) (*knowledge.ListDocumentResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) MGetDocumentProgress(ctx context.Context, ids []int64) ([]*knowledge.DocumentProgress, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) ResegmentDocument(ctx context.Context, request knowledge.ResegmentDocumentRequest) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) GetTableSchema(ctx context.Context, id int64) ([]*entity.TableColumn, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) CreateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) UpdateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) DeleteSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) ListSlice(ctx context.Context, request *knowledge.ListSliceRequest) (*knowledge.ListSliceResponse, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) Retrieve(ctx context.Context, req *knowledge.RetrieveRequest) ([]*knowledge.RetrieveSlice, error) {
	//TODO implement me
	retrieveConext, err := k.newRetrieveContext(ctx, req)
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
	// packResult Node
	reRankNode := compose.InvokableLambda(k.reRankNode)
	parallelNode := compose.NewParallel().AddLambda("vectorRetrieveNode", vectorRetrieveNode).AddLambda("esRetrieveNode", EsRetrieveNode).AddLambda("nl2SqlRetrieveNode", Nl2SqlRetrieveNode).AddLambda("passRequestContext", passRequestContextNode)
	r, err := chain.AppendLambda(rewriteNode).AppendParallel(parallelNode).AppendLambda(reRankNode).Compile(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "compile chain failed: %v", err)
		return nil, err
	}
	output, err := r.Invoke(ctx, retrieveConext)
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
