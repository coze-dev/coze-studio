/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package milvus

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"sort"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"
	"github.com/milvus-io/milvus/client/v2/column"
	mentity "github.com/milvus-io/milvus/client/v2/entity"
	mindex "github.com/milvus-io/milvus/client/v2/index"
	client "github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/slongfield/pyfmt"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type milvusSearchStore struct {
	config *ManagerConfig

	collectionName string
}

func (m *milvusSearchStore) Store(ctx context.Context, docs []*schema.Document, opts ...indexer.Option) (ids []string, err error) {
	if len(docs) == 0 {
		return nil, nil
	}
	implSpecOptions := indexer.GetImplSpecificOptions(&searchstore.IndexerOptions{}, opts...)
	defer func() {
		if err != nil {
			if implSpecOptions.ProgressBar != nil {
				implSpecOptions.ProgressBar.ReportError(err)
			}
		}
	}()
	indexingFields := make(sets.Set[string])
	for _, field := range implSpecOptions.IndexingFields {
		indexingFields[field] = struct{}{}
	}

	if implSpecOptions.Partition != nil {
		partition := *implSpecOptions.Partition
		hasPartition, err := m.config.Client.HasPartition(ctx, client.NewHasPartitionOption(m.collectionName, partition))
		if err != nil {
			return nil, fmt.Errorf("[Store] HasPartition failed, %w", err)
		}
		if !hasPartition {
			if err = m.config.Client.CreatePartition(ctx, client.NewCreatePartitionOption(m.collectionName, partition)); err != nil {
				return nil, fmt.Errorf("[Store] CreatePartition failed, %w", err)
			}
		}
	}

	for _, part := range slices.Chunks(docs, batchSize) {
		columns, err := m.documents2Columns(ctx, part, indexingFields)
		if err != nil {
			return nil, err
		}

		createReq := client.NewColumnBasedInsertOption(m.collectionName, columns...)
		if implSpecOptions.Partition != nil {
			createReq.WithPartition(*implSpecOptions.Partition)
		}

		result, err := m.config.Client.Upsert(ctx, createReq)
		if err != nil {
			return nil, fmt.Errorf("[Store] upsert failed, %w", err)
		}

		partIDs := result.IDs
		for i := 0; i < partIDs.Len(); i++ {
			var sid string
			if partIDs.Type() == mentity.FieldTypeInt64 {
				id, err := partIDs.GetAsInt64(i)
				if err != nil {
					return nil, err
				}
				sid = strconv.FormatInt(id, 10)
			} else {
				sid, err = partIDs.GetAsString(i)
				if err != nil {
					return nil, err
				}
			}
			ids = append(ids, sid)
		}
		if implSpecOptions.ProgressBar != nil {
			if err = implSpecOptions.ProgressBar.AddN(len(part)); err != nil {
				return nil, err
			}
		}
	}

	return ids, nil
}

