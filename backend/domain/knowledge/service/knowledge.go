package service

import (
	"context"
	"errors"
	"strconv"
	"time"
	"unicode/utf8"

	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/doc_processor/processor_impl"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
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
		FormatType:  int32(knowledge.Type),
	}); err != nil {
		return nil, err
	}

	knowledge.UpdatedAtMs = now

	return knowledge, nil
}

func (k *knowledgeSVC) DeleteKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error) {
	err := k.knowledgeRepo.Delete(ctx, knowledge.ID)
	if err != nil {
		return nil, err
	}
	// todo 这里要把所有文档、分片要删除了，并且要把对应的向量库、es里的内容删除掉
	// 先实现文本型知识库的删除
	err = k.deleteDocument(ctx, knowledge.ID, nil, 0)
	if err != nil {
		return nil, err
	}
	knowledge.DeletedAtMs = time.Now().UnixMilli()
	return knowledge, nil
}

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context) {
	// 这个有哪些场景要讨论一下，目前能想到的场景有跨空间复制
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

func (k *knowledgeSVC) CreateDocument(ctx context.Context, document []*entity.Document) (doc []*entity.Document, err error) {
	if len(document) == 0 {
		return nil, errors.New("document is empty")
	}
	userID := document[0].CreatorID
	spaceID := document[0].SpaceID
	documentSource := document[0].Source
	docProcessor := processor_impl.NewDocProcessor(ctx, &processor_impl.DocProcessorConfig{
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
		ImageX:         k.imageX.Imagex,
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
	//TODO implement me
	// 这个接口和前端交互的点待讨论
	panic("implement me")
}

func (k *knowledgeSVC) DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error) {
	//TODO implement me
	// 权限校验，是否用户有删除这个文档的权限
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
		resp.Documents = append(resp.Documents, k.fromModelDocument(ctx, documents[i]))
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
			ID:           documents[i].ID,
			Name:         documents[i].Name,
			Size:         documents[i].Size,
			Type:         documents[i].Type,
			Progress:     100, // 这个进度怎么计算，之前也是粗估的
			Status:       entity.DocumentStatus(documents[i].Status),
			StatusMsg:    entity.DocumentStatus(documents[i].Status).String(),
			RemainingSec: 110, // 这个是计算已经用了多长时间了？
		}
		resp = append(resp, &item)
	}
	return resp, nil
}

func (k *knowledgeSVC) ResegmentDocument(ctx context.Context, request knowledge.ResegmentDocumentRequest) error {
	//TODO implement me
	panic("implement me")
}

func (k *knowledgeSVC) GetTableSchema(ctx context.Context, request *knowledge.GetTableSchemaRequest) (knowledge.GetTableSchemaResponse, error) {
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

func (k *knowledgeSVC) fromModelDocument(ctx context.Context, document *model.KnowledgeDocument) *entity.Document {
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
		KnowledgeID:       document.KnowledgeID,
		URI:               document.URI,
		Size:              document.Size,
		SliceCount:        document.SliceCount,
		CharCount:         document.CharCount,
		FilenameExtension: document.Type,
		Source:            entity.DocumentSource(document.SourceType),
		Status:            entity.DocumentStatus(document.Status),
		ParsingStrategy:   document.ParseRule.ParsingStrategy,
		ChunkingStrategy:  document.ParseRule.ChunkingStrategy,
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
