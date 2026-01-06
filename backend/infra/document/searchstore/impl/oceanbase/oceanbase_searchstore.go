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

package oceanbase

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"time"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/oceanbase"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type oceanbaseSearchStore struct {
	manager        *oceanbaseManager
	collectionName string
	tableName      string
}

func (s *oceanbaseSearchStore) Store(ctx context.Context, docs []*schema.Document, opts ...indexer.Option) ([]string, error) {
	if len(docs) == 0 {
		return []string{}, nil
	}

	startTime := time.Now()
	defer func() {
		logs.CtxInfof(ctx, "Store operation completed in %v for %d documents",
			time.Since(startTime), len(docs))
	}()

	var ids []string
	var vectorDataList []*vectorData

	for _, doc := range docs {
		content := ExtractContent(doc)
		if content == "" {
			logs.CtxWarnf(ctx, "Document %s has no content, skipping", doc.ID)
			continue
		}

		embeddings, err := s.manager.config.Embedding.EmbedStrings(ctx, []string{content})
		if err != nil {
			return nil, fmt.Errorf("[Store] failed to embed document: %w", err)
		}

		if len(embeddings) == 0 {
			logs.CtxWarnf(ctx, "Failed to generate embedding for document %s", doc.ID)
			continue
		}

		metadata := BuildMetadata(doc)
		metadataJSON, err := MetadataToJSON(metadata)
		if err != nil {
			return nil, fmt.Errorf("[Store] failed to marshal metadata: %w", err)
		}

		vectorData := &vectorData{
			VectorID:  doc.ID,
			Content:   content,
			Metadata:  metadataJSON,
			Embedding: ConvertToFloat32(embeddings[0]),
		}

		vectorDataList = append(vectorDataList, vectorData)
		ids = append(ids, doc.ID)
	}

	if len(vectorDataList) > 0 {
		if err := s.batchInsertWithRetry(ctx, vectorDataList); err != nil {
			return nil, fmt.Errorf("[Store] failed to batch insert vector data: %w", err)
		}
	}

	logs.CtxInfof(ctx, "Stored %d documents to OceanBase collection: %s", len(ids), s.collectionName)
	return ids, nil
}

func (s *oceanbaseSearchStore) Retrieve(ctx context.Context, query string, opts ...retriever.Option) ([]*schema.Document, error) {
	startTime := time.Now()
	defer func() {
		logs.CtxInfof(ctx, "Retrieve operation completed in %v", time.Since(startTime))
	}()

	options := retriever.GetCommonOptions(&retriever.Options{TopK: ptr.Of(10)}, opts...)

	embeddings, err := s.manager.config.Embedding.EmbedStrings(ctx, []string{query})
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] failed to embed query: %w", err)
	}

	if len(embeddings) == 0 {
		return nil, fmt.Errorf("[Retrieve] failed to generate embedding for query")
	}

	results, err := s.manager.config.Client.SearchVectors(
		ctx,
		s.collectionName,
		embeddings[0],
		ptr.From(options.TopK),
		0.1,
	)
	if err != nil {
		return nil, fmt.Errorf("[Retrieve] failed to search vectors: %w", err)
	}

	logs.CtxInfof(ctx, "OceanBase returned %d results", len(results))

	documents := make([]*schema.Document, 0, len(results))
	for _, result := range results {
		metadata, err := JSONToMetadata(result.Metadata)
		if err != nil {
			logs.CtxWarnf(ctx, "Failed to parse metadata for result %s: %v", result.VectorID, err)
			metadata = make(map[string]interface{})
		}

		doc := &schema.Document{
			ID:       result.VectorID,
			Content:  result.Content,
			MetaData: metadata,
		}

		similarityScore := result.SimilarityScore
		logs.CtxInfof(ctx, "Setting score for document %s: %f", result.VectorID, similarityScore)
		doc.WithScore(similarityScore)

		documents = append(documents, doc)
	}

	sort.Slice(documents, func(i, j int) bool {
		return documents[i].Score() > documents[j].Score()
	})

	if len(documents) > 0 {
		s.normalizeScores(documents)
	}

	if len(documents) > ptr.From(options.TopK) {
		documents = documents[:ptr.From(options.TopK)]
	}

	logs.CtxInfof(ctx, "Retrieved %d documents from OceanBase collection: %s", len(documents), s.collectionName)
	for i, doc := range documents {
		logs.CtxInfof(ctx, "Document %d: ID=%s, Score=%.6f, Content=%s",
			i+1, doc.ID, doc.Score(), doc.Content[:min(len(doc.Content), 50)])
	}

	return documents, nil
}

func (s *oceanbaseSearchStore) Delete(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}

	startTime := time.Now()
	defer func() {
		logs.CtxInfof(ctx, "Delete operation completed in %v for %d documents",
			time.Since(startTime), len(ids))
	}()

	batchSize := s.manager.config.BatchSize
	for i := 0; i < len(ids); i += batchSize {
		end := i + batchSize
		if end > len(ids) {
			end = len(ids)
		}

		batch := ids[i:end]
		if err := s.deleteBatch(ctx, batch); err != nil {
			return fmt.Errorf("[Delete] failed to delete batch: %w", err)
		}
	}

	logs.CtxInfof(ctx, "Deleted %d documents from OceanBase collection: %s", len(ids), s.collectionName)
	return nil
}

