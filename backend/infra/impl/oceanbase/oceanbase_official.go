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
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type OceanBaseOfficialClient struct {
	db *gorm.DB
}

type VectorResult struct {
	VectorID        string    `json:"vector_id"`
	Content         string    `json:"content"`
	Metadata        string    `json:"metadata"`
	Embedding       []float64 `json:"embedding"`
	SimilarityScore float64   `json:"similarity_score"`
	Distance        float64   `json:"distance"`
	CreatedAt       time.Time `json:"created_at"`
}

type CollectionInfo struct {
	Name      string `json:"name"`
	Dimension int    `json:"dimension"`
	IndexType string `json:"index_type"`
}

func NewOceanBaseOfficialClient(dsn string) (*OceanBaseOfficialClient, error) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to OceanBase: %v", err)
	}

	client := &OceanBaseOfficialClient{db: db}

	if err := client.setVectorParameters(); err != nil {
		log.Printf("Warning: Failed to set vector parameters: %v", err)
	}

	return client, nil
}

func (c *OceanBaseOfficialClient) setVectorParameters() error {
	params := map[string]string{
		"ob_vector_memory_limit_percentage": "30",
		"ob_query_timeout":                  "86400000000",
		"max_allowed_packet":                "1073741824",
	}

	for param, value := range params {
		if err := c.db.Exec(fmt.Sprintf("SET GLOBAL %s = %s", param, value)).Error; err != nil {
			log.Printf("Warning: Failed to set %s: %v", param, err)
		}
	}

	return nil
}