func (m *milvusSearchStore) Retrieve(ctx context.Context, query string, opts ...retriever.Option) ([]*schema.Document, error) {
	cli := m.config.Client
	emb := m.config.Embedding
	options := retriever.GetCommonOptions(&retriever.Options{TopK: ptr.Of(topK)}, opts...)
	implSpecOptions := retriever.GetImplSpecificOptions(&searchstore.RetrieverOptions{}, opts...)

	desc, err := cli.DescribeCollection(ctx, client.NewDescribeCollectionOption(m.collectionName))
	if err != nil {
		return nil, err
	}

	var (
		dense  [][]float64
		sparse []map[int]float64
		expr   string
		result []client.ResultSet

		fields       = desc.Schema.Fields
		outputFields []string
		enableSparse = m.enableSparse(fields)
	)

	if options.DSLInfo != nil {
		expr, err = m.dsl2Expr(options.DSLInfo)
		if err != nil {
			return nil, err
		}
	}

	if enableSparse {
		dense, sparse, err = emb.EmbedStringsHybrid(ctx, []string{query})
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] EmbedStringsHybrid failed, %w", err)
		}
	} else {
		dense, err = emb.EmbedStrings(ctx, []string{query})
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] EmbedStrings failed, %w", err)
		}
	}

	dv := convertMilvusDenseVector(dense)
	sv, err := convertMilvusSparseVector(sparse)
	if err != nil {
		return nil, err
	}

	for _, field := range fields {
		outputFields = append(outputFields, field.Name)
	}

	var scoreNormType *mindex.MetricType

	if enableSparse {
		var annRequests []*client.AnnRequest
		for _, field := range fields {
			var (
				vector      []mentity.Vector
				metricsType mindex.MetricType
			)
			if field.DataType == mentity.FieldTypeFloatVector {
				vector = dv
				metricsType, err = m.getIndexMetricsType(ctx, denseIndexName(field.Name))
			} else if field.DataType == mentity.FieldTypeSparseVector {
				vector = sv
				metricsType, err = m.getIndexMetricsType(ctx, sparseIndexName(field.Name))
			}
			if err != nil {
				return nil, err
			}
			annRequests = append(annRequests,
				client.NewAnnRequest(field.Name, ptr.From(options.TopK), vector...).
					WithSearchParam(mindex.MetricTypeKey, string(metricsType)).
					WithFilter(expr),
			)
		}

		searchOption := client.NewHybridSearchOption(m.collectionName, ptr.From(options.TopK), annRequests...).
			WithPartitons(implSpecOptions.Partitions...).
			WithReranker(client.NewRRFReranker()).
			WithOutputFields(outputFields...)

		result, err = cli.HybridSearch(ctx, searchOption)
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] HybridSearch failed, %w", err)
		}
	} else {
		indexes, err := cli.ListIndexes(ctx, client.NewListIndexOption(m.collectionName))
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] ListIndexes failed, %w", err)
		}
		if len(indexes) != 1 {
			return nil, fmt.Errorf("[Retrieve] restrict single index ann search, but got %d, collection=%s",
				len(indexes), m.collectionName)
		}
		metricsType, err := m.getIndexMetricsType(ctx, indexes[0])
		if err != nil {
			return nil, err
		}
		scoreNormType = &metricsType
		searchOption := client.NewSearchOption(m.collectionName, ptr.From(options.TopK), dv).
			WithPartitions(implSpecOptions.Partitions...).
			WithFilter(expr).
			WithOutputFields(outputFields...).
			WithSearchParam(mindex.MetricTypeKey, string(metricsType))
		result, err = cli.Search(ctx, searchOption)
		if err != nil {
			return nil, fmt.Errorf("[Retrieve] Search failed, %w", err)
		}
	}

	docs, err := m.resultSet2Document(result, scoreNormType)
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] resultSet2Document failed, %w", err)
	}

	return docs, nil
}

func (m *milvusSearchStore) Delete(ctx context.Context, ids []string) error {
	int64IDs := make([]int64, 0, len(ids))
	for _, sid := range ids {
		id, err := strconv.ParseInt(sid, 10, 64)
		if err != nil {
			return err
		}
		int64IDs = append(int64IDs, id)
	}
	_, err := m.config.Client.Delete(ctx,
		client.NewDeleteOption(m.collectionName).WithInt64IDs(searchstore.FieldID, int64IDs))

	return err
}