func (s *oceanbaseSearchStore) batchInsertWithRetry(ctx context.Context, data []*vectorData) error {
	maxRetries := s.manager.config.MaxRetries
	retryDelay := s.manager.config.RetryDelay
	batchSize := s.manager.config.BatchSize

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := s.batchInsert(ctx, data, batchSize)
		if err == nil {
			return nil
		} else if attempt == maxRetries {
			return fmt.Errorf("batch insert failed after %d attempts: %w", maxRetries, err)
		}

		logs.CtxWarnf(ctx, "Batch insert attempt %d failed, retrying in %v: %v", attempt, retryDelay, err)
		time.Sleep(retryDelay)
	}

	return nil
}

func (s *oceanbaseSearchStore) batchInsert(ctx context.Context, data []*vectorData, batchSize int) error {
	var vectors []oceanbase.VectorResult
	for _, item := range data {
		embedding64 := make([]float64, len(item.Embedding))
		for i, v := range item.Embedding {
			embedding64[i] = float64(v)
		}

		var metadata map[string]interface{}
		if item.Metadata != "" && item.Metadata != "{}" {
			if err := json.Unmarshal([]byte(item.Metadata), &metadata); err != nil {
				logs.CtxWarnf(ctx, "Failed to parse metadata for %s: %v", item.VectorID, err)
				metadata = make(map[string]interface{})
			}
		} else {
			metadata = make(map[string]interface{})
		}

		metadataStr := "{}"
		if len(metadata) > 0 {
			if metadataBytes, err := json.Marshal(metadata); err == nil {
				metadataStr = string(metadataBytes)
			}
		}

		vectors = append(vectors, oceanbase.VectorResult{
			VectorID:  item.VectorID,
			Content:   item.Content,
			Metadata:  metadataStr,
			Embedding: embedding64,
			CreatedAt: time.Now(),
		})
	}

	return s.manager.config.Client.InsertVectors(ctx, s.collectionName, vectors)
}

func (s *oceanbaseSearchStore) searchVectorsWithRetry(ctx context.Context, queryEmbedding []float32, limit int, threshold float64) ([]*vectorResult, error) {
	maxRetries := s.manager.config.MaxRetries
	retryDelay := s.manager.config.RetryDelay

	for attempt := 1; attempt <= maxRetries; attempt++ {
		results, err := s.searchVectors(ctx, queryEmbedding, limit, threshold)
		if err == nil {
			return results, nil
		}

		if attempt == maxRetries {
			return nil, fmt.Errorf("search vectors failed after %d attempts: %w", maxRetries, err)
		}

		logs.CtxWarnf(ctx, "Search vectors attempt %d failed, retrying in %v: %v", attempt, retryDelay, err)
		time.Sleep(retryDelay)
	}

	return nil, nil
}

func (s *oceanbaseSearchStore) searchVectors(ctx context.Context, queryEmbedding []float32, limit int, threshold float64) ([]*vectorResult, error) {
	embedding64 := make([]float64, len(queryEmbedding))
	for i, v := range queryEmbedding {
		embedding64[i] = float64(v)
	}

	results, err := s.manager.config.Client.SearchVectors(ctx, s.collectionName, embedding64, limit, threshold)
	if err != nil {
		return nil, fmt.Errorf("failed to search vectors: %w", err)
	}

	var vectorResults []*vectorResult
	for _, result := range results {
		metadataStr := result.Metadata
		if metadataStr == "" {
			metadataStr = "{}"
		}

		vectorResults = append(vectorResults, &vectorResult{
			VectorID: result.VectorID,
			Content:  result.Content,
			Metadata: metadataStr,
			Distance: result.SimilarityScore,
		})
	}

	return vectorResults, nil
}

func (s *oceanbaseSearchStore) deleteBatch(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}

	for _, id := range ids {
		if err := s.manager.config.Client.DeleteVector(ctx, s.collectionName, id); err != nil {
			return fmt.Errorf("failed to delete vector %s: %w", id, err)
		}
	}

	return nil
}

func (s *oceanbaseSearchStore) normalizeScores(documents []*schema.Document) {
	if len(documents) == 0 {
		return
	}

	logs.CtxInfof(context.Background(), "Normalizing scores for %d documents", len(documents))

	for i := range documents {
		originalScore := documents[i].Score()
		logs.CtxInfof(context.Background(), "Document %d original score: %f", i+1, originalScore)

		if originalScore < 0 {
			documents[i].WithScore(0.0)
			logs.CtxInfof(context.Background(), "Document %d score adjusted from %f to 0.0", i+1, originalScore)
		} else if originalScore > 1 {
			documents[i].WithScore(1.0)
			logs.CtxInfof(context.Background(), "Document %d score adjusted from %f to 1.0", i+1, originalScore)
		} else {
			logs.CtxInfof(context.Background(), "Document %d score unchanged: %f", i+1, originalScore)
		}
	}

	logs.CtxInfof(context.Background(), "Score normalization completed")
}

type vectorData struct {
	VectorID  string
	Content   string
	Metadata  string
	Embedding []float32
}

type vectorResult struct {
	ID       int64   `json:"id"`
	VectorID string  `json:"vector_id"`
	Content  string  `json:"content"`
	Metadata string  `json:"metadata"`
	Distance float64 `json:"distance"`
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
