package milvus

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/milvus-io/milvus-proto/go-api/v2/commonpb"
	"github.com/milvus-io/milvus-sdk-go/v2/client"
	mentity "github.com/milvus-io/milvus-sdk-go/v2/entity"
	"golang.org/x/sync/errgroup"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/embedding"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Client    client.Client      // required
	Embedding embedding.Embedder // required

	EnableHybrid *bool              // optional: default Embedding.SupportStatus() == embedding.SupportDenseAndSparse
	DenseIndex   mentity.Index      // optional: default HNSW, M=30, efConstruction=360
	DenseMetric  mentity.MetricType // optional: default L2
	SparseIndex  mentity.Index      // optional: default SPARSE_INVERTED_INDEX, drop_ratio=0.2
	SparseMetric mentity.MetricType // optional: default IP
	ShardNum     int                // optional: default 1
	BatchSize    int                // optional: default 100
}

func NewSearchStore(config *Config) (ss searchstore.SearchStore, err error) {
	if config.Client == nil {
		return nil, fmt.Errorf("[NewSearchStore] client not provided")
	}
	if config.Embedding == nil {
		return nil, fmt.Errorf("[NewSearchStore] embedder not provided")
	}
	if config.EnableHybrid == nil {
		enable := config.Embedding.SupportStatus() == embedding.SupportDenseAndSparse
		config.EnableHybrid = &enable
	}
	if config.DenseMetric == "" {
		config.DenseMetric = mentity.L2
	}
	if config.DenseIndex == nil {
		config.DenseIndex, err = mentity.NewIndexHNSW(config.DenseMetric, 30, 360)
		if err != nil { // unexpected
			return nil, fmt.Errorf("[NewSearchStore] NewDenseIndex failed, %w", err)
		}
	}
	if config.SparseMetric == "" {
		config.SparseMetric = mentity.IP
	}
	if config.SparseIndex != nil {
		config.SparseIndex, err = mentity.NewIndexSparseInverted(config.SparseMetric, 0.2)
		if err != nil { // unexpected
			return nil, fmt.Errorf("[NewSearchStore] NewSparseIndex failed, %w", err)
		}
	}
	if config.ShardNum == 0 {
		config.ShardNum = 1
	}
	if config.BatchSize == 0 {
		config.BatchSize = 100
	}

	return &milvus{config: config}, nil
}

type milvus struct {
	config *Config
}

func (m *milvus) GetType() searchstore.Type {
	return searchstore.TypeVectorStore
}

func (m *milvus) Create(ctx context.Context, document *entity.Document) error {
	// TODO: lock
	if err := m.createCollection(ctx, document); err != nil {
		return err
	}

	if err := m.createIndexes(ctx, document); err != nil {
		return err
	}

	return nil
}

func (m *milvus) Drop(ctx context.Context, knowledgeID int64) error {
	return m.config.Client.DropCollection(ctx, m.getCollectionName(knowledgeID))
}

func (m *milvus) Store(ctx context.Context, req *searchstore.StoreRequest) error {
	cli := m.config.Client
	collectionName := m.getCollectionName(req.KnowledgeID)

	for _, part := range slices.Chunk(req.Slices, m.config.BatchSize) {
		cols, err := m.slices2Columns(ctx, req, part)
		if err != nil {
			return err
		}

		if _, err = cli.Upsert(ctx, collectionName, strconv.FormatInt(req.DocumentID, 10), cols...); err != nil {
			return err
		}
	}

	return nil
}

func (m *milvus) slices2Columns(ctx context.Context, req *searchstore.StoreRequest, ss []*entity.Slice) (cols []mentity.Column, err error) {
	emb := m.config.Embedding

	switch req.DocumentType {
	case entity.DocumentTypeText:

		var (
			ids          = make([]int64, 0, len(ss))
			creatorIDs   = slices.Fill(req.CreatorID, len(ss))
			documentIDs  = slices.Fill(req.DocumentID, len(ss))
			textContents = make([]string, 0, len(ss))

			dense  [][]float64
			sparse []map[int]float64
		)

		for _, s := range ss {
			ids = append(ids, s.ID)
			textContents = append(textContents, s.PlainText) // TODO: use RawContent?
		}

		if *m.config.EnableHybrid {
			dense, sparse, err = emb.EmbedStringsHybrid(ctx, textContents)
		} else {
			dense, err = emb.EmbedStrings(ctx, textContents)
		}
		if err != nil {
			return nil, fmt.Errorf("[slices2Columns] embed failed, %w", err)
		}

		cols = []mentity.Column{
			mentity.NewColumnInt64(fieldID, ids),
			mentity.NewColumnInt64(fieldCreatorID, creatorIDs),
			mentity.NewColumnInt64(fieldDocumentID, documentIDs),
			mentity.NewColumnVarChar(fieldTextContent, textContents),
			mentity.NewColumnFloatVector(fieldDenseVector, int(emb.Dimensions()), convertDense(dense)),
		}

		if *m.config.EnableHybrid {
			sp, err := convertSparse(sparse)
			if err != nil {
				return nil, fmt.Errorf("[slices2Columns] convert sparse failed, %w", err)
			}
			cols = append(cols, mentity.NewColumnSparseVectors(fieldSparseVector, sp))
		}

	default:
		return nil, fmt.Errorf("[slices2Columns] document type not support, type=%d", req.DocumentType)
	}

	return
}