func (m *milvusSearchStore) documents2Columns(ctx context.Context, docs []*schema.Document, indexingFields sets.Set[string]) (
	cols []column.Column, err error) {

	var (
		ids           []int64
		contents      []string
		creatorIDs    []int64
		emptyContents = true
	)

	colMapping := map[string]any{}
	colTypeMapping := map[string]searchstore.FieldType{
		searchstore.FieldID:          searchstore.FieldTypeInt64,
		searchstore.FieldCreatorID:   searchstore.FieldTypeInt64,
		searchstore.FieldTextContent: searchstore.FieldTypeText,
	}
	for _, doc := range docs {
		if doc.MetaData == nil {
			return nil, fmt.Errorf("[documents2Columns] meta data is nil")
		}

		id, err := strconv.ParseInt(doc.ID, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("[documents2Columns] parse id failed, %w", err)
		}
		ids = append(ids, id)
		contents = append(contents, doc.Content)
		if doc.Content != "" {
			emptyContents = false
		}

		creatorID, err := document.GetDocumentCreatorID(doc)
		if err != nil {
			return nil, fmt.Errorf("[documents2Columns] creator_id not found or type invalid., %w", err)
		}
		creatorIDs = append(creatorIDs, creatorID)

		ext, ok := doc.MetaData[document.MetaDataKeyExternalStorage].(map[string]any)
		if !ok {
			continue
		}

		for field := range ext {
			val := ext[field]
			container := colMapping[field]
			switch t := val.(type) {
			case uint, uint8, uint16, uint32, uint64, uintptr:
				var c []int64
				if container == nil {
					colTypeMapping[field] = searchstore.FieldTypeInt64
				} else {
					c, ok = container.([]int64)
					if !ok {
						return nil, fmt.Errorf("[documents2Columns] container type not int64")
					}
				}
				c = append(c, int64(reflect.ValueOf(t).Uint()))
				colMapping[field] = c
			case int, int8, int16, int32, int64:
				var c []int64
				if container == nil {
					colTypeMapping[field] = searchstore.FieldTypeInt64
				} else {
					c, ok = container.([]int64)
					if !ok {
						return nil, fmt.Errorf("[documents2Columns] container type not int64")
					}
				}
				c = append(c, reflect.ValueOf(t).Int())
				colMapping[field] = c
			case string:
				var c []string
				if container == nil {
					colTypeMapping[field] = searchstore.FieldTypeText
				} else {
					c, ok = container.([]string)
					if !ok {
						return nil, fmt.Errorf("[documents2Columns] container type not int64")
					}
				}
				c = append(c, t)
				colMapping[field] = c
			case []float64:
				var c [][]float64
				if container == nil {
					container = c
					colTypeMapping[field] = searchstore.FieldTypeDenseVector
				} else {
					c, ok = container.([][]float64)
					if !ok {
						return nil, fmt.Errorf("[documents2Columns] container type not int64")
					}
				}
				c = append(c, t)
				colMapping[field] = c
			case map[int]float64:
				var c []map[int]float64
				if container == nil {
					container = c
					colTypeMapping[field] = searchstore.FieldTypeSparseVector
				} else {
					c, ok = container.([]map[int]float64)
					if !ok {
						return nil, fmt.Errorf("[documents2Columns] container type not int64")
					}
				}
				c = append(c, t)
				colMapping[field] = c
			default:
				return nil, fmt.Errorf("[documents2Columns] val type not support, val=%v", val)
			}
		}
	}

	colMapping[searchstore.FieldID] = ids
	colMapping[searchstore.FieldCreatorID] = creatorIDs
	colMapping[searchstore.FieldTextContent] = contents

	for fieldName, container := range colMapping {
		colType := colTypeMapping[fieldName]
		switch colType {
		case searchstore.FieldTypeInt64:
			c, ok := container.([]int64)
			if !ok {
				return nil, fmt.Errorf("[documents2Columns] container type not int64")
			}
			cols = append(cols, column.NewColumnInt64(fieldName, c))
		case searchstore.FieldTypeText:
			c, ok := container.([]string)
			if !ok {
				return nil, fmt.Errorf("[documents2Columns] container type not string")
			}

			if _, indexing := indexingFields[fieldName]; indexing {
				if fieldName == searchstore.FieldTextContent && !emptyContents {
					cols = append(cols, column.NewColumnVarChar(fieldName, c))
				}

				var (
					emb    = m.config.Embedding
					dense  [][]float64
					sparse []map[int]float64
				)
				if emb.SupportStatus() == embedding.SupportDenseAndSparse {
					dense, sparse, err = emb.EmbedStringsHybrid(ctx, c)
				} else {
					dense, err = emb.EmbedStrings(ctx, c)
				}
				if err != nil {
					return nil, fmt.Errorf("[slices2Columns] embed failed, %w", err)
				}

				cols = append(cols, column.NewColumnFloatVector(denseFieldName(fieldName), int(emb.Dimensions()), convertDense(dense)))

				if emb.SupportStatus() == embedding.SupportDenseAndSparse {
					s, err := convertSparse(sparse)
					if err != nil {
						return nil, err
					}
					cols = append(cols, column.NewColumnSparseVectors(sparseFieldName(fieldName), s))
				}
			} else {
				cols = append(cols, column.NewColumnVarChar(fieldName, c))
			}

		case searchstore.FieldTypeDenseVector:
			c, ok := container.([][]float64)
			if !ok {
				return nil, fmt.Errorf("[documents2Columns] container type not []float64")
			}
			cols = append(cols, column.NewColumnFloatVector(fieldName, int(m.config.Embedding.Dimensions()), convertDense(c)))
		case searchstore.FieldTypeSparseVector:
			c, ok := container.([]map[int]float64)
			if !ok {
				return nil, fmt.Errorf("[documents2Columns] container type not map[int]float64")
			}
			sparse, err := convertSparse(c)
			if err != nil {
				return nil, err
			}
			cols = append(cols, column.NewColumnSparseVectors(fieldName, sparse))
		default:
			return nil, fmt.Errorf("[documents2Columns] column type not support, type=%d", colType)
		}
	}

	return cols, nil
}

