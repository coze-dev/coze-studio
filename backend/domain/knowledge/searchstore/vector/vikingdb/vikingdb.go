package vikingdb

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/volcengine/volc-sdk-golang/service/vikingdb"
	"golang.org/x/sync/errgroup"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	vkcontract "code.byted.org/flow/opencoze/backend/infra/contract/vikingdb"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Service vkcontract.Service

	IndexType string // default HNSW
	Distance  string // default L2
	Quant     string // default Float
}

func NewSearchStore(config *Config) searchstore.SearchStore {
	if config.IndexType == "" {
		config.IndexType = vikingdb.HNSW
	}
	if config.Distance == "" {
		config.Distance = vikingdb.L2
	}
	if config.Quant == "" {
		config.Quant = vikingdb.Float
	}

	return &vikingDBVectorstore{
		cfg: config,
		svc: config.Service,
	}
}

type vikingDBVectorstore struct {
	cfg *Config
	svc *vikingdb.VikingDBService
	// TODO: 只有 index 重建，没有 collection 重建，可以 cache 下 collection 减少重复获取
}

func (v *vikingDBVectorstore) GetType() searchstore.Type {
	return searchstore.TypeVectorStore
}

func (v *vikingDBVectorstore) Store(ctx context.Context, req *searchstore.StoreRequest) error {
	collectionName := v.getCollectionName(req.KnowledgeID)
	collection, err := v.svc.GetCollection(collectionName)
	if err != nil {
		return fmt.Errorf("[Store] GetCollection failed, %w", err)
	}

	// check req
	indexingFields := make(map[string]struct{})
	if req.DocumentType == entity.DocumentTypeTable {
		if req.TableColumns == nil {
			return fmt.Errorf("[Store] table schema not provided")
		}
		for _, col := range req.TableColumns {
			if col.Indexing {
				indexingFields[col.Name] = struct{}{}
			}
		}
	}

	for _, sPart := range slices.SplitSlice(req.Slices, maxBatchSize) {
		vkData := make([]vikingdb.Data, 0, len(sPart))
		for _, slice := range sPart {
			fields := map[string]interface{}{
				vikingDBFieldID:         slice.ID,
				vikingDBFieldCreatorID:  req.CreatorID,
				vikingDBFieldDocumentID: req.DocumentID,
			}

			switch req.DocumentType {
			case entity.DocumentTypeText:
				fields[vikingDBFieldTextContent] = slice.PlainText

			case entity.DocumentTypeImage:
				// TODO: tos://{bucket}/{object_key} / base64://{encoding}
				// TODO: 确认下现在的图片知识库是图片向量化还是识图后文字向量化
				return fmt.Errorf("[Store] image store not support")
			default:
				return fmt.Errorf("[Store] document type not support, type=%d", req.DocumentType)
			}

			if err = collection.UpsertData(vkData); err != nil {
				return err
			}
		}
	}

	return nil
}

