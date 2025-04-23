package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"sync"

	"github.com/elastic/go-elasticsearch/v8/esutil"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/create"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/delete"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/exists"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/get"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/operator"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/textquerytype"
	"golang.org/x/sync/errgroup"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type Config struct {
	Client *es8.Client

	// CompactTable 用于控制表格类型知识库的构建与召回, 仅影响新建知识库，已有的知识库会按当时初始化的配置进行处理
	// true: 表格配置中的 indexing 列合为一列进行存储
	// false: 表格配置中的每个 indexing 列分别进行存储，召回 multi_query best match
	// default true
	CompactTable *bool
}

func NewSearchStore(config *Config) searchstore.SearchStore {
	if config.CompactTable == nil {
		config.CompactTable = ptr.Of(true)
	}
	return &es{config: config}
}

type es struct {
	config *Config
}

func (e *es) Create(ctx context.Context, document *entity.Document) error {
	typeMapping := types.TypeMapping{
		Properties: map[string]types.Property{
			fieldKnowledgeID: types.NewLongNumberProperty(),
			fieldDocumentID:  types.NewLongNumberProperty(),
			fieldCreatorID:   types.NewLongNumberProperty(),
		},
		Meta_: map[string]json.RawMessage{},
	}

	switch document.Type {
	case entity.DocumentTypeText:
		typeMapping.Properties[fieldTextContent] = types.NewTextProperty()
	case entity.DocumentTypeTable:
		if e.config.CompactTable != nil && *e.config.CompactTable {
			typeMapping.Properties[fieldTextContent] = types.NewTextProperty()
			typeMapping.Meta_[metaKeyCompactTable] = json.RawMessage("1")
		} else {
			for _, col := range document.TableInfo.Columns {
				if !col.Indexing {
					continue
				}
				typeMapping.Properties[e.tableFieldName(col.ID)] = types.NewTextProperty()
			}
		}
	default:
		return fmt.Errorf("[Create] document type not support, type=%d", document.Type)
	}

	cli := e.config.Client
	index := e.indexName(document.KnowledgeID)
	indexExists, err := exists.NewExistsFunc(cli)(index).Do(ctx)
	if err != nil {
		return err
	}
	if indexExists { // exists
		return nil
	}

	if _, err = create.NewCreateFunc(cli)(index).Request(&create.Request{Mappings: &typeMapping}).Do(ctx); err != nil {
		return err
	}

	return err
}

func (e *es) Drop(ctx context.Context, knowledgeID int64) error {
	cli := e.config.Client
	index := e.indexName(knowledgeID)
	_, err := delete.NewDeleteFunc(cli)(index).Do(ctx)
	return err
}

func (e *es) Store(ctx context.Context, req *searchstore.StoreRequest) error {
	cli := e.config.Client
	index := e.indexName(req.KnowledgeID)

	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Client: cli,
		Index:  index,
	})
	if err != nil {
		return err
	}

	switch req.DocumentType {
	case entity.DocumentTypeText:
		for _, slice := range req.Slices {
			fields := map[string]any{
				fieldKnowledgeID: req.KnowledgeID,
				fieldDocumentID:  req.DocumentID,
				fieldCreatorID:   req.CreatorID,
				fieldTextContent: slice.PlainText,
			}

			b, err := json.Marshal(fields)
			if err != nil {
				return err
			}

			if err = bi.Add(ctx, esutil.BulkIndexerItem{
				Index:      index,
				Action:     "index",
				DocumentID: strconv.FormatInt(slice.ID, 10),
				Body:       bytes.NewReader(b),
			}); err != nil {
				return err
			}
		}

	case entity.DocumentTypeTable:
		desc, err := e.getIndexDesc(ctx, index)
		if err != nil {
			return err
		}

		id2Idx := make(map[int64]int)
		for _, col := range req.TableColumns {
			if col.Indexing {
				id2Idx[col.ID] = len(id2Idx)
			}
		}

		for _, slice := range req.Slices {
			fields := map[string]any{
				fieldKnowledgeID: req.KnowledgeID,
				fieldDocumentID:  req.DocumentID,
				fieldCreatorID:   req.CreatorID,
			}

			if len(slice.RawContent) == 0 || slice.RawContent[0].Type != entity.SliceContentTypeTable || slice.RawContent[0].Table == nil {
				return fmt.Errorf("[Store] slice raw content invalid, slice_id=%d", slice.ID)
			}

			row := slice.RawContent[0].Table
			if desc.EnableCompactTable {
				content := make([]string, len(id2Idx))
				for _, col := range row.Columns {
					if idx, found := id2Idx[col.ColumnID]; found {
						content[idx] = col.GetStringValue()
					}
				}

				b, err := json.Marshal(content)
				if err != nil {
					return err
				}

				fields[fieldTextContent] = string(b)
			} else {
				for _, col := range row.Columns {
					if _, found := id2Idx[col.ColumnID]; found {
						fields[e.tableFieldName(col.ColumnID)] = col.GetStringValue()
					}
				}
			}

			b, err := json.Marshal(fields)
			if err != nil {
				return err
			}

			if err = bi.Add(ctx, esutil.BulkIndexerItem{
				Index:      index,
				Action:     "index",
				DocumentID: strconv.FormatInt(slice.ID, 10),
				Body:       bytes.NewReader(b),
			}); err != nil {
				return err
			}
		}

	default:
		return fmt.Errorf("[Store] document type not support, type=%d", req.DocumentType)
	}

	return bi.Close(ctx)
}

