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
package impl

import (
	"os"

	"github.com/coze-dev/coze-studio/backend/infra/document/rerank"
	"github.com/coze-dev/coze-studio/backend/infra/document/rerank/impl/rrf"
	"github.com/coze-dev/coze-studio/backend/infra/document/rerank/impl/vikingdb"
)

type Reranker = rerank.Reranker

func New() Reranker {
	rerankerType := os.Getenv("RERANK_TYPE")
	switch rerankerType {
	case "vikingdb":
		return vikingdb.NewReranker(getVikingRerankerConfig())
	case "rrf":
		return rrf.NewRRFReranker(0)
	default:
		return rrf.NewRRFReranker(0)
	}
}

func getVikingRerankerConfig() *vikingdb.Config {
	return &vikingdb.Config{
		AK:     os.Getenv("VIKINGDB_RERANK_AK"),
		SK:     os.Getenv("VIKINGDB_RERANK_SK"),
		Domain: os.Getenv("VIKINGDB_RERANK_HOST"),
		Region: os.Getenv("VIKINGDB_RERANK_REGION"),
		Model:  os.Getenv("VIKINGDB_RERANK_MODEL"),
	}
}
