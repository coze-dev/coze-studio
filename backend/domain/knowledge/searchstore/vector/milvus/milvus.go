package milvus

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"

	"github.com/milvus-io/milvus/client/v2/column"
	mentity "github.com/milvus-io/milvus/client/v2/entity"
	mindex "github.com/milvus-io/milvus/client/v2/index"
	client "github.com/milvus-io/milvus/client/v2/milvusclient"
	"golang.org/x/sync/errgroup"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/embedding"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Client    *client.Client     // required
	Embedding embedding.Embedder // required

	EnableHybrid *bool              // optional: default Embedding.SupportStatus() == embedding.SupportDenseAndSparse
	DenseIndex   mindex.Index       // optional: default HNSW, M=30, efConstruction=360
	DenseMetric  mentity.MetricType // optional: default L2
	SparseIndex  mindex.Index       // optional: default SPARSE_INVERTED_INDEX, drop_ratio=0.2
	SparseMetric mentity.MetricType // optional: default IP
	ShardNum     int                // optional: default 1
	BatchSize    int                // optional: default 100
	AnnParam     mindex.AnnParam    // optional: default IndexHNSWSearchParam ef=100

	// CompactTable 用于控制表格类型知识库的构建与召回，仅影响新建知识库，已有的知识库会按当时初始化的配置进行处理
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
		config.DenseIndex = mindex.NewHNSWIndex(config.DenseMetric, 30, 360)
	}
	if config.SparseMetric == "" {
		config.SparseMetric = mentity.IP
	}
	if config.SparseIndex == nil {
		config.SparseIndex = mindex.NewSparseInvertedIndex(config.SparseMetric, 0.2)
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
		return fmt.Errorf("[Create] create collection failed, %w", err)
	}

	if err := m.createIndexes(ctx, document); err != nil {
		return fmt.Errorf("[Create] createIndexes failed, %w", err)
	}

	if err := m.loadCollection(ctx, document); err != nil {
		return fmt.Errorf("[Create] load collection failed, %w", err)
	}

	return nil
}

func (m *milvus) Drop(ctx context.Context, knowledgeID int64) error {
	return m.config.Client.DropCollection(ctx, client.NewDropCollectionOption(m.getCollectionName(knowledgeID)))
}

func (m *milvus) Store(ctx context.Context, req *searchstore.StoreRequest) error {
	cli := m.config.Client
	collectionName := m.getCollectionName(req.KnowledgeID)

	partitionName := convertPartition(req.DocumentID)
	hasPartition, err := cli.HasPartition(ctx, client.NewHasPartitionOption(collectionName, partitionName))
	if err != nil {
		return fmt.Errorf("[Store] HasPartition failed, %w", err)
	}

	if !hasPartition {
		if err = cli.CreatePartition(ctx, client.NewCreatePartitionOption(collectionName, partitionName)); err != nil {
			return fmt.Errorf("[Store] CreatePartition failed, %w", err)
		}
	}

	for _, part := range slices.Chunks(req.Slices, m.config.BatchSize) {
		cols, err := m.slices2Columns(ctx, req, part)
		if err != nil {
			return err
		}

		if _, err = cli.Upsert(ctx, client.NewColumnBasedInsertOption(collectionName, cols...).WithPartition(partitionName)); err != nil {
			return fmt.Errorf("[Store] upsert failed, %w", err)
		}
	}

	return nil
}

