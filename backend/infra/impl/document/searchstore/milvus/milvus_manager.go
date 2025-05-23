package milvus

import (
	"context"
	"fmt"
	"strings"

	mentity "github.com/milvus-io/milvus/client/v2/entity"
	mindex "github.com/milvus-io/milvus/client/v2/index"
	client "github.com/milvus-io/milvus/client/v2/milvusclient"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/embedding"
)

type ManagerConfig struct {
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
}

func NewManager(config *ManagerConfig) (searchstore.Manager, error) {
	if config.Client == nil {
		return nil, fmt.Errorf("[NewManager] milvus client not provided")
	}
	if config.Embedding == nil {
		return nil, fmt.Errorf("[NewManager] milvus embedder not provided")
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

	return &milvusManager{config: config}, nil
}

type milvusManager struct {
	config *ManagerConfig
}

func (m *milvusManager) Create(ctx context.Context, req *searchstore.CreateRequest) error {
	if err := m.createCollection(ctx, req); err != nil {
		return fmt.Errorf("[Create] create collection failed, %w", err)
	}

	if err := m.createIndexes(ctx, req); err != nil {
		return fmt.Errorf("[Create] create indexes failed, %w", err)
	}

	if err := m.loadCollection(ctx, req.CollectionName); err != nil {
		return fmt.Errorf("[Create] load collection failed, %w", err)
	}

	return nil
}

func (m *milvusManager) Drop(ctx context.Context, req *searchstore.DropRequest) error {
	return m.config.Client.DropCollection(ctx, client.NewDropCollectionOption(req.CollectionName))
}

func (m *milvusManager) GetType() searchstore.SearchStoreType {
	return searchstore.TypeVectorStore
}

func (m *milvusManager) GetSearchStore(ctx context.Context, collectionName string) (searchstore.SearchStore, error) {
	if err := m.loadCollection(ctx, collectionName); err != nil {
		return nil, err
	}

	return &milvusSearchStore{
		config:         m.config,
		collectionName: collectionName,
	}, nil
}

func (m *milvusManager) createCollection(ctx context.Context, req *searchstore.CreateRequest) error {
	if req.CollectionName == "" || len(req.Fields) == 0 {
		return fmt.Errorf("[createCollection] invalid request params")
	}

	cli := m.config.Client
	collectionName := req.CollectionName
	has, err := cli.HasCollection(ctx, client.NewHasCollectionOption(collectionName))
	if err != nil {
		return fmt.Errorf("[createCollection] HasCollection failed, %w", err)
	}
	if has {
		return nil
	}

	fields, err := m.convertFields(req.Fields)
	if err != nil {
		return err
	}

	opt := client.NewCreateCollectionOption(collectionName, &mentity.Schema{
		CollectionName:     collectionName,
		Description:        fmt.Sprintf("created by coze"),
		AutoID:             false,
		Fields:             fields,
		EnableDynamicField: false,
	}).WithShardNum(int32(m.config.ShardNum))

	for k, v := range req.CollectionMeta {
		opt.WithProperty(k, v)
	}

	if err = cli.CreateCollection(ctx, opt); err != nil {
		return fmt.Errorf("[createCollection] CreateCollection failed, %w", err)
	}

	return nil
}

func (m *milvusManager) createIndexes(ctx context.Context, req *searchstore.CreateRequest) error {
	collectionName := req.CollectionName
	indexes, err := m.config.Client.ListIndexes(ctx, client.NewListIndexOption(req.CollectionName))
	if err != nil {
		if !strings.Contains(err.Error(), "index not found") {
			return fmt.Errorf("[createIndexes] ListIndexes failed, %w", err)
		}
	}
	created := make(map[string]struct{})
	for _, index := range indexes {
		created[index] = struct{}{}
	}

	var ops []func() error
	for i := range req.Fields {
		f := req.Fields[i]
		if !f.Indexing {
			continue
		}

		ops = append(ops, m.tryCreateIndex(ctx, collectionName, denseFieldName(f.Name), denseIndexName(f.Name), m.config.DenseIndex))
		if m.config.Embedding.SupportStatus() == embedding.SupportDenseAndSparse {
			ops = append(ops, m.tryCreateIndex(ctx, collectionName, sparseFieldName(f.Name), sparseIndexName(f.Name), m.config.SparseIndex))
		}
	}

	for _, op := range ops {
		if err := op(); err != nil {
			return fmt.Errorf("[createIndexes] failed, %w", err)
		}
	}

	return nil
}

func (m *milvusManager) tryCreateIndex(ctx context.Context, collectionName, fieldName, indexName string, idx mindex.Index) func() error {
	return func() error {
		cli := m.config.Client

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

func (m *milvusManager) loadCollection(ctx context.Context, collectionName string) error {
	cli := m.config.Client

	stat, err := cli.GetLoadState(ctx, client.NewGetLoadStateOption(collectionName))
	if err != nil {
		return fmt.Errorf("[loadCollection] GetLoadState failed, %w", err)
	}

	switch stat.State {
	case mentity.LoadStateNotLoad:
		task, err := cli.LoadCollection(ctx, client.NewLoadCollectionOption(collectionName))
		if err != nil {
			return fmt.Errorf("[loadCollection] LoadCollection failed, %w", err)
		}
		if err = task.Await(ctx); err != nil {
			return fmt.Errorf("[loadCollection] await failed, %w", err)
		}
	case mentity.LoadStateLoaded:
		// do nothing
	default:
		return fmt.Errorf("[loadCollection] load state unexpected, state=%d", stat)
	}

	return nil
}

func (m *milvusManager) convertFields(fields []*searchstore.Field) ([]*mentity.Field, error) {
	var foundID, foundCreatorID bool
	resp := make([]*mentity.Field, 0, len(fields))
	for _, f := range fields {
		switch f.Name {
		case searchstore.FieldID:
			foundID = true
		case searchstore.FieldCreatorID:
			foundCreatorID = true
		default:
		}

		if f.Indexing {
			if f.Type != searchstore.FieldTypeText {
				return nil, fmt.Errorf("[convertFields] milvus only support text field indexing, field=%s, type=%d", f.Name, f.Type)
			}
			// indexing 时只有 content 存储原文
			if f.Name == searchstore.FieldTextContent {
				resp = append(resp, mentity.NewField().
					WithName(f.Name).
					WithDescription(f.Description).
					WithIsPrimaryKey(f.IsPrimary).
					WithNullable(f.Nullable).
					WithDataType(mentity.FieldTypeVarChar).
					WithMaxLength(65535))
			}
			resp = append(resp, mentity.NewField().
				WithName(denseFieldName(f.Name)).
				WithDataType(mentity.FieldTypeFloatVector).
				WithDim(m.config.Embedding.Dimensions()))
			if m.config.Embedding.SupportStatus() == embedding.SupportDenseAndSparse {
				resp = append(resp, mentity.NewField().
					WithName(sparseFieldName(f.Name)).
					WithDataType(mentity.FieldTypeSparseVector))
			}
		} else {
			mf := mentity.NewField().
				WithName(f.Name).
				WithDescription(f.Description).
				WithIsPrimaryKey(f.IsPrimary).
				WithNullable(f.Nullable)
			typ, err := convertFieldType(f.Type)
			if err != nil {
				return nil, err
			}
			mf.WithDataType(typ)
			if typ == mentity.FieldTypeVarChar {
				mf.WithMaxLength(65535)
			} else if typ == mentity.FieldTypeFloatVector {
				mf.WithDim(m.config.Embedding.Dimensions())
			}
			resp = append(resp, mf)
		}
	}

	if !foundID {
		resp = append(resp, mentity.NewField().
			WithName(searchstore.FieldID).
			WithDataType(mentity.FieldTypeInt64).
			WithIsPrimaryKey(true).
			WithNullable(false))
	}

	if !foundCreatorID {
		resp = append(resp, mentity.NewField().
			WithName(searchstore.FieldCreatorID).
			WithDataType(mentity.FieldTypeInt64).
			WithNullable(false))
	}

	return resp, nil
}

func (m *milvusManager) GetEmbedding() embedding.Embedder {
	return m.config.Embedding
}
