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

	"gorm.io/gorm"
)

type OceanBaseClient struct {
	official *OceanBaseOfficialClient
}

func NewOceanBaseClient(dsn string) (*OceanBaseClient, error) {
	official, err := NewOceanBaseOfficialClient(dsn)
	if err != nil {
		return nil, err
	}

	return &OceanBaseClient{official: official}, nil
}

func (c *OceanBaseClient) CreateCollection(ctx context.Context, collectionName string, dimension int) error {
	return c.official.CreateCollection(ctx, collectionName, dimension)
}

func (c *OceanBaseClient) InsertVectors(ctx context.Context, collectionName string, vectors []VectorResult) error {
	return c.official.InsertVectors(ctx, collectionName, vectors)
}

func (c *OceanBaseClient) SearchVectors(ctx context.Context, collectionName string, queryVector []float64, topK int, threshold float64) ([]VectorResult, error) {
	return c.official.SearchVectors(ctx, collectionName, queryVector, topK, threshold)
}

func (c *OceanBaseClient) SearchVectorsWithStrategy(ctx context.Context, collectionName string, queryVector []float64, topK int, threshold float64, strategy SearchStrategy) ([]VectorResult, error) {
	return c.official.SearchVectors(ctx, collectionName, queryVector, topK, threshold)
}

func (c *OceanBaseClient) GetDB() *gorm.DB {
	return c.official.GetDB()
}

func (c *OceanBaseClient) DebugCollectionData(ctx context.Context, collectionName string) error {
	return c.official.DebugCollectionData(ctx, collectionName)
}

func (c *OceanBaseClient) BatchInsertVectors(ctx context.Context, collectionName string, vectors []VectorResult) error {
	return c.official.InsertVectors(ctx, collectionName, vectors)
}

func (c *OceanBaseClient) DeleteVector(ctx context.Context, collectionName string, vectorID string) error {
	return c.official.GetDB().WithContext(ctx).Table(collectionName).Where("vector_id = ?", vectorID).Delete(nil).Error
}

func (c *OceanBaseClient) InitDatabase(ctx context.Context) error {
	var result int
	return c.official.GetDB().WithContext(ctx).Raw("SELECT 1").Scan(&result).Error
}

func (c *OceanBaseClient) DropCollection(ctx context.Context, collectionName string) error {
	return c.official.GetDB().WithContext(ctx).Migrator().DropTable(collectionName)
}

type SearchStrategy interface {
	GetThreshold() float64
}

type DefaultSearchStrategy struct{}

func NewDefaultSearchStrategy() *DefaultSearchStrategy {
	return &DefaultSearchStrategy{}
}

func (s *DefaultSearchStrategy) GetThreshold() float64 {
	return 0.0
}