func (m *milvus) Delete(ctx context.Context, knowledgeID int64, ids []int64) error {
	cli := m.config.Client
	collectionName := m.getCollectionName(knowledgeID)

	return cli.DeleteByPks(ctx, collectionName, "", mentity.NewColumnInt64(fieldID, ids))
}

func (m *milvus) Retrieve(ctx context.Context, req *searchstore.RetrieveRequest) ([]*knowledge.RetrieveSlice, error) {
	cli := m.config.Client
	emb := m.config.Embedding

	var (
		mu   = sync.Mutex{}
		aggr []*knowledge.RetrieveSlice
		topK = 4
	)

	if req.TopK != nil {
		topK = int(*req.TopK)
	}

	eg, ctx := errgroup.WithContext(ctx)

	for kid, info := range req.KnowledgeInfoMap {
		knowledgeID := kid
		documentIDs := info.DocumentIDs

		switch info.DocumentType {
		case entity.DocumentTypeText:
			eg.Go(func() error {
				defer goutil.Recovery(ctx)

				collectionName := m.getCollectionName(knowledgeID)

				expr, err := m.dsl2Expr(req.FilterDSL)
				if err != nil {
					return err
				}

				outputFields := []string{
					fieldID,
					fieldMetadata,
					fieldCreatorID,
					fieldDocumentID,
					fieldTextContent,
				}

				var result []client.SearchResult
				if *m.config.EnableHybrid {
					dense, sparse, err := emb.EmbedStringsHybrid(ctx, []string{req.Query})
					if err != nil {
						return fmt.Errorf("[Retrieve] EmbedStringsHybrid failed, %w", err)
					}

					dv := convertMilvusDenseVector(dense)
					sv, err := convertMilvusSparseVector(sparse)
					if err != nil {
						return err
					}

					subRequests := []*client.ANNSearchRequest{
						client.NewANNSearchRequest(fieldDenseVector, m.config.DenseMetric, expr, dv, nil, topK),
						client.NewANNSearchRequest(fieldSparseVector, m.config.SparseMetric, expr, sv, nil, topK),
					}

					result, err = cli.HybridSearch(ctx, collectionName, convertPartitions(documentIDs), topK, outputFields, client.NewRRFReranker(), subRequests)
					if err != nil {
						return err
					}
				} else {
					dense, err := emb.EmbedStrings(ctx, []string{req.Query})
					if err != nil {
						return fmt.Errorf("[Retrieve] EmbedStrings failed, %w", err)
					}

					dv := convertMilvusDenseVector(dense)
					result, err = cli.Search(ctx, collectionName, nil, expr, outputFields, dv, fieldDenseVector, m.config.DenseMetric, topK, nil)
					if err != nil {
						return err
					}
				}

				// parse result
				var slice []*knowledge.RetrieveSlice
				for _, r := range result {
					ss := make([]*knowledge.RetrieveSlice, r.ResultCount)
					for i := 0; i < r.ResultCount; i++ {
						s := &entity.Slice{
							KnowledgeID: knowledgeID,
						}
						for _, field := range r.Fields {
							switch field.Name() {
							case fieldID:
								s.ID, err = field.GetAsInt64(i)
							case fieldCreatorID:
								s.CreatorID, err = field.GetAsInt64(i)
							case fieldDocumentID:
								s.DocumentID, err = field.GetAsInt64(i)
							case fieldTextContent:
								s.PlainText, err = field.GetAsString(i)
							default:

							}
							if err != nil {
								return err
							}
							ss = append(ss, &knowledge.RetrieveSlice{Slice: s, Score: float64(r.Scores[i])})
						}
					}
					slice = append(slice, ss...)
				}

				mu.Lock()
				aggr = append(aggr, slice...)
				mu.Unlock()
				return nil
			})
		default:
			return nil, fmt.Errorf("[Retrieve] document type not support, type=%d", info.DocumentType)
		}
	}

	if err := eg.Wait(); err != nil {
		return nil, err
	}

	sort.Slice(aggr, func(i, j int) bool {
		return aggr[i].Score > aggr[i].Score
	})

	r := min(topK, len(aggr))
	return aggr[:r], nil
}

