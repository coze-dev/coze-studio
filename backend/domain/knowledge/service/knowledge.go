package service

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/vectorstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

// index: parser -> vectorstore index
// retriever: rewrite -> vectorstore retrieve -> dedup -> rerank

func NewKnowledgeSVC(
	idgen idgen.IDGenerator,
	db *gorm.DB,
	mq eventbus.Producer,
	vs vectorstore.VectorStore,
	parser parser.Parser, // optional
	reranker rerank.Reranker, // optional
) knowledge.Knowledge {
	return &knowledgeSVC{
		idgen:    idgen,
		db:       db,
		vs:       vs,
		parser:   parser,
		reranker: reranker,
	}
}

type knowledgeSVC struct {
	idgen    idgen.IDGenerator
	db       *gorm.DB
	mq       eventbus.Producer       // required: 文档 indexing 过程走 mq 异步处理
	vs       vectorstore.VectorStore // required: 向量数据库
	parser   parser.Parser           // required: 文档切分与处理能力，不一定支持所有策略
	rewriter rewrite.QueryRewriter   // optional: 未配置时不改写 query
	reranker rerank.Reranker         // optional: 未配置时默认 rrf
}

func (k *knowledgeSVC) CreateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) UpdateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) MGetKnowledge(ctx context.Context, ids []int64) ([]*entity.Knowledge, error) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) ListKnowledge(ctx context.Context) {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) CreateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
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
	panic("implement me")
}