func (c *OceanBaseOfficialClient) CreateCollection(ctx context.Context, collectionName string, dimension int) error {
	createTableSQL := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS %s (
			vector_id VARCHAR(255) PRIMARY KEY,
			content TEXT NOT NULL,
			metadata JSON,
			embedding VECTOR(%d) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_created_at (created_at),
			INDEX idx_content (content(100))
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`, collectionName, dimension)

	if err := c.db.WithContext(ctx).Exec(createTableSQL).Error; err != nil {
		return fmt.Errorf("failed to create table: %v", err)
	}

	createIndexSQL := fmt.Sprintf(`
		CREATE VECTOR INDEX idx_%s_embedding ON %s(embedding)
		WITH (distance=cosine, type=hnsw, lib=vsag, m=16, ef_construction=200, ef_search=64)
	`, collectionName, collectionName)

	if err := c.db.WithContext(ctx).Exec(createIndexSQL).Error; err != nil {
		log.Printf("Warning: Failed to create HNSW vector index, will use exact search: %v", err)
	}

	log.Printf("Successfully created collection '%s' with dimension %d", collectionName, dimension)
	return nil
}

func (c *OceanBaseOfficialClient) InsertVectors(ctx context.Context, collectionName string, vectors []VectorResult) error {
	if len(vectors) == 0 {
		return nil
	}

	const batchSize = 100
	for i := 0; i < len(vectors); i += batchSize {
		end := i + batchSize
		if end > len(vectors) {
			end = len(vectors)
		}
		batch := vectors[i:end]

		if err := c.insertBatch(ctx, collectionName, batch); err != nil {
			return fmt.Errorf("failed to insert vectors batch %d-%d: %v", i, end-1, err)
		}
	}

	log.Printf("Successfully inserted %d vectors into collection '%s'", len(vectors), collectionName)
	return nil
}

func (c *OceanBaseOfficialClient) insertBatch(ctx context.Context, collectionName string, batch []VectorResult) error {
	placeholders := make([]string, len(batch))
	values := make([]interface{}, 0, len(batch)*5)

	for j, vector := range batch {
		placeholders[j] = "(?, ?, ?, ?, NOW())"
		values = append(values,
			vector.VectorID,
			vector.Content,
			vector.Metadata,
			c.vectorToString(vector.Embedding),
		)
	}

	sql := fmt.Sprintf(`
		INSERT INTO %s (vector_id, content, metadata, embedding, created_at)
		VALUES %s
		ON DUPLICATE KEY UPDATE
			content = VALUES(content),
			metadata = VALUES(metadata),
			embedding = VALUES(embedding),
			updated_at = NOW()
	`, collectionName, strings.Join(placeholders, ","))

	return c.db.WithContext(ctx).Exec(sql, values...).Error
}

func (c *OceanBaseOfficialClient) SearchVectors(
	ctx context.Context,
	collectionName string,
	queryVector []float64,
	topK int,
	threshold float64,
) ([]VectorResult, error) {

	var count int64
	if err := c.db.WithContext(ctx).Table(collectionName).Count(&count).Error; err != nil {
		return nil, fmt.Errorf("collection '%s' does not exist: %v", collectionName, err)
	}

	if count == 0 {
		log.Printf("Collection '%s' is empty", collectionName)
		return []VectorResult{}, nil
	}

	collectionInfo, err := c.getCollectionInfo(ctx, collectionName)
	if err != nil {
		return nil, fmt.Errorf("failed to get collection info: %v", err)
	}

	log.Printf("[Debug] Collection info: name=%s, dimension=%d, index_type=%s",
		collectionName, collectionInfo.Dimension, collectionInfo.IndexType)

	query, params, err := c.buildOptimizedSearchQuery(collectionName, queryVector, topK)
	if err != nil {
		return nil, fmt.Errorf("failed to build search query: %v", err)
	}

	log.Printf("[Debug] Built optimized query: %s", query)
	log.Printf("[Debug] Query params count: %d", len(params))

	var results []VectorResult
	rows, err := c.db.WithContext(ctx).Raw(query, params...).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to execute search query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var result VectorResult
		var embeddingStr string
		if err := rows.Scan(
			&result.VectorID,
			&result.Content,
			&result.Metadata,
			&embeddingStr,
			&result.SimilarityScore,
			&result.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan result row: %v", err)
		}
		results = append(results, result)
	}

	log.Printf("[Debug] Raw search results count: %d", len(results))

	finalResults := c.postProcessResults(results, topK, threshold)

	log.Printf("[Debug] Final results count: %d", len(finalResults))
	return finalResults, nil
}

func (c *OceanBaseOfficialClient) buildOptimizedSearchQuery(
	collectionName string,
	queryVector []float64,
	topK int,
) (string, []interface{}, error) {

	queryVectorStr := c.vectorToString(queryVector)

	similarityExpr := "GREATEST(0, LEAST(1, 1 - COSINE_DISTANCE(embedding, ?)))"
	orderBy := "COSINE_DISTANCE(embedding, ?) ASC"

	query := fmt.Sprintf(`
		SELECT
			vector_id,
			content,
			metadata,
			embedding,
			%s as similarity_score,
			created_at
		FROM %s
		ORDER BY %s
		APPROXIMATE
		LIMIT %d
	`, similarityExpr, collectionName, orderBy, topK*2)

	params := []interface{}{
		queryVectorStr,
		queryVectorStr,
	}

	return query, params, nil
}

func (c *OceanBaseOfficialClient) getCollectionInfo(ctx context.Context, collectionName string) (*CollectionInfo, error) {
	var dimension int

	dimQuery := `
		SELECT
			SUBSTRING_INDEX(SUBSTRING_INDEX(COLUMN_TYPE, '(', -1), ')', 1) as dimension
		FROM INFORMATION_SCHEMA.COLUMNS
		WHERE TABLE_NAME = ? AND COLUMN_NAME = 'embedding'
	`

	if err := c.db.WithContext(ctx).Raw(dimQuery, collectionName).Scan(&dimension).Error; err != nil {
		return nil, fmt.Errorf("failed to get vector dimension: %v", err)
	}

	var indexType string
	indexQuery := `
		SELECT INDEX_TYPE
		FROM INFORMATION_SCHEMA.STATISTICS
		WHERE TABLE_NAME = ? AND INDEX_NAME LIKE 'idx_%_embedding'
	`

	if err := c.db.WithContext(ctx).Raw(indexQuery, collectionName).Scan(&indexType).Error; err != nil {
		indexType = "none"
	}

	return &CollectionInfo{
		Name:      collectionName,
		Dimension: dimension,
		IndexType: indexType,
	}, nil
}

func (c *OceanBaseOfficialClient) vectorToString(vector []float64) string {
	if len(vector) == 0 {
		return "[]"
	}

	parts := make([]string, len(vector))
	for i, v := range vector {
		parts[i] = fmt.Sprintf("%.6f", v)
	}
	return "[" + strings.Join(parts, ",") + "]"
}

func (c *OceanBaseOfficialClient) postProcessResults(results []VectorResult, topK int, threshold float64) []VectorResult {
	if len(results) == 0 {
		return results
	}

	filtered := make([]VectorResult, 0, len(results))
	for _, result := range results {
		if result.SimilarityScore >= threshold {
			filtered = append(filtered, result)
		}
	}

	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].SimilarityScore > filtered[j].SimilarityScore
	})

	if len(filtered) > topK {
		filtered = filtered[:topK]
	}

	log.Printf("[Debug] Post-processed results: %d results with threshold %.3f", len(filtered), threshold)
	return filtered
}

func (c *OceanBaseOfficialClient) GetDB() *gorm.DB {
	return c.db
}

func (c *OceanBaseOfficialClient) DebugCollectionData(ctx context.Context, collectionName string) error {
	var count int64
	if err := c.db.WithContext(ctx).Table(collectionName).Count(&count).Error; err != nil {
		log.Printf("[Debug] Collection '%s' does not exist: %v", collectionName, err)
		return err
	}
	log.Printf("[Debug] Collection '%s' exists with %d vectors", collectionName, count)

	log.Printf("[Debug] Sample data from collection '%s':", collectionName)
	rows, err := c.db.WithContext(ctx).Raw(`
		SELECT vector_id, content, created_at
		FROM ` + collectionName + `
		ORDER BY created_at DESC
		LIMIT 5
	`).Rows()
	if err != nil {
		log.Printf("[Debug] Failed to get sample data: %v", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var vectorID, content string
			var createdAt time.Time
			if err := rows.Scan(&vectorID, &content, &createdAt); err != nil {
				log.Printf("[Debug] Failed to scan sample row: %v", err)
				continue
			}
			log.Printf("[Debug] Sample: ID=%s, Content=%s, Created=%s", vectorID, content[:min(50, len(content))], createdAt)
		}
	}

	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