func (m *milvus) createCollection(ctx context.Context, document *entity.Document) error {
	if document.KnowledgeID == 0 {
		return fmt.Errorf("[createCollection] knowledge knowledge_id not provided")
	}

	cli := m.config.Client
	emb := m.config.Embedding
	collectionName := m.getCollectionName(document.KnowledgeID)
	has, err := cli.HasCollection(ctx, collectionName)
	if err != nil {
		return fmt.Errorf("[createCollection] HasCollection failed, %w", err)
	}
	if has {
		return nil
	}

	fields := []*mentity.Field{
		{
			Name:       fieldID,
			DataType:   mentity.FieldTypeInt64,
			PrimaryKey: true,
		},
		{
			Name:     fieldCreatorID,
			DataType: mentity.FieldTypeInt64,
		},
		{
			Name:     fieldDocumentID,
			DataType: mentity.FieldTypeInt64,
		},
		{
			Name:     fieldMetadata,
			DataType: mentity.FieldTypeJSON,
		},
	}

	switch document.Type {
	case entity.DocumentTypeText:
		fields = append(fields,
			mentity.NewField().
				WithName(fieldTextContent).
				WithDataType(mentity.FieldTypeVarChar).
				WithMaxLength(65535),
		)
		fields = append(fields,
			mentity.NewField().
				WithName(fieldDenseVector).
				WithDataType(mentity.FieldTypeFloatVector).
				WithDim(emb.Dimensions()),
		)
		if *m.config.EnableHybrid {
			fields = append(fields,
				mentity.NewField().
					WithName(fieldSparseVector).
					WithDataType(mentity.FieldTypeSparseVector))
		}

	case entity.DocumentTypeTable:
		// TODO
		//var colFields []*mentity.Field
		//for _, col := range document.TableColumns {
		//	if !col.Indexing {
		//		continue
		//	}
		//	colFields = append(colFields,
		//		mentity.NewField().
		//			WithName(m.getTableFieldName(fieldDenseVectorPrefix, col.ID)).
		//			WithDataType(mentity.FieldTypeFloatVector).
		//			WithDim(emb.Dimensions()),
		//	)
		//	if emb.SupportStatus() == embedding.SupportDenseAndSparse {
		//		fields = append(fields,
		//			mentity.NewField().
		//				WithName(m.getTableFieldName(fieldSparseVectorPrefix, col.ID)).
		//				WithDataType(mentity.FieldTypeSparseVector))
		//	}
		//}
		//
		//if len(colFields) > 4 {
		//	return fmt.Errorf("[createCollection] vector fields over limit, limit=4, got=%d", len(colFields))
		//}
		return fmt.Errorf("[createCollection] document type not support, type=%d", document.Type)
	default:
		return fmt.Errorf("[createCollection] document type not support, type=%d", document.Type)
	}

	if err = cli.CreateCollection(ctx, &mentity.Schema{
		CollectionName:     collectionName,
		Description:        fmt.Sprintf("created by coze %d", document.KnowledgeID),
		AutoID:             false,
		Fields:             fields,
		EnableDynamicField: false,
	}, int32(m.config.ShardNum)); err != nil {
		return fmt.Errorf("[createCollection] CreateCollection failed, %w", err)
	}

	return nil
}

func (m *milvus) createIndexes(ctx context.Context, document *entity.Document) error {
	collectionName := m.getCollectionName(document.KnowledgeID)
	// ListIndexes not provided, has to check one by one

	var ops []func() error
	switch document.Type {
	case entity.DocumentTypeText:
		ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldDenseVector, m.config.DenseIndex, client.WithIndexName(indexDenseVector)))
		if *m.config.EnableHybrid {
			ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldSparseVector, m.config.SparseIndex, client.WithIndexName(indexSparseVector)))
		}
	default:
		return fmt.Errorf("[createIndexes] document type not support, type=%d", document.Type)
	}

	for _, op := range ops {
		if err := op(); err != nil {
			return fmt.Errorf("[createIndexes] failed, %w", err)
		}
	}

	return nil
}

func (m *milvus) tryCreateIndex(ctx context.Context, collectionName, fieldName string, idx mentity.Index, opts ...client.IndexOption) func() error {
	return func() error {
		cli := m.config.Client
		if _, err := cli.DescribeIndex(ctx, collectionName, fieldName); err != nil {
			if !strings.Contains(err.Error(), fmt.Sprintf("%d", commonpb.ErrorCode_IndexNotExist)) {
				return err
			}
		} else {
			return nil
		}

		return cli.CreateIndex(ctx, collectionName, fieldName, idx, false, opts...)
	}
}

func (m *milvus) dsl2Expr(dsl map[string]interface{}) (string, error) {
	if dsl == nil {
		return "", nil
	}
	// todo: support dsl convert
	return "", nil
}

func (m *milvus) getCollectionName(knowledgeID int64) string {
	return fmt.Sprintf("%s%d", collectionPrefix, knowledgeID)
}

func (m *milvus) getTableFieldName(prefix string, colID int64) string {
	return fmt.Sprintf("%s%d", prefix, colID)
}

func (m *milvus) getIndexName(prefix string, colID int64) string {
	return fmt.Sprintf("%s%d", prefix, colID)
}
