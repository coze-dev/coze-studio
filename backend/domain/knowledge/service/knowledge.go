package service

import (
	"context"
	"time"

	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/vectorstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/mq"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

// index: parser -> vectorstore index
// retriever: rewrite -> vectorstore retrieve -> dedup -> rerank

func NewKnowledgeSVC(
	idgen idgen.IDGenerator,
	db *gorm.DB,
	mq mq.MQ,
	vs vectorstore.VectorStore,
	parser parser.Parser, // optional
	reranker rerank.Reranker, // optional
	rewtrite rewrite.QueryRewriter, // optional
) knowledge.Knowledge {
	return &knowledgeSVC{
		knowledgeRepo: dao.NewKnowledgeDAO(db),
		documentRepo:  dao.NewKnowledgeDocumentDAO(db),
		sliceRepo:     dao.NewKnowledgeDocumentSliceDAO(db),
		idgen:         idgen,
		mq:            mq,
		vs:            vs,
		parser:        parser,
		reranker:      reranker,
		rewriter:      rewtrite,
	}
}

type knowledgeSVC struct {
	knowledgeRepo dao.KnowledgeRepo
	documentRepo  dao.KnowledgeDocumentRepo
	sliceRepo     dao.KnowledgeDocumentSliceRepo

	idgen    idgen.IDGenerator
	mq       mq.MQ                   // required: 文档 indexing 过程走 mq 异步处理
	vs       vectorstore.VectorStore // required: 向量数据库
	parser   parser.Parser           // required: 文档切分与处理能力，不一定支持所有策略
	rewriter rewrite.QueryRewriter   // optional: 未配置时不改写 query
	reranker rerank.Reranker         // optional: 未配置时默认 rrf
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

func (k *knowledgeSVC) CreateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	k.documentRepo.Create(ctx, &model.KnowledgeDocument{
		ID:          document.ID,
		KnowledgeID: document.KnowledgeID,
		Name:        "",
		Type:        "",
		URI:         "",
		Size:        0,
		SliceCount:  0,
		CharCount:   0,
		CreatorID:   0,
		SpaceID:     0,
		CreatedAt:   0,
		UpdatedAt:   0,
		DeletedAt:   gorm.DeletedAt{},
		SourceType:  0,
		Status:      0,
		FailReason:  "",
		ParseRule:   nil,
		TableID:     0,
	})
	//TODO implement me
	panic("implement me")
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
	rewriteNode := compose.InvokableLambda(queryRewriteNode)
	// 向量化召回
	vectorRetrieveNode := compose.InvokableLambda(vectorRetrieveNode)
	// ES召回
	EsRetrieveNode := compose.InvokableLambda(esRetrieveNode)
	// Nl2Sql召回
	Nl2SqlRetrieveNode := compose.InvokableLambda(nl2SqlRetrieveNode)
	// merge And Rerank Node
	mergeNode := compose.InvokableLambda(mergeNode)
	// packResult Node
	packResultNode := compose.InvokableLambda(packResultNode)
	parallelNode := compose.NewParallel().AddLambda("vectorRetrieveNode", vectorRetrieveNode).AddLambda("esRetrieveNode", EsRetrieveNode).AddLambda("nl2SqlRetrieveNode", Nl2SqlRetrieveNode)
	r, err := chain.AppendLambda(rewriteNode).AppendParallel(parallelNode).AppendLambda(mergeNode).AppendLambda(packResultNode).Compile(ctx)
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

func (k *knowledgeSVC) toModelDocument(doc *entity.Document, tableID int64) *model.KnowledgeDocument {
	return &model.KnowledgeDocument{
		ID:          doc.ID,
		KnowledgeID: doc.KnowledgeID,
		Name:        doc.Name,
		Type:        doc.FilenameExtension, // TODO: 确认下 extension 到 documenttype 转换
		URI:         doc.URI,
		Size:        doc.Size,
		SliceCount:  doc.SliceCount,
		CharCount:   doc.CharCount,
		CreatorID:   doc.CreatorID,
		SpaceID:     doc.SpaceID,
		CreatedAt:   doc.CreatedAtMs,
		UpdatedAt:   doc.UpdatedAtMs,
		SourceType:  int32(doc.Source),
		Status:      int32(doc.Status),
		FailReason:  "",
		ParseRule: &model.DocumentParseRule{
			ParsingStrategy:  doc.ParsingStrategy,
			ChunkingStrategy: doc.ChunkingStrategy,
		},
		TableID: tableID,
	}
}