func (v *vikingDBVectorstore) Retrieve(ctx context.Context, req *searchstore.RetrieveRequest) ([]*knowledge.RetrieveSlice, error) {
	// TODO: 图片模态尚未支持传入
	var (
		mu   = sync.Mutex{}
		aggr []*knowledge.RetrieveSlice
	)

	eg, ctx := errgroup.WithContext(ctx)

	for kid, info := range req.KnowledgeInfoMap {
		knowledgeID := kid
		documentIDs := info.DocumentIDs
		documentType := info.DocumentType

		eg.Go(func() error {
			defer goutil.Recovery(ctx)

			var ss []*knowledge.RetrieveSlice
			switch documentType {
			case entity.DocumentTypeText:
				collectionName := v.getCollectionName(knowledgeID)
				index, err := v.svc.GetIndex(collectionName, indexName)
				if err != nil {
					return fmt.Errorf("[Retrieve] GetIndex failed, %w", err)
				}
				searchOption := vikingdb.NewSearchOptions().SetText(req.Query).SetRetry(true)
				if req.TopK != nil {
					searchOption.SetLimit(*req.TopK)
				}
				if req.CreatorID != nil {
					searchOption.SetPartition(strconv.FormatInt(*req.CreatorID, 10))
				}
				if req.FilterDSL != nil {
					searchOption.SetFilter(req.FilterDSL)
				}

				// TODO: add document id filter
				_ = documentIDs

				data, err := index.SearchWithMultiModal(searchOption)
				if err != nil {
					return err
				}

				ss = make([]*knowledge.RetrieveSlice, 0, len(data))
				for _, d := range data {
					slice := &entity.Slice{
						Info: common.Info{
							ID: d.Fields[vikingDBFieldID].(int64),
						},
						KnowledgeID: 0, // TODO
						DocumentID:  d.Fields[vikingDBFieldDocumentID].(int64),
						PlainText:   d.Fields[vikingDBFieldTextContent].(string),
					}
					ss = append(ss, &knowledge.RetrieveSlice{Slice: slice, Score: d.Score})
				}

			default:
				return fmt.Errorf("[Retrieve] document type not support, type=%d", info.DocumentType)
			}

			mu.Lock()
			aggr = append(aggr, ss...)
			mu.Unlock()
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		return nil, err
	}

	sort.Slice(aggr, func(i, j int) bool {
		return aggr[i].Score > aggr[j].Score
	})

	if req.TopK == nil {
		return aggr, nil
	}

	right := min(int(*req.TopK), len(aggr))
	return aggr[:right], nil
}

func (v *vikingDBVectorstore) Create(ctx context.Context, document *entity.Document) error {
	// 外面应该 lock 一下
	collectionName, err := v.createCollection(document)
	if err != nil {
		return err
	}

	if err = v.createIndex(collectionName); err != nil {
		return err
	}

	return nil
}

func (v *vikingDBVectorstore) Drop(ctx context.Context, knowledgeID int64) error {
	// 外面应该 lock 一下
	collectionName := v.getCollectionName(knowledgeID)
	// drop index
	if err := v.dropIndex(collectionName); err != nil {
		return err
	}

	// drop collection
	if err := v.dropCollection(collectionName); err != nil {
		return err
	}

	return nil
}

func (v *vikingDBVectorstore) Delete(ctx context.Context, knowledgeID int64, ids []int64) error {
	collection, err := v.svc.GetCollection(v.getCollectionName(knowledgeID))
	if err != nil {
		return err
	}

	for _, part := range slices.SplitSlice(ids, maxBatchSize) {
		if err = collection.DeleteData(part); err != nil {
			return err
		}
	}

	return nil
}

func (v *vikingDBVectorstore) createCollection(document *entity.Document) (collectionName string, err error) {
	if document.KnowledgeID == 0 {
		return "", fmt.Errorf("[createCollection] knowledge_id not provided")
	}

	collectionName = v.getCollectionName(document.KnowledgeID)

	if _, err = v.svc.GetCollection(collectionName); err != nil {
		//TODO: more graceful
		if !strings.Contains(err.Error(), "1000005") { // not exists
			return "", fmt.Errorf("[createCollection] GetCollection failed, %w", err)
		}
	} else { // created before
		return collectionName, nil
	}

	fields := []vikingdb.Field{
		{
			FieldName:    vikingDBFieldID,
			FieldType:    vikingdb.Int64,
			IsPrimaryKey: true,
		},
		{
			FieldName: vikingDBFieldMetaData,
			FieldType: vikingdb.String,
		},
		{
			FieldName: vikingDBFieldDocumentID,
			FieldType: vikingdb.Int64,
		},
		{
			FieldName: vikingDBFieldCreatorID, // for 仅召回该用户文档
			FieldType: vikingdb.Int64,
		},
	}

	var vectorize []*vikingdb.VectorizeTuple

	switch document.Type {
	case entity.DocumentTypeText:
		// TODO: 目前只处理了文本，chunk 含图文模态是否需要支持?
		fields = append(fields, vikingdb.Field{
			FieldName: vikingDBFieldTextContent,
			FieldType: vikingdb.Text,
		})

		vectorize = []*vikingdb.VectorizeTuple{
			vikingdb.NewVectorizeTuple().
				SetDense(vikingdb.NewVectorizeModelConf().SetTextField(vikingDBFieldTextContent).SetModelName(embeddingModelDoubaoLarge)).
				SetSparse(vikingdb.NewVectorizeModelConf().SetTextField(vikingDBFieldTextContent).SetModelName(embeddingModelBgeM3)),
		}
	case entity.DocumentTypeTable:
		// table plain text 不向量化，只作为返回内容
		fields = append(fields, vikingdb.Field{
			FieldName: vikingDBFieldTextContent,
			FieldType: vikingdb.Text,
		})

		// TODO: dedup 是 viking 要求，table 是否遵循需要确认下，不遵循的话这里要解决冲突问题
		dedupName := make(map[string]struct{})

		for _, column := range document.TableInfo.Columns {
			if _, found := dedupName[column.Name]; found {
				continue
			}

			dedupName[column.Name] = struct{}{}
			fieldName := v.getTableFieldName(column.ID)
			fields = append(fields, vikingdb.Field{
				FieldName:    fieldName,
				FieldType:    vikingdb.Text,
				IsPrimaryKey: false,
			})

			if column.Indexing {
				vectorize = append(vectorize,
					vikingdb.NewVectorizeTuple().
						SetDense(vikingdb.NewVectorizeModelConf().SetTextField(fieldName).SetModelName(embeddingModelDoubaoLarge)).
						SetSparse(vikingdb.NewVectorizeModelConf().SetTextField(fieldName).SetModelName(embeddingModelBgeM3)))
			}
		}
	case entity.DocumentTypeImage:
		fields = append(fields, vikingdb.Field{
			FieldName: vikingDBFieldImageContent,
			FieldType: vikingdb.Image,
		})

		vectorize = []*vikingdb.VectorizeTuple{
			vikingdb.NewVectorizeTuple().
				SetDense(vikingdb.NewVectorizeModelConf().SetImageField(vikingDBFieldImageContent).SetModelName(embeddingModelDoubaoVision)),
		}
	default:
		return "", fmt.Errorf("[createCollection] unsupport document type=%d", document.Type)
	}

	if _, err = v.svc.CreateCollection(collectionName, fields, "", vectorize); err != nil {
		if strings.Contains(err.Error(), "1000004") { // created
			return collectionName, nil
		}
		return "", fmt.Errorf("[createCollection] CreateCollection failed, %w", err)
	}

	return collectionName, nil
}

func (v *vikingDBVectorstore) dropCollection(collectionName string) error {
	return v.svc.DropCollection(collectionName)
}

func (v *vikingDBVectorstore) createIndex(collectionName string) error {
	if _, err := v.svc.GetIndex(collectionName, indexName); err != nil {
		if strings.Contains(err.Error(), "1000008") ||
			strings.Contains(err.Error(), "1000023") {
			return nil
		}
		return fmt.Errorf("[createIndex] GetIndex failed, %w", err)
	}

	vectorIndex := &vikingdb.VectorIndexParams{
		IndexType: v.cfg.IndexType,
		Distance:  v.cfg.Distance,
		Quant:     v.cfg.Quant,
	}

	indexOptions := vikingdb.NewIndexOptions().
		SetVectorIndex(vectorIndex).
		SetPartitionBy(vikingDBFieldCreatorID)

	_, err := v.svc.CreateIndex(collectionName, indexName, indexOptions)
	if err != nil {
		if strings.Contains(err.Error(), "1000007") {
			return nil
		}
		return fmt.Errorf("[createIndex] CreateIndex failed, %w", err)
	}

	return nil
}

func (v *vikingDBVectorstore) dropIndex(collectionName string) error {
	return v.svc.DropIndex(collectionName, indexName)
}

func (v *vikingDBVectorstore) getCollectionName(knowledgeID int64) string {
	return fmt.Sprintf("%s%d", collectionPrefix, knowledgeID)
}

func (v *vikingDBVectorstore) getTableFieldName(colID int64) string {
	return fmt.Sprintf("%s%d", tableFieldPrefix, colID)
}
