package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"sync"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esutil"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/create"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/delete"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/exists"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
	"golang.org/x/sync/errgroup"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
)

type Config struct {
	Client *elasticsearch.Client
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
	}

	switch document.Type {
	case entity.DocumentTypeText:
		typeMapping.Properties[fieldTextContent] = types.NewTextProperty()
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
										fieldDocumentID: stringifyDocumentIDs(documentIDs),
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

				resp, err := search.NewSearchFunc(cli)().Index(e.indexName(knowledgeID)).Request(sr).Do(ctx)
				if err != nil {
					return err
				}

				rs := make([]*knowledge.RetrieveSlice, 0, len(resp.Hits.Hits))
				for _, hit := range resp.Hits.Hits {
					s := &entity.Slice{}
					if hit.Id_ != nil {
						s.ID, err = strconv.ParseInt(*hit.Id_, 10, 64)
						if err != nil {
							return err
						}
					}

					var src map[string]any
					if err = json.Unmarshal(hit.Source_, &src); err != nil {
						return err
					}
					for field, val := range src {
						switch field {
						case fieldDocumentID:
							did, ok := val.(int64)
							if !ok {
								return fmt.Errorf("[Retrieve] document_id type assertion failed, val=%v", val)
							}
							s.DocumentID = did

						case fieldCreatorID:
							cid, ok := val.(int64)
							if !ok {
								return fmt.Errorf("[Retrieve] creator_id type assertion failed, val=%v", val)
							}
							s.CreatorID = cid

						case fieldTextContent:
							content, ok := val.(string)
							if !ok {
								return fmt.Errorf("[Retrieve] content type assertion failed, val=%v", val)
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

func (e *es) GetType() searchstore.Type {
	return searchstore.TypeTextStore
}

func (e *es) indexName(knowledgeID int64) string {
	return fmt.Sprintf("%s%d", indexPrefix, knowledgeID)
}