func (m *milvus) slices2Columns(ctx context.Context, req *searchstore.StoreRequest, ss []*entity.Slice) (cols []column.Column, err error) {

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

		cols = []column.Column{
			column.NewColumnInt64(fieldID, ids),
			column.NewColumnInt64(fieldCreatorID, creatorIDs),
			column.NewColumnInt64(fieldDocumentID, documentIDs),
			column.NewColumnVarChar(fieldTextContent, textContents),
			column.NewColumnFloatVector(fieldDenseVector, int(emb.Dimensions()), convertDense(dense)),
		}

		if *m.config.EnableHybrid {
			sp, err := convertSparse(sparse)
			if err != nil {
				return nil, fmt.Errorf("[slices2Columns] convert sparse failed, %w", err)
			}
			cols = append(cols, column.NewColumnSparseVectors(fieldSparseVector, sp))
		}
	case entity.DocumentTypeTable:
		cd, err := m.getCollectionDesc(ctx, m.getCollectionName(req.KnowledgeID))
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
		if cd.EnableCompactTable {
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
					if col.ColumnName == consts.RDBFieldID {
						continue
					}
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

			cols = []column.Column{
				column.NewColumnInt64(fieldID, ids),
				column.NewColumnInt64(fieldCreatorID, creatorIDs),
				column.NewColumnInt64(fieldDocumentID, documentIDs),
				column.NewColumnFloatVector(fieldDenseVector, int(emb.Dimensions()), convertDense(dense)),
			}

			if *m.config.EnableHybrid {
				sp, err := convertSparse(sparse)
				if err != nil {
					return nil, fmt.Errorf("[slices2Columns] convert sparse failed, %w", err)
				}
				cols = append(cols, column.NewColumnSparseVectors(fieldSparseVector, sp))
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
					if col.ColumnName == consts.RDBFieldID {
						continue
					}
					if _, found := rawTableContents[col.ColumnID]; found {
						rawTableContents[col.ColumnID] = append(rawTableContents[col.ColumnID], col.GetStringValue())
					}
				}
			}

			cols = []column.Column{
				column.NewColumnInt64(fieldID, ids),
				column.NewColumnInt64(fieldCreatorID, creatorIDs),
				column.NewColumnInt64(fieldDocumentID, documentIDs),
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

				cols = append(cols, column.NewColumnFloatVector(m.getTableFieldName(fieldDenseVectorPrefix, colID), int(emb.Dimensions()), convertDense(dense)))

				if *m.config.EnableHybrid {
					sp, err := convertSparse(sparse)
					if err != nil {
						return nil, fmt.Errorf("[slices2Columns] convert sparse failed, %w", err)
					}
					cols = append(cols, column.NewColumnSparseVectors(m.getTableFieldName(fieldSparseVectorPrefix, colID), sp))
				}
			}
		}

	default:
		return nil, fmt.Errorf("[slices2Columns] document type not support, type=%d", req.DocumentType)
	}

	return cols, nil
}