func (e *es) Delete(ctx context.Context, knowledgeID int64, slicesIDs []int64) error {
	cli := e.config.Client
	index := e.indexName(knowledgeID)

	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Client: cli,
		Index:  index,
	})
	if err != nil {
		return err
	}

	for _, id := range slicesIDs {
		if err = bi.Add(ctx, esutil.BulkIndexerItem{
			Index:      index,
			Action:     "delete",
			DocumentID: strconv.FormatInt(id, 10),
		}); err != nil {
			return err
		}
	}

	return bi.Close(ctx)
}

func (e *es) Retrieve(ctx context.Context, req *searchstore.RetrieveRequest) ([]*knowledge.RetrieveSlice, error) {
	cli := e.config.Client
	var (
		mu     = sync.Mutex{}
		result []*knowledge.RetrieveSlice
		topK   = 10
	)
	if req.TopK != nil {
		topK = int(*req.TopK)
	}

	eg, ctx := errgroup.WithContext(ctx)

	for kid, info := range req.KnowledgeInfoMap {
		knowledgeID := kid
		documentIDs := info.DocumentIDs
		sDocumentIDs := stringifyDocumentIDs(documentIDs)
		index := e.indexName(knowledgeID)
		desc, err := e.getIndexDesc(ctx, index)
		if err != nil {
			return nil, err
		}

		var searchTableColumns []string
		for _, col := range info.TableColumns {
			fieldName := e.tableFieldName(col.ID)
			if _, found := desc.Properties[fieldName]; found && col.Indexing {
				searchTableColumns = append(searchTableColumns, fieldName)
			}
		}

		switch info.DocumentType {
		case entity.DocumentTypeText:
			eg.Go(func() error {
				defer goutil.Recovery(ctx)

				query := &types.Query{
					Bool: &types.BoolQuery{
						Must: []types.Query{
							{
								Match: map[string]types.MatchQuery{
									fieldTextContent: {Query: req.Query},
								},
							},
							{
								Terms: &types.TermsQuery{
									TermsQuery: map[string]types.TermsQueryField{
										fieldDocumentID: sDocumentIDs,
									},
								},
							},
						},
					},
				}
				if req.CreatorID != nil {
					query.Bool.Must = append(query.Bool.Must, types.Query{
						Term: map[string]types.TermQuery{
							fieldCreatorID: {Value: strconv.FormatInt(*req.CreatorID, 10)},
						},
					})
				}

				sr := &search.Request{
					Query: query,
					Size:  &topK,
				}
				if req.MinScore != nil {
					sr.MinScore = (*types.Float64)(req.MinScore)
				}

				resp, err := search.NewSearchFunc(cli)().Index(index).Request(sr).Do(ctx)
				if err != nil {
					return err
				}

				rs, err := e.parseSearchResult(resp)
				if err != nil {
					return err
				}

				mu.Lock()
				result = append(result, rs...)
				mu.Unlock()

				return nil
			})

		case entity.DocumentTypeTable:
			eg.Go(func() error {
				defer goutil.Recovery(ctx)

				query := &types.Query{
					Bool: &types.BoolQuery{
						Must: []types.Query{
							{
								Terms: &types.TermsQuery{
									TermsQuery: map[string]types.TermsQueryField{
										fieldDocumentID: sDocumentIDs,
									},
								},
							},
						},
					},
				}

				if desc.EnableCompactTable {
					query.Bool.Must = append(query.Bool.Must, types.Query{
						Match: map[string]types.MatchQuery{
							fieldTextContent: {Query: req.Query},
						},
					})
				} else {
					query.Bool.Must = append(query.Bool.Must, types.Query{
						MultiMatch: &types.MultiMatchQuery{
							Fields:   searchTableColumns,
							Operator: &operator.Or,
							Query:    req.Query,
							Type:     &textquerytype.Bestfields,
						},
					})
				}

				if req.CreatorID != nil {
					query.Bool.Must = append(query.Bool.Must, types.Query{
						Term: map[string]types.TermQuery{
							fieldCreatorID: {Value: strconv.FormatInt(*req.CreatorID, 10)},
						},
					})
				}

				sr := &search.Request{
					Query: query,
					Size:  &topK,
				}
				if req.MinScore != nil {
					sr.MinScore = (*types.Float64)(req.MinScore)
				}

				resp, err := search.NewSearchFunc(cli)().Index(index).Request(sr).Do(ctx)
				if err != nil {
					return err
				}

				rs, err := e.parseSearchResult(resp)
				if err != nil {
					return err
				}

				mu.Lock()
				result = append(result, rs...)
				mu.Unlock()

				return nil
			})
		default:
			return nil, fmt.Errorf("[Store] document type not support, type=%d", info.DocumentType)
		}
	}

	if err := eg.Wait(); err != nil {
		return nil, err
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Score > result[j].Score
	})

	r := min(topK, len(result))
	return result[:r], nil
}