func (m *milvusSearchStore) resultSet2Document(result []client.ResultSet, metricsType *mindex.MetricType) (docs []*schema.Document, err error) {
	docs = make([]*schema.Document, 0, len(result))
	minScore := math.MaxFloat64
	maxScore := 0.0

	for _, r := range result {
		for i := 0; i < r.ResultCount; i++ {
			ext := make(map[string]any)
			doc := &schema.Document{MetaData: map[string]any{document.MetaDataKeyExternalStorage: ext}}
			score := float64(r.Scores[i])
			minScore = min(minScore, score)
			maxScore = max(maxScore, score)
			doc.WithScore(score)

			for _, field := range r.Fields {
				switch field.Name() {
				case searchstore.FieldID:
					id, err := field.GetAsInt64(i)
					if err != nil {
						return nil, err
					}
					doc.ID = strconv.FormatInt(id, 10)
				case searchstore.FieldTextContent:
					doc.Content, err = field.GetAsString(i)
				case searchstore.FieldCreatorID:
					doc.MetaData[document.MetaDataKeyCreatorID], err = field.GetAsInt64(i)
				default:
					ext[field.Name()], err = field.Get(i)
				}
				if err != nil {
					return nil, err
				}
			}

			docs = append(docs, doc)
		}
	}

	sort.Slice(docs, func(i, j int) bool {
		return docs[i].Score() > docs[j].Score()
	})

	// norm score
	if (m.config.EnableHybrid != nil && *m.config.EnableHybrid) || metricsType == nil {
		return docs, nil
	}

	switch *metricsType {
	case mentity.L2:
		base := maxScore - minScore
		for i := range docs {
			if base == 0 {
				docs[i].WithScore(1.0)
			} else {
				docs[i].WithScore(1.0 - (docs[i].Score()-minScore)/base)
			}
		}
		docs = slices.Reverse(docs)
	case mentity.IP, mentity.COSINE:
		for i := range docs {
			docs[i].WithScore((docs[i].Score() + 1) / 2)
		}
	default:

	}

	return docs, nil
}

func (m *milvusSearchStore) enableSparse(fields []*mentity.Field) bool {
	found := false
	for _, field := range fields {
		if field.DataType == mentity.FieldTypeSparseVector {
			found = true
			break
		}
	}

	return found && *m.config.EnableHybrid && m.config.Embedding.SupportStatus() == embedding.SupportDenseAndSparse
}

func (m *milvusSearchStore) dsl2Expr(src map[string]interface{}) (string, error) {
	if src == nil {
		return "", nil
	}

	dsl, err := searchstore.LoadDSL(src)
	if err != nil {
		return "", err
	}

	var travDSL func(dsl *searchstore.DSL) (string, error)
	travDSL = func(dsl *searchstore.DSL) (string, error) {
		kv := map[string]interface{}{
			"field": dsl.Field,
			"val":   dsl.Value,
		}

		switch dsl.Op {
		case searchstore.OpEq:
			return pyfmt.Fmt("{field} == {val}", kv)
		case searchstore.OpNe:
			return pyfmt.Fmt("{field} != {val}", kv)
		case searchstore.OpLike:
			return pyfmt.Fmt("{field} LIKE {val}", kv)
		case searchstore.OpIn:
			b, err := json.Marshal(dsl.Value)
			if err != nil {
				return "", err
			}
			kv["val"] = string(b)
			return pyfmt.Fmt("{field} IN {val}", kv)
		case searchstore.OpAnd, searchstore.OpOr:
			sub, ok := dsl.Value.([]*searchstore.DSL)
			if !ok {
				return "", fmt.Errorf("[dsl2Expr] invalid sub dsl")
			}
			var items []string
			for _, s := range sub {
				str, err := travDSL(s)
				if err != nil {
					return "", fmt.Errorf("[dsl2Expr] parse sub failed, %w", err)
				}
				items = append(items, str)
			}

			if dsl.Op == searchstore.OpAnd {
				return strings.Join(items, " AND "), nil
			} else {
				return strings.Join(items, " OR "), nil
			}
		default:
			return "", fmt.Errorf("[dsl2Expr] unknown op type=%s", dsl.Op)
		}
	}

	return travDSL(dsl)
}

func (m *milvusSearchStore) getIndexMetricsType(ctx context.Context, indexName string) (mindex.MetricType, error) {
	index, err := m.config.Client.DescribeIndex(ctx, client.NewDescribeIndexOption(m.collectionName, indexName))
	if err != nil {
		return "", fmt.Errorf("[getIndexMetricsType] describe index failed, collection=%s, index=%s, %w",
			m.collectionName, indexName, err)
	}

	typ, found := index.Params()[mindex.MetricTypeKey]
	if !found { // unexpected
		return "", fmt.Errorf("[getIndexMetricsType] invalid index params, collection=%s, index=%s", m.collectionName, indexName)
	}

	return mindex.MetricType(typ), nil
}