func (m *milvus) Delete(ctx context.Context, knowledgeID int64, slicesIDs []int64) error {
	cli := m.config.Client
	collectionName := m.getCollectionName(knowledgeID)

	_, err := cli.Delete(ctx, client.NewDeleteOption(collectionName).WithInt64IDs(fieldID, slicesIDs))
	return err
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
		cd, err := m.getCollectionDesc(ctx, collectionName)
		if err != nil {
			return nil, err
		}

		fieldMapping := make(map[string]*mentity.Field)
		for _, field := range cd.Schema.Fields {
			f := field
			fieldMapping[field.Name] = f
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
					fieldCreatorID,
					fieldDocumentID,
					fieldTextContent,
				}

				var result []client.ResultSet
				if cd.EnableHybrid && *m.config.EnableHybrid { // collection + embedding model both support
					dense, sparse, err := emb.EmbedStringsHybrid(ctx, []string{req.Query})
					if err != nil {
						return fmt.Errorf("[Retrieve] EmbedStringsHybrid failed, %w", err)
					}

					dv := convertMilvusDenseVector(dense)
					sv, err := convertMilvusSparseVector(sparse)
					if err != nil {
						return err
					}

					searchOption := client.NewHybridSearchOption(
						collectionName,
						topK,
						client.NewAnnRequest(fieldDenseVector, topK, dv...).WithSearchParam(mindex.MetricTypeKey, string(m.config.DenseMetric)).WithFilter(expr),
						client.NewAnnRequest(fieldSparseVector, topK, sv...).WithSearchParam(mindex.MetricTypeKey, string(m.config.SparseMetric)).WithFilter(expr),
					).
						WithPartitons(convertPartitions(documentIDs)...).
						WithReranker(client.NewRRFReranker()).
						WithOutputFields(outputFields...)

					result, err = cli.HybridSearch(ctx, searchOption)
					if err != nil {
						return err
					}

				} else {
					dense, err := emb.EmbedStrings(ctx, []string{req.Query})
					if err != nil {
						return fmt.Errorf("[Retrieve] EmbedStrings failed, %w", err)
					}

					dv := convertMilvusDenseVector(dense)
					searchOption := client.NewSearchOption(collectionName, topK, dv).
						WithPartitions(convertPartitions(documentIDs)...).
						WithFilter(expr).
						WithOutputFields(outputFields...)

					result, err = cli.Search(ctx, searchOption)
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
					fieldCreatorID,
					fieldDocumentID,
				}

				var (
					dense        [][]float64
					sparse       []map[int]float64
					result       []client.ResultSet
					enableHybrid = cd.EnableHybrid && *m.config.EnableHybrid
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

				if cd.EnableCompactTable {
					if enableHybrid {
						searchOption := client.NewHybridSearchOption(
							collectionName,
							topK,
							client.NewAnnRequest(fieldDenseVector, topK, dv...).WithSearchParam(mindex.MetricTypeKey, string(m.config.DenseMetric)).WithFilter(expr),
							client.NewAnnRequest(fieldSparseVector, topK, sv...).WithSearchParam(mindex.MetricTypeKey, string(m.config.SparseMetric)).WithFilter(expr),
						).
							WithPartitons(convertPartitions(documentIDs)...).
							WithReranker(client.NewRRFReranker()).
							WithOutputFields(outputFields...)

						result, err = cli.HybridSearch(ctx, searchOption)
						if err != nil {
							return err
						}
					} else {
						searchOption := client.NewSearchOption(collectionName, topK, dv).
							WithPartitions(convertPartitions(documentIDs)...).
							WithFilter(expr).
							WithOutputFields(outputFields...)

						result, err = cli.Search(ctx, searchOption)
						if err != nil {
							return err
						}
					}
				} else {
					var subRequests []*client.AnnRequest
					for _, col := range info.TableColumns {
						if !col.Indexing {
							continue
						}

						// check fields
						denseFieldName := m.getTableFieldName(fieldDenseVector, col.ID)
						sparseFieldName := m.getTableFieldName(fieldSparseVector, col.ID)

						if _, found := fieldMapping[denseFieldName]; found {
							subRequests = append(subRequests, client.NewAnnRequest(fieldDenseVector, topK, dv...).WithSearchParam(mindex.MetricTypeKey, string(m.config.DenseMetric)).WithFilter(expr))
						}
						if _, found := fieldMapping[sparseFieldName]; found && enableHybrid {
							subRequests = append(subRequests, client.NewAnnRequest(fieldSparseVector, topK, sv...).WithSearchParam(mindex.MetricTypeKey, string(m.config.SparseMetric)).WithFilter(expr))
						}
					}

					searchOption := client.NewHybridSearchOption(
						collectionName,
						topK,
						subRequests...,
					).
						WithPartitons(convertPartitions(documentIDs)...).
						WithReranker(client.NewRRFReranker()).
						WithOutputFields(outputFields...)

					result, err = cli.HybridSearch(ctx, searchOption)
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
	enableSparse := m.configEnableSparse()
	collectionName := m.getCollectionName(document.KnowledgeID)
	has, err := cli.HasCollection(ctx, client.NewHasCollectionOption(collectionName))
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
		if enableSparse {
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
			if enableSparse {
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
				if enableSparse {
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
	default:
		return fmt.Errorf("[createCollection] document type not support, type=%d", document.Type)
	}

	opt := client.NewCreateCollectionOption(collectionName, &mentity.Schema{
		CollectionName:     collectionName,
		Description:        fmt.Sprintf("created by coze %d", document.KnowledgeID),
		AutoID:             false,
		Fields:             fields,
		EnableDynamicField: false,
	}).WithShardNum(int32(m.config.ShardNum))

	for k, v := range m.genCollectionProperties(document.Type) {
		opt.WithProperty(k, v)
	}

	if err = cli.CreateCollection(ctx, opt); err != nil {
		return fmt.Errorf("[createCollection] CreateCollection failed, %w", err)
	}

	return nil
}

func (m *milvus) createIndexes(ctx context.Context, document *entity.Document) error {
	collectionName := m.getCollectionName(document.KnowledgeID)
	enableSparse := m.configEnableSparse()
	// ListIndexes not provided, has to check one by one

	var ops []func() error
	switch document.Type {
	case entity.DocumentTypeText:
		ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldDenseVector, indexDenseVector, m.config.DenseIndex))
		if enableSparse {
			ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldSparseVector, indexSparseVector, m.config.SparseIndex))
		}
	case entity.DocumentTypeTable:
		if *m.config.CompactTable {
			ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldDenseVector, indexDenseVector, m.config.DenseIndex))
			if enableSparse {
				ops = append(ops, m.tryCreateIndex(ctx, collectionName, fieldSparseVector, indexSparseVector, m.config.SparseIndex))
			}
		} else {
			for _, col := range document.TableInfo.Columns {
				if !col.Indexing || col.Name == consts.RDBFieldID {
					continue
				}
				ops = append(ops, m.tryCreateIndex(ctx, collectionName, m.getTableFieldName(fieldDenseVectorPrefix, col.ID), m.getIndexName(indexDenseVectorPrefix, col.ID), m.config.DenseIndex))
				if enableSparse {
					ops = append(ops, m.tryCreateIndex(ctx, collectionName, m.getTableFieldName(fieldSparseVectorPrefix, col.ID), m.getIndexName(indexSparseVectorPrefix, col.ID), m.config.SparseIndex))
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

func (m *milvus) loadCollection(ctx context.Context, document *entity.Document) error {
	cli := m.config.Client
	collectionName := m.getCollectionName(document.KnowledgeID)

	stat, err := cli.GetLoadState(ctx, client.NewGetLoadStateOption(collectionName))
	if err != nil {
		return err
	}

	switch stat.State {
	case mentity.LoadStateNotLoad:
		task, err := cli.LoadCollection(ctx, client.NewLoadCollectionOption(collectionName))
		if err != nil {
			return err
		}
		if err = task.Await(ctx); err != nil {
			return err
		}
	case mentity.LoadStateLoaded:
		// do nothing
	default:
		return fmt.Errorf("[loadCollection] load state unexpected, state=%d", stat)

	}
	return nil
}

func (m *milvus) tryCreateIndex(ctx context.Context, collectionName, fieldName, indexName string, idx mindex.Index) func() error {
	return func() error {
		cli := m.config.Client

		if desc, err := cli.DescribeIndex(ctx, client.NewDescribeIndexOption(collectionName, fieldName)); err != nil {
			// if !strings.Contains(err.Error(), fmt.Sprintf("%d", commonpb.ErrorCode_IndexNotExist)) {
			//	return err
			// }
			if !strings.Contains(err.Error(), "index not found") {
				return fmt.Errorf("[tryCreateIndex] DescribeIndex failed, %w", err)
			}
		} else {
			_ = desc
			return nil
		}

		task, err := cli.CreateIndex(ctx, client.NewCreateIndexOption(collectionName, fieldName, idx).WithIndexName(indexName))
		if err != nil {
			return fmt.Errorf("[tryCreateIndex] CreateIndex failed, %w", err)
		}

		if err = task.Await(ctx); err != nil {
			return fmt.Errorf("[tryCreateIndex] await failed, %w", err)
		}

		fmt.Printf("[tryCreateIndex] CreateIndex success, collectionName=%s, fieldName=%s, idx=%v, type=%s\n", collectionName, fieldName, indexName, idx.IndexType())
		return nil
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

func (m *milvus) genCollectionProperties(typ entity.DocumentType) map[string]string {
	resp := make(map[string]string)
	if typ == entity.DocumentTypeTable && m.config.CompactTable != nil && *m.config.CompactTable {
		resp[propertyKeyCompactTable] = "1"
	}
	if m.config.EnableHybrid != nil && *m.config.EnableHybrid {
		resp[propertyKeyHybrid] = "1"
	}
	return resp
}

func (m *milvus) getCollectionDesc(ctx context.Context, collectionName string) (*collectionDesc, error) {
	desc, err := m.config.Client.DescribeCollection(ctx, client.NewDescribeCollectionOption(collectionName))
	if err != nil {
		return nil, err
	}

	cd := &collectionDesc{
		Schema: desc.Schema,
	}

	if desc.Properties != nil {
		// 先不判断 value
		if _, found := desc.Properties[propertyKeyCompactTable]; found {
			cd.EnableCompactTable = true
		}
		if _, found := desc.Properties[propertyKeyHybrid]; found {
			cd.EnableHybrid = true
		}
	}

	return cd, nil
}

func (m *milvus) parseRetrieveResult(knowledgeID int64, result []client.ResultSet) (slices []*knowledge.RetrieveSlice, err error) {
	for _, r := range result {
		ss := make([]*knowledge.RetrieveSlice, 0, r.ResultCount)
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
			}
			ss = append(ss, &knowledge.RetrieveSlice{Slice: s, Score: float64(r.Scores[i])})
		}
		slices = append(slices, ss...)
	}

	return slices, nil
}

func (m *milvus) configEnableSparse() bool {
	return *m.config.EnableHybrid && m.config.Embedding.SupportStatus() == embedding.SupportDenseAndSparse
}
