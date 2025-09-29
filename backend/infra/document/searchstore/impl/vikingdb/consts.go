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

package vikingdb

import (
	"fmt"

	"github.com/volcengine/volc-sdk-golang/service/vikingdb"

	embcontract "github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type VikingEmbeddingModelName string

const (
	ModelNameDoubaoEmbedding       VikingEmbeddingModelName = "doubao-embedding"
	ModelNameDoubaoEmbeddingLarge  VikingEmbeddingModelName = "doubao-embedding-large"
	ModelNameDoubaoEmbeddingVision VikingEmbeddingModelName = "doubao-embedding-vision"
	ModelNameBGELargeZH            VikingEmbeddingModelName = "bge-large-zh"
	ModelNameBGEM3                 VikingEmbeddingModelName = "bge-m3"
	ModelNameBGEVisualizedM3       VikingEmbeddingModelName = "bge-visualized-m3"

	//ModelNameDoubaoEmbeddingAndM3      VikingEmbeddingModelName = "doubao-embedding-and-m3"
	//ModelNameDoubaoEmbeddingLargeAndM3 VikingEmbeddingModelName = "doubao-embedding-large-and-m3"
	//ModelNameBGELargeZHAndM3           VikingEmbeddingModelName = "bge-large-zh-and-m3"
)

func (v VikingEmbeddingModelName) Dimensions() int64 {
	switch v {
	case ModelNameDoubaoEmbedding, ModelNameDoubaoEmbeddingVision:
		return 2048
	case ModelNameDoubaoEmbeddingLarge:
		return 4096
	case ModelNameBGELargeZH, ModelNameBGEM3, ModelNameBGEVisualizedM3:
		return 1024
	default:
		return 0
	}
}

func (v VikingEmbeddingModelName) ModelVersion() *string {
	switch v {
	case ModelNameDoubaoEmbedding:
		return ptr.Of("240515")
	case ModelNameDoubaoEmbeddingLarge:
		return ptr.Of("240915")
	case ModelNameDoubaoEmbeddingVision:
		return ptr.Of("250328")
	default:
		return nil
	}
}

func (v VikingEmbeddingModelName) SupportStatus() embcontract.SupportStatus {
	switch v {
	case ModelNameDoubaoEmbedding, ModelNameDoubaoEmbeddingLarge, ModelNameDoubaoEmbeddingVision, ModelNameBGELargeZH, ModelNameBGEVisualizedM3:
		return embcontract.SupportDense
	case ModelNameBGEM3:
		return embcontract.SupportDenseAndSparse
	default:
		return embcontract.SupportDense
	}
}

type IndexType string

const (
	IndexTypeHNSW       IndexType = vikingdb.HNSW
	IndexTypeHNSWHybrid IndexType = vikingdb.HNSW_HYBRID
	IndexTypeFlat       IndexType = vikingdb.FLAT
	IndexTypeIVF        IndexType = vikingdb.IVF
	IndexTypeDiskANN    IndexType = vikingdb.DiskANN
)

type IndexDistance string

const (
	IndexDistanceIP     IndexDistance = vikingdb.IP
	IndexDistanceL2     IndexDistance = vikingdb.L2
	IndexDistanceCosine IndexDistance = vikingdb.COSINE
)

type IndexQuant string

const (
	IndexQuantInt8  IndexQuant = vikingdb.Int8
	IndexQuantFloat IndexQuant = vikingdb.Float
	IndexQuantFix16 IndexQuant = vikingdb.Fix16
	IndexQuantPQ    IndexQuant = vikingdb.PQ
)

const (
	vikingEmbeddingUseDense           = "return_dense"
	vikingEmbeddingUseSparse          = "return_sparse"
	vikingEmbeddingRespSentenceDense  = "sentence_dense_embedding"
	vikingEmbeddingRespSentenceSparse = "sentence_sparse_embedding"
	vikingIndexName                   = "opencoze_index"
)

const (
	errCollectionNotFound = "collection not found"
	errIndexNotFound      = "index not found"
)

func denseFieldName(name string) string {
	return fmt.Sprintf("dense_%s", name)
}