func (e *es) parseSearchResult(resp *search.Response) (rs []*knowledge.RetrieveSlice, err error) {
	rs = make([]*knowledge.RetrieveSlice, 0, len(resp.Hits.Hits))
	for _, hit := range resp.Hits.Hits {
		s := &entity.Slice{}
		if hit.Id_ != nil {
			s.ID, err = strconv.ParseInt(*hit.Id_, 10, 64)
			if err != nil {
				return nil, err
			}
		}

		var src map[string]any
		if err = json.Unmarshal(hit.Source_, &src); err != nil {
			return nil, err
		}
		for field, val := range src {
			switch field {
			case fieldDocumentID:
				did, ok := val.(int64)
				if !ok {
					return nil, fmt.Errorf("[parseSearchResult] document_id type assertion failed, val=%v", val)
				}
				s.DocumentID = did

			case fieldCreatorID:
				cid, ok := val.(int64)
				if !ok {
					return nil, fmt.Errorf("[parseSearchResult] creator_id type assertion failed, val=%v", val)
				}
				s.CreatorID = cid

			case fieldTextContent:
				content, ok := val.(string)
				if !ok {
					return nil, fmt.Errorf("[parseSearchResult] content type assertion failed, val=%v", val)
				}
				s.PlainText = content

			default:

			}
		}

		r := &knowledge.RetrieveSlice{Slice: s, Score: 0}
		if hit.Score_ != nil {
			r.Score = float64(*hit.Score_)
		}

		rs = append(rs, r)
	}

	return rs, nil
}

func (e *es) GetType() searchstore.Type {
	return searchstore.TypeTextStore
}

func (e *es) indexName(knowledgeID int64) string {
	return fmt.Sprintf("%s%d", indexPrefix, knowledgeID)
}

func (e *es) tableFieldName(id int64) string {
	return fmt.Sprintf("%s%d", fieldPrefixTableColumn, id)
}

func (e *es) getIndexDesc(ctx context.Context, index string) (*indexDesc, error) {
	indexInfo, err := get.NewGetFunc(e.config.Client)(index).Do(ctx)
	if err != nil {
		return nil, err
	}

	stat, found := indexInfo[index]
	if !found {
		return nil, fmt.Errorf("[getIndexDesc] knowledge store index not found")
	}

	td := &indexDesc{
		Properties: stat.Mappings.Properties,
	}

	if stat.Mappings.Meta_ != nil {
		_, td.EnableCompactTable = stat.Mappings.Meta_[metaKeyCompactTable]
	}

	return td, nil
}
