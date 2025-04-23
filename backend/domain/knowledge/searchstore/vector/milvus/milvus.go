package milvus

import (
	"context"
	"encoding/json"
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
	cm "code.byted.org/flow/opencoze/backend/infra/contract/milvus"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Client    cm.Client          // required
	Embedding embedding.Embedder // required

	EnableHybrid *bool              // optional: default Embedding.SupportStatus() == embedding.SupportDenseAndSparse
	DenseIndex   mentity.Index      // optional: default HNSW, M=30, efConstruction=360
	DenseMetric  mentity.MetricType // optional: default L2
	SparseIndex  mentity.Index      // optional: default SPARSE_INVERTED_INDEX, drop_ratio=0.2
	SparseMetric mentity.MetricType // optional: default IP
	ShardNum     int                // optional: default 1
	BatchSize    int                // optional: default 100

	// CompactTable 用于控制表格类型知识库的构建与召回
	// true: 表格配置中的 indexing 列合为一列进行存储，index 构建于此列，性能较好
	// false: 表格配置中的每个 indexing 列分别进行存储（最多支持 4 列），每列均构建 index，召回通过所有 index 后重排序，召回效果较好
	// default true
	CompactTable *bool
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
	if config.CompactTable == nil {
		config.CompactTable = ptr.Of(true)
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

	for _, part := range slices.SplitSlice(req.Slices, m.config.BatchSize) {
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

	var (
		creatorIDs  = slices.Fill(req.CreatorID, len(ss))
		documentIDs = slices.Fill(req.DocumentID, len(ss))
	)

	switch req.DocumentType {
	case entity.DocumentTypeText:
		var (
			ids          = make([]int64, 0, len(ss))
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
	case entity.DocumentTypeTable:
		td, err := m.getTableDesc(ctx, m.getCollectionName(req.KnowledgeID))
		if err != nil {
			return nil, err
		}

		var (
			ids = make([]int64, 0, len(ss))

			compactTableContents []string
			rawTableContents     map[int64][]string // col_id -> contents

			dense  [][]float64
			sparse []map[int]float64
		)

		// table 类型不存 content
		if td.EnableCompactTable {
			id2ColName := make(map[int64]string)
			for _, col := range req.TableColumns {
				if !col.Indexing {
					continue
				}
				id2ColName[col.ID] = col.Name
			}

			for _, s := range ss {
				ids = append(ids, s.ID)
				contents := make(map[string]string, len(id2ColName))
				if len(s.RawContent) == 0 || s.RawContent[0].Type != entity.SliceContentTypeTable {
					return nil, fmt.Errorf("[slices2Columns] table data invalid")
				}
				row := s.RawContent[0]
				for _, col := range row.Table.Columns {
					name, found := id2ColName[col.ColumnID]
					if !found {
						continue
					}
					contents[name] = col.GetStringValue()
				}
				// column name 一并 embedding
				b, err := json.Marshal(contents)
				if err != nil {
					return nil, err
				}
				compactTableContents = append(compactTableContents, string(b))
			}

			if *m.config.EnableHybrid {
				dense, sparse, err = emb.EmbedStringsHybrid(ctx, compactTableContents)
			} else {
				dense, err = emb.EmbedStrings(ctx, compactTableContents)
			}
			if err != nil {
				return nil, fmt.Errorf("[slices2Columns] embed failed, %w", err)
			}

			cols = []mentity.Column{
				mentity.NewColumnInt64(fieldID, ids),
				mentity.NewColumnInt64(fieldCreatorID, creatorIDs),
				mentity.NewColumnInt64(fieldDocumentID, documentIDs),
				mentity.NewColumnFloatVector(fieldDenseVector, int(emb.Dimensions()), convertDense(dense)),
			}

			if *m.config.EnableHybrid {
				sp, err := convertSparse(sparse)
				if err != nil {
					return nil, fmt.Errorf("[slices2Columns] convert sparse failed, %w", err)
				}
				cols = append(cols, mentity.NewColumnSparseVectors(fieldSparseVector, sp))
			}

		} else {
			for _, col := range req.TableColumns {
				if !col.Indexing {
					continue
				}
				rawTableContents[col.ID] = []string{}
			}

			for _, s := range ss {
				ids = append(ids, s.ID)
				if len(s.RawContent) == 0 || s.RawContent[0].Type != entity.SliceContentTypeTable {
					return nil, fmt.Errorf("[slices2Columns] table data invalid")
				}
				row := s.RawContent[0]
				for _, col := range row.Table.Columns {
					if _, found := rawTableContents[col.ColumnID]; found {
						rawTableContents[col.ColumnID] = append(rawTableContents[col.ColumnID], col.GetStringValue())
					}
				}
			}

			cols = []mentity.Column{
				mentity.NewColumnInt64(fieldID, ids),
				mentity.NewColumnInt64(fieldCreatorID, creatorIDs),
				mentity.NewColumnInt64(fieldDocumentID, documentIDs),
			}

			for colID, contents := range rawTableContents {
				if *m.config.EnableHybrid {
					dense, sparse, err = emb.EmbedStringsHybrid(ctx, contents)
				} else {
					dense, err = emb.EmbedStrings(ctx, contents)
				}
				if err != nil {
					return nil, fmt.Errorf("[slices2Columns] embed failed, %w", err)
				}

				cols = append(cols, mentity.NewColumnFloatVector(m.getTableFieldName(fieldDenseVectorPrefix, colID), int(emb.Dimensions()), convertDense(dense)))

				if *m.config.EnableHybrid {
					sp, err := convertSparse(sparse)
					if err != nil {
						return nil, fmt.Errorf("[slices2Columns] convert sparse failed, %w", err)
					}
					cols = append(cols, mentity.NewColumnSparseVectors(m.getTableFieldName(fieldSparseVectorPrefix, colID), sp))
				}
			}
		}

	default:
		return nil, fmt.Errorf("[slices2Columns] document type not support, type=%d", req.DocumentType)
	}

	return cols, nil
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
		collectionName := m.getCollectionName(knowledgeID)
		td, err := m.getTableDesc(ctx, collectionName)
		if err != nil {
			return nil, err
		}

		switch info.DocumentType {
		case entity.DocumentTypeText:
			eg.Go(func() error {
				defer goutil.Recovery(ctx)

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
				if td.EnableHybrid && *m.config.EnableHybrid { // collection + embedding model both support
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
					result, err = cli.Search(ctx, collectionName, convertPartitions(documentIDs), expr, outputFields, dv, fieldDenseVector, m.config.DenseMetric, topK, nil)
					if err != nil {
						return err
					}
				}

				parsedResult, err := m.parseRetrieveResult(knowledgeID, result)
				if err != nil {
					return err
				}

				mu.Lock()
				aggr = append(aggr, parsedResult...)
				mu.Unlock()
				return nil
			})

		case entity.DocumentTypeTable:
			eg.Go(func() error {
				defer goutil.Recovery(ctx)

				expr, err := m.dsl2Expr(req.FilterDSL)
				if err != nil {
					return err
				}

				// table 类型数据不存储也不召回原文
				outputFields := []string{
					fieldID,
					fieldMetadata,
					fieldCreatorID,
					fieldDocumentID,
				}

				var (
					dense        [][]float64
					sparse       []map[int]float64
					result       []client.SearchResult
					enableHybrid = td.EnableHybrid && *m.config.EnableHybrid
				)

				if enableHybrid {
					dense, sparse, err = emb.EmbedStringsHybrid(ctx, []string{req.Query})
					if err != nil {
						return fmt.Errorf("[Retrieve] EmbedStringsHybrid failed, %w", err)
					}
				} else {
					dense, err = emb.EmbedStrings(ctx, []string{req.Query})
					if err != nil {
						return fmt.Errorf("[Retrieve] EmbedStrings failed, %w", err)
					}
				}

				dv := convertMilvusDenseVector(dense)
				sv, err := convertMilvusSparseVector(sparse)
				if err != nil {
					return err
				}

				if td.EnableCompactTable {
					if enableHybrid {
						result, err = cli.HybridSearch(ctx, collectionName, convertPartitions(documentIDs), topK, outputFields, client.NewRRFReranker(),
							[]*client.ANNSearchRequest{
								client.NewANNSearchRequest(fieldDenseVector, m.config.DenseMetric, expr, dv, nil, topK),
								client.NewANNSearchRequest(fieldSparseVector, m.config.SparseMetric, expr, sv, nil, topK),
							})
						if err != nil {
							return err
						}
					} else {
						result, err = cli.Search(ctx, collectionName, convertPartitions(documentIDs), expr, outputFields, dv, fieldDenseVector, m.config.DenseMetric, topK, nil)
						if err != nil {
							return err
						}
					}
				} else {
					var subRequests []*client.ANNSearchRequest
					for _, field := range td.Schema.Fields {
						if strings.HasPrefix(field.Name, fieldDenseVectorPrefix) && field.DataType == mentity.FieldTypeFloatVector {
							subRequests = append(subRequests, client.NewANNSearchRequest(field.Name, m.config.DenseMetric, expr, dv, nil, topK))
						} else if enableHybrid && strings.HasPrefix(field.Name, fieldSparseVectorPrefix) && field.DataType == mentity.FieldTypeSparseVector {
							subRequests = append(subRequests, client.NewANNSearchRequest(field.Name, m.config.SparseMetric, expr, sv, nil, topK))
						}
					}
					result, err = cli.HybridSearch(ctx, collectionName, convertPartitions(documentIDs), topK, outputFields, client.NewRRFReranker(), subRequests)
					if err != nil {
						return err
					}
				}

				parsedResult, err := m.parseRetrieveResult(knowledgeID, result)
				if err != nil {
					return err
				}

				mu.Lock()
				aggr = append(aggr, parsedResult...)
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

	var opts []client.CreateCollectionOption

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
		if *m.config.CompactTable {
			// save embedding only
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
		} else {
			var colFields []*mentity.Field
			for _, col := range document.TableInfo.Columns {
				if !col.Indexing {
					continue
				}
				colFields = append(colFields,
					mentity.NewField().
						WithName(m.getTableFieldName(fieldDenseVectorPrefix, col.ID)).
						WithDataType(mentity.FieldTypeFloatVector).
						WithDim(emb.Dimensions()),
				)
				if emb.SupportStatus() == embedding.SupportDenseAndSparse {
					fields = append(fields,
						mentity.NewField().
							WithName(m.getTableFieldName(fieldSparseVectorPrefix, col.ID)).
							WithDataType(mentity.FieldTypeSparseVector))
				}
			}
			if len(colFields) > 4 {
				return fmt.Errorf("[createCollection] vector fields over limit, limit=4, got=%d", len(colFields))
			}
		}

		return fmt.Errorf("[createCollection] document type not support, type=%d", document.Type)
	default:
		return fmt.Errorf("[createCollection] document type not support, type=%d", document.Type)
	}

	opts = append(opts, m.genCollectionProperty(document.Type)...)

	if err = cli.CreateCollection(ctx, &mentity.Schema{
		CollectionName:     collectionName,
		Description:        fmt.Sprintf("created by coze %d", document.KnowledgeID),
		AutoID:             false,
		Fields:             fields,
		EnableDynamicField: false,
	}, int32(m.config.ShardNum), opts...); err != nil {
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
	case entity.DocumentTypeTable:
		if *m.config.CompactTable {
			ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldDenseVector, m.config.DenseIndex, client.WithIndexName(indexDenseVector)))
			if *m.config.EnableHybrid {
				ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldSparseVector, m.config.SparseIndex, client.WithIndexName(indexSparseVector)))
			}
		} else {
			for _, col := range document.TableInfo.Columns {
				if !col.Indexing {
					continue
				}
				ops = append(ops, m.tryCreateIndex(ctx, collectionName, m.getTableFieldName(fieldDenseVectorPrefix, col.ID), m.config.DenseIndex, client.WithIndexName(m.getIndexName(indexDenseVectorPrefix, col.ID))))
				if *m.config.EnableHybrid {
					ops = append(ops, m.tryCreateIndex(ctx, collectionName, m.getTableFieldName(fieldSparseVectorPrefix, col.ID), m.config.DenseIndex, client.WithIndexName(m.getIndexName(indexSparseVectorPrefix, col.ID))))
				}
			}
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

func (m *milvus) genCollectionProperty(typ entity.DocumentType) (opts []client.CreateCollectionOption) {
	if typ == entity.DocumentTypeTable && m.config.CompactTable != nil && *m.config.CompactTable {
		opts = append(opts, client.WithCollectionProperty(propertyKeyCompactTable, "1"))
	}
	if m.config.EnableHybrid != nil && *m.config.EnableHybrid {
		opts = append(opts, client.WithCollectionProperty(propertyKeyHybrid, "1"))
	}
	return opts
}

func (m *milvus) getTableDesc(ctx context.Context, collectionName string) (*tableDesc, error) {
	desc, err := m.config.Client.DescribeCollection(ctx, collectionName)
	if err != nil {
		return nil, err
	}

	td := &tableDesc{
		Schema: desc.Schema,
	}

	if desc.Properties != nil {
		// 先不判断 value
		if _, found := desc.Properties[propertyKeyCompactTable]; found {
			td.EnableCompactTable = true
		}
		if _, found := desc.Properties[propertyKeyHybrid]; found {
			td.EnableHybrid = true
		}
	}

	return td, nil
}

func (m *milvus) parseRetrieveResult(knowledgeID int64, result []client.SearchResult) (slices []*knowledge.RetrieveSlice, err error) {
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
					return nil, err
				}
				ss = append(ss, &knowledge.RetrieveSlice{Slice: s, Score: float64(r.Scores[i])})
			}
		}
		slices = append(slices, ss...)
	}

	return slices, nil
}
